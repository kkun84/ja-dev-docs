#!/usr/bin/env python3
"""試訳用のスクリプト。

原文のMarkdownを取得し、訳してはいけない部分を退避してからGeminiで訳し、
退避した部分を戻して、構造が原文と一致するかを検査する。
結果は trial/out/ に書き出す。
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

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SOURCES = {
    "vscode": "https://raw.githubusercontent.com/microsoft/vscode-docs/main/{path}",
    "github": "https://raw.githubusercontent.com/github/docs/main/{path}",
}

INSTRUCTIONS = """\
You translate English software documentation written in Markdown into Japanese.

Output only the translated Markdown. Do not add explanations, notes, or code fences around the output.

Placeholders:
- Tokens of the form ⟦X12⟧ or ⟦X12:hint⟧ stand for content that must not be translated, such as code, URLs, and template tags.
- Copy every placeholder exactly as it appears, including the brackets and any hint after the colon. Never translate, split, merge, or drop a placeholder.
- The hint after the colon tells you what the placeholder stands for. For example, ⟦L3:variables.product.github⟧ stands for the product name "GitHub". Use the hint only to understand the sentence.
- Every placeholder must appear in the output exactly as many times as in the input.

Markdown structure:
- Keep every heading, list item, table row, blockquote marker, alert marker such as [!NOTE], and blank line in the same place.
- Keep the same heading levels, list markers, numbering, and indentation.
- Translate link text, but keep the link target placeholder unchanged.

Style:
- Use polite form (です・ます調). For steps, end sentences with 〜します. Use 〜してください only for warnings or required actions.
- Keep product names, feature names, and UI labels in English as they appear in the source. Keep bold or other formatting on UI labels exactly as in the source.
- Keep the words "pull request" and "issue" in English.
- Do not put a space between Japanese characters and alphanumeric characters.
- Write numbers and units without a space, for example 10GB.
"""

FENCE_RE = re.compile(r"^(\s*)(`{3,}|~{3,})")
PLACEHOLDER_RE = re.compile(r"⟦[A-Z]\d+(?::[^⟧]*)?⟧")
HEADING_RE = re.compile(r"^(#{1,6})\s")
LIST_RE = re.compile(r"^\s*(?:[-*+]|\d+\.)\s")
TABLE_RE = re.compile(r"^\s*\|")


class Masker:
    """訳してはいけない部分を ⟦種別番号⟧ の形の目印に置き換え、あとで戻す。"""

    def __init__(self):
        self.store = {}
        self.count = 0

    def put(self, kind, original, hint=None):
        self.count += 1
        token = f"⟦{kind}{self.count}" + (f":{hint}" if hint else "") + "⟧"
        self.store[token] = original
        return token

    def mask(self, text):
        text = self._mask_fences(text)
        text = re.sub(r"<!--.*?-->", lambda m: self.put("H", m.group(0)), text, flags=re.S)
        text = re.sub(r"\{%-?.*?-?%\}|\{\{.*?\}\}", self._liquid, text, flags=re.S)
        text = re.sub(r"(`+)(?!`)(.+?)(?<!`)\1(?!`)", lambda m: self.put("I", m.group(0)), text)
        text = re.sub(r"(\]\()([^)\s]+)((?:\s+\"[^\"]*\")?\))", lambda m: m.group(1) + self.put("U", m.group(2)) + m.group(3), text)
        text = re.sub(r"^(\s*\[[^\]]+\]:\s+)(\S+)", lambda m: m.group(1) + self.put("U", m.group(2)), text, flags=re.M)
        text = re.sub(r"<https?://[^>]+>", lambda m: self.put("U", m.group(0)), text)
        return text

    def _liquid(self, m):
        tag = m.group(0)
        data = re.match(r"\{%-?\s*data\s+([\w.\-]+)\s*-?%\}", tag)
        return self.put("L", tag, data.group(1) if data else None)

    def _mask_fences(self, text):
        out, block, fence, indent = [], [], None, ""
        for line in text.split("\n"):
            if fence is None:
                m = FENCE_RE.match(line)
                if m:
                    indent, fence, block = m.group(1), m.group(2), [line]
                else:
                    out.append(line)
            else:
                block.append(line)
                stripped = line.strip()
                if stripped.startswith(fence) and set(stripped) <= {fence[0]}:
                    # 目印の前に字下げを付けるので、保存する1行目からは字下げを除く。
                    block[0] = block[0][len(indent):]
                    out.append(indent + self.put("C", "\n".join(block)))
                    fence = None
        if fence is not None:
            out.extend(block)
        return "\n".join(out)

    def unmask(self, text):
        # 後から作った目印の中身に、先に作った目印が入っていることがあるので、逆順に戻す。
        for token, original in reversed(self.store.items()):
            text = text.replace(token, original)
        return text


def split_front_matter(text):
    m = re.match(r"\A---\n.*?\n---\n", text, flags=re.S)
    if m:
        return m.group(0), text[m.end():]
    return "", text


def structure(text):
    """コードブロックを退避済みの本文から、見出し、リスト項目、表の行を数える。"""
    headings, lists, tables = [], 0, 0
    for line in text.split("\n"):
        h = HEADING_RE.match(line)
        if h:
            headings.append(len(h.group(1)))
        if LIST_RE.match(line):
            lists += 1
        if TABLE_RE.match(line):
            tables += 1
    return {"headings": headings, "list_items": lists, "table_rows": tables}


def check(source_masked, translated_masked):
    errors = []
    src_tokens = PLACEHOLDER_RE.findall(source_masked)
    out_tokens = PLACEHOLDER_RE.findall(translated_masked)
    for token in sorted(set(src_tokens) | set(out_tokens)):
        a, b = src_tokens.count(token), out_tokens.count(token)
        if a != b:
            errors.append(f"placeholder {token}: source {a}, translation {b}")
    s, t = structure(source_masked), structure(translated_masked)
    for key in s:
        if s[key] != t[key]:
            errors.append(f"{key}: source {s[key]}, translation {t[key]}")
    return errors


def call_gemini(spec, api_key, text, retries=3):
    # specは「モデル名」か「モデル名@推論の量」。推論の量はlow、mediumなど。
    model, _, level = spec.partition("@")
    config = {"maxOutputTokens": 65536}
    if level:
        config["thinkingConfig"] = {"thinkingLevel": level}
    body = {
        "systemInstruction": {"parts": [{"text": INSTRUCTIONS}]},
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": config,
    }
    request = urllib.request.Request(
        GEMINI_URL.format(model=model),
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
    )
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=600) as response:
                return json.load(response)
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")
            if e.code in (429, 500, 503) and attempt < retries:
                time.sleep(retry_delay(detail, attempt))
                continue
            raise RuntimeError(f"HTTP {e.code}: {detail[:2000]}") from None


def retry_delay(detail, attempt):
    m = re.search(r'"retryDelay":\s*"(\d+)s"', detail)
    return int(m.group(1)) + 1 if m else 30 * (attempt + 1)


def response_text(data):
    candidate = (data.get("candidates") or [{}])[0]
    parts = candidate.get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    return text, candidate.get("finishReason")


def fetch(source, path):
    with urllib.request.urlopen(SOURCES[source].format(path=path), timeout=60) as response:
        return response.read().decode()


def translate_once(spec, api_key, masked, dry_run):
    started = time.time()
    result = {"spec": spec}
    try:
        if dry_run:
            data = {"candidates": [{"content": {"parts": [{"text": masked}]}, "finishReason": "STOP"}]}
        else:
            data = call_gemini(spec, api_key, masked)
        text, finish = response_text(data)
        result["text"] = text
        result["finish_reason"] = finish
        result["usage"] = data.get("usageMetadata")
        result["errors"] = check(masked, text)
        if finish not in ("STOP", None):
            result["errors"].append(f"finish reason: {finish}")
    except Exception as e:
        result["errors"] = [f"request failed: {e}"]
    result["seconds"] = round(time.time() - started, 1)
    return result


def keep_trailing_newlines(source, translated):
    # モデルは末尾の改行を落とすことがあるので、原文の末尾の改行に揃える。
    tail = source[len(source.rstrip("\n")):]
    return translated.rstrip("\n") + tail


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", default="tools/trial/pages.txt")
    parser.add_argument("--models", nargs="*", default=[], help="それぞれ単独で訳すモデル。モデル名@推論の量 の形で推論の量を指定できる")
    parser.add_argument("--pipeline", nargs="+", help="構造検査に落ちたら次へ進む順に並べたモデル。同じモデルを2回並べると訳し直しになる")
    parser.add_argument("--out", default="trial/out")
    parser.add_argument("--dry-run", action="store_true", help="訳さずに、退避と検査だけを確かめる")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("GEMINI_API_KEY is not set")

    pages = [line.split() for line in Path(args.pages).read_text().splitlines() if line.strip() and not line.startswith("#")]
    out = Path(args.out)
    report = []

    for source, path in pages:
        original = fetch(source, path)
        front, body = split_front_matter(original)
        masker = Masker()
        masked = masker.mask(body)
        slug = f"{source}--" + path.replace("/", "--")

        runs = [[m] for m in args.models]
        if args.pipeline:
            runs.append(args.pipeline)
        for chain in runs:
            name = "pipeline" if len(chain) > 1 else chain[0]
            entry = {"source": source, "path": path, "model": name, "input_chars": len(body), "placeholders": masker.count, "attempts": []}
            model_dir = out / name
            model_dir.mkdir(parents=True, exist_ok=True)
            started = time.time()
            for spec in chain:
                attempt = translate_once(spec, api_key, masked, args.dry_run)
                entry["attempts"].append({k: v for k, v in attempt.items() if k != "text"})
                if not args.dry_run:
                    time.sleep(10)
                if not attempt["errors"]:
                    break
            entry["errors"] = attempt["errors"]
            entry["used"] = spec
            text = attempt.get("text")
            if text is not None:
                (model_dir / (slug + ".masked.txt")).write_text(text)
                restored = keep_trailing_newlines(body, masker.unmask(text))
                if args.dry_run and restored != body:
                    entry["errors"].append("dry run: unmask did not restore the source")
                (model_dir / slug).write_text(front + restored)
            entry["seconds"] = round(time.time() - started, 1)
            entry["ok"] = not entry["errors"]
            report.append(entry)
            print(json.dumps(entry, ensure_ascii=False), flush=True)

    out.mkdir(parents=True, exist_ok=True)
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
