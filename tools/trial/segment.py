#!/usr/bin/env python3
"""試訳用: Markdownの構造はプログラムが持ち、文の部分だけをモデルに訳させる。

見出しの記号、リストの記号、字下げ、表の区切り、コードブロックはモデルに渡さない。
モデルには文の断片をIDつきのJSONで渡し、同じIDのJSONで受け取る。
断片ごとに検査し、落ちた断片だけを訳し直す。それでも落ちたら別のモデルで訳し、
最後まで落ちた断片は原文のまま残す。構造は組み立てる側が持つので、壊れない。
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import translate as t  # noqa: E402

INSTRUCTIONS = """\
You translate English software documentation into Japanese.

The input is a JSON object with "segments", an ordered list of text fragments from one Markdown page. Read them all as one document for context, and translate each fragment.

Return a JSON object with "translations": one entry per input segment, in the same order, with the same "id".

Each fragment may contain:
- Placeholders of the form ⟦K7QM⟧. They stand for code, URLs, and template tags. Copy each one exactly, as many times as it appears in that fragment. The four characters are an arbitrary ID with no meaning.
- When the input has "placeholders", it maps each placeholder ID to the original content it stands for. Use it only to understand the sentence, for example to choose the right Japanese particle. Never copy those values into the output; write the placeholder instead.
- Markdown inline syntax: **bold**, _italic_, [link text](⟦K7QM⟧), and inline HTML tags. Keep the syntax and translate the text inside it. Keep the HTML tags unchanged.

Style:
- Use polite form (です・ます調). For steps, end sentences with 〜します. Use 〜してください only for warnings or required actions.
- Keep product names, feature names, and UI labels in English as they appear in the source.
- Keep the words "pull request" and "issue" in English.
- A fragment that is only a name or a code-like term may stay as it is.
"""

CJK = r"　-ヿ㐀-鿿＀-￯"
PREFIX_RE = re.compile(r"^(\s*(?:>\s?)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?)(.*)$")
TABLE_SEP_RE = re.compile(r"^\s*\|?\s*:?-{2,}")
HTML_TAG_RE = re.compile(r"</?[A-Za-z][^>]*>")
CHECKS = {
    "placeholder": t.TOKEN_RE["rand"],
    "html tag": HTML_TAG_RE,
}


def is_text(s):
    rest = HTML_TAG_RE.sub("", t.TOKEN_RE["rand"].sub("", s))
    return re.search(r"[A-Za-z]", rest) is not None


def segment(masked):
    """本文を、構造の部品と訳す断片の列に分ける。部品は文字列、断片は辞書。"""
    parts, segs = [], []

    def add(text):
        lead = text[: len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()):]
        core = text.strip()
        if core and is_text(core):
            seg = {"id": len(segs) + 1, "text": core}
            segs.append(seg)
            parts.extend([lead, seg, trail])
        else:
            parts.append(text)

    lines = masked.split("\n")
    for i, line in enumerate(lines):
        if i:
            parts.append("\n")
        stripped = line.strip()
        if stripped.startswith("|") and not TABLE_SEP_RE.match(line):
            cells = re.split(r"(?<!\\)(\|)", line)
            for cell in cells:
                if cell == "|":
                    parts.append(cell)
                else:
                    add(cell)
            continue
        m = PREFIX_RE.match(line)
        parts.append(m.group(1))
        add(m.group(2))
    return parts, segs


def tidy(text):
    """日本語と英数字や記号の間の空白を除く。"""
    text = re.sub(rf"(?<=[{CJK}]) +(?=\S)", "", text)
    return re.sub(rf"(?<=\S) +(?=[{CJK}])", "", text)


def seg_errors(src, out):
    if out is None:
        return ["missing"]
    if "\n" in out:
        return ["newline"]
    errors = []
    for name, pattern in {**CHECKS, **t.VISIBLE_RE}.items():
        a, b = t.visible(pattern, src), t.visible(pattern, out)
        if a != b:
            errors.append(name)
    return errors


def call(spec, api_key, segs, legend=None):
    model, _, level = spec.partition("@")
    schema = {
        "type": "OBJECT",
        "properties": {
            "translations": {
                "type": "ARRAY",
                "minItems": len(segs),
                "maxItems": len(segs),
                "items": {
                    "type": "OBJECT",
                    "properties": {"id": {"type": "INTEGER"}, "text": {"type": "STRING"}},
                    "required": ["id", "text"],
                    "propertyOrdering": ["id", "text"],
                },
            }
        },
        "required": ["translations"],
    }
    config = {"maxOutputTokens": 65536, "responseMimeType": "application/json", "responseSchema": schema}
    if level:
        config["thinkingConfig"] = {"thinkingLevel": level}
    body = {
        "systemInstruction": {"parts": [{"text": INSTRUCTIONS}]},
        "contents": [{"role": "user", "parts": [{"text": json.dumps({"placeholders": legend, "segments": segs} if legend else {"segments": segs}, ensure_ascii=False)}]}],
        "generationConfig": config,
    }
    request = urllib.request.Request(
        t.GEMINI_URL.format(model=model),
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=600) as response:
                data = json.load(response)
            break
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(t.retry_delay(detail, attempt))
                continue
            raise RuntimeError(f"HTTP {e.code}: {detail[:2000]}") from None
    text, finish = t.response_text(data)
    try:
        items = json.loads(text)["translations"]
    except Exception:
        items = []
    return {i["id"]: i["text"] for i in items if isinstance(i, dict) and "id" in i and isinstance(i.get("text"), str)}, finish, data.get("usageMetadata")


def translate_page(segs, chain, api_key, dry_run, legend=None):
    """断片を訳す。chainの順にモデルを使い、落ちた断片だけを次へ回す。"""
    done, log = {}, []
    pending = list(segs)
    for spec in chain:
        if not pending:
            break
        started = time.time()
        if dry_run:
            result, finish, usage = {s["id"]: s["text"] for s in pending}, "STOP", None
        else:
            try:
                sub = {k: v for k, v in (legend or {}).items() if any(f"⟦{k}⟧" in s["text"] for s in pending)}
                result, finish, usage = call(spec, api_key, pending, sub or None)
            except Exception as e:
                result, finish, usage = {}, f"error: {e}"[:300], None
            time.sleep(10)
        failed = []
        for s in pending:
            out = result.get(s["id"])
            if out is not None:
                out = tidy(out)
            errs = seg_errors(s["text"], out)
            if errs:
                failed.append({"id": s["id"], "errors": errs})
            else:
                done[s["id"]] = out
        log.append({"spec": spec, "sent": len(pending), "failed": failed, "finish": finish, "usage": usage, "seconds": round(time.time() - started, 1)})
        pending = [s for s in pending if s["id"] not in done]
    return done, log, [s["id"] for s in pending]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", default="tools/trial/pages.txt")
    parser.add_argument("--chain", nargs="+", required=True, help="落ちた断片を次へ回す順に並べたモデル")
    parser.add_argument("--repeat", type=int, default=1)
    parser.add_argument("--out", default="trial/seg")
    parser.add_argument("--legend", action="store_true", help="変数を展開せずに目印にし、目印が何を表すかを訳す文の外で渡す")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("GEMINI_API_KEY is not set")

    pages = [line.split() for line in Path(args.pages).read_text().splitlines() if line.strip() and not line.startswith("#")]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    report, cache = [], {}

    for source, path in pages:
        front, body = t.split_front_matter(t.fetch(source, path))
        if not args.legend:
            body = t.expand_variables(source, body, cache.setdefault(source, {}))
        slug = f"{source}--" + path.replace("/", "--")
        for rep in range(args.repeat):
            masker = t.Masker("rand", seed=f"{slug}/{rep}")
            masked = masker.mask(body)
            parts, segs = segment(masked)
            legend = None
            if args.legend:
                # 目印が表す中身。変数は値(製品名など)に展開したものを、それ以外は原文の記法のまま渡す。
                legend = {t.ident_of(k): t.expand_variables(source, v, cache.setdefault(source, {})) for k, v in masker.store.items()}
            done, log, left = translate_page(segs, args.chain, api_key, args.dry_run, legend)
            text = "".join(done.get(p["id"], p["text"]) if isinstance(p, dict) else p for p in parts)
            entry = {"path": path, "repeat": rep, "segments": len(segs), "left_in_english": left, "steps": log}
            if args.dry_run and masker.unmask(text) != body:
                entry["error"] = "dry run: reassembly did not restore the source"
            restored = t.keep_trailing_newlines(body, masker.unmask(text))
            (out / f"{slug}.{rep}").write_text(front + restored)
            report.append(entry)
            print(json.dumps({k: v for k, v in entry.items() if k != "steps"} | {"first_failed": len(log[0]["failed"]) if log else 0}, ensure_ascii=False), flush=True)

    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
