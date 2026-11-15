#!/usr/bin/env python3
"""試訳用のスクリプト。

原文のMarkdownを取得し、訳してはいけない部分を退避してからGeminiで訳し、
退避した部分を戻して、構造が原文と一致するかを検査する。
結果は trial/out/ に書き出す。
"""

import argparse
import random
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

INSTRUCTIONS_TEMPLATE = """\
You translate English software documentation written in Markdown into Japanese.

Output only the translated Markdown. Do not add explanations, notes, or code fences around the output.

Placeholders:
{placeholders}

Markdown structure:
- Keep every heading, list item, table row, blockquote marker, alert marker such as [!NOTE], and blank line in the same place.
- Keep the same heading levels, list markers, numbering, and indentation.
- Translate link text, but keep the link target unchanged.
- Never change anything inside backticks.

Style:
- Use polite form (です・ます調). For steps, end sentences with 〜します. Use 〜してください only for warnings or required actions.
- Keep product names, feature names, and UI labels in English as they appear in the source. Keep bold or other formatting on UI labels exactly as in the source.
- Keep the words "pull request" and "issue" in English.
- Do not put a space between Japanese characters and alphanumeric characters.
- Write numbers and units without a space, for example 10GB.
"""

PLACEHOLDER_TEXT = {
    "seq": """\
- Tokens of the form ⟦X12⟧ or ⟦X12:hint⟧ stand for content that must not be translated, such as code, URLs, and template tags.
- Copy every placeholder exactly as it appears, including the brackets and any hint after the colon. Never translate, split, merge, or drop a placeholder.
- The hint after the colon tells you what the placeholder stands for. For example, ⟦L3:variables.product.github⟧ stands for the product name "GitHub". Use the hint only to understand the sentence.
- Every placeholder must appear in the output exactly as many times as in the input.""",
    "rand": """\
- Tokens of the form ⟦K7QM⟧ stand for content that must not be translated, such as code, URLs, and template tags. The four characters are an arbitrary ID with no meaning.
- Copy every placeholder exactly as it appears, character for character. Never translate, split, merge, reorder the characters of, or drop a placeholder.
- Every placeholder must appear in the output exactly once for each time it appears in the input.""",
    "xml": """\
- Self-closing tags of the form <x id="K7QM"/> stand for content that must not be translated, such as code, URLs, and template tags. The ID is arbitrary and has no meaning.
- Copy every such tag exactly as it appears. Never translate, split, merge, change, or drop one.
- Every tag must appear in the output exactly once for each time it appears in the input.""",
}

# 取り違えやすい文字(I、L、O、U、0、1)を除いた30文字。
ID_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"
TOKEN_RE = {
    "seq": re.compile(r"⟦[A-Z]\d+(?::[^⟧]*)?⟧"),
    "rand": re.compile(r"⟦[^⟧\s]{1,12}⟧"),
    "xml": re.compile(r"<x\s+id=\"[^\"]{1,12}\"\s*/>"),
}


def base_style(style):
    # 「rand-min」は、IDの形はrandと同じで、行内コードとリンク先を退避せずに見せる形。
    return style.split("-")[0]


def instructions(style):
    return INSTRUCTIONS_TEMPLATE.format(placeholders=PLACEHOLDER_TEXT[base_style(style)])


VISIBLE_RE = {
    "inline code": re.compile(r"(`+)(?!`)(?:.+?)(?<!`)\1(?!`)"),
    "link target": re.compile(r"\]\((?P<v>[^)\s]+)"),
}

FENCE_RE = re.compile(r"^(\s*)(`{3,}|~{3,})")
HEADING_RE = re.compile(r"^(#{1,6})\s")
LIST_RE = re.compile(r"^\s*(?:[-*+]|\d+\.)\s")
TABLE_RE = re.compile(r"^\s*\|")


class Masker:
    """訳してはいけない部分を ⟦種別番号⟧ の形の目印に置き換え、あとで戻す。"""

    def __init__(self, style="seq", seed=None):
        self.style = style
        self.rng = random.Random(seed)
        self.store = {}
        self.count = 0

    def put(self, kind, original, hint=None):
        self.count += 1
        if self.style == "seq":
            token = f"⟦{kind}{self.count}" + (f":{hint}" if hint else "") + "⟧"
        else:
            ident = self._new_id()
            token = f"⟦{ident}⟧" if base_style(self.style) == "rand" else f'<x id="{ident}"/>'
        self.store[token] = original
        return token

    def _new_id(self):
        # どの2つのIDも2文字以上違うようにする。1文字の書き間違いを、どのIDのことか一意に決めて戻せるように。
        while True:
            ident = "".join(self.rng.choice(ID_ALPHABET) for _ in range(4))
            if all(distance(ident, t) >= 2 for t in self.ids()):
                return ident

    def ids(self):
        return [ident_of(t) for t in self.store]

    def repair(self, text):
        """存在しない目印のうち、1文字違いの目印が1つだけあるものを、その目印に直す。直した数を返す。"""
        if self.style == "seq":
            return text, 0
        known = set(self.store)
        fixed = 0

        def fix(m):
            nonlocal fixed
            token = m.group(0)
            if token in known:
                return token
            near = [t for t in known if distance(ident_of(token), ident_of(t)) <= 1]
            if len(near) == 1:
                fixed += 1
                return near[0]
            return token

        return TOKEN_RE[base_style(self.style)].sub(fix, text), fixed

    def mask(self, text):
        text = self._mask_fences(text)
        text = re.sub(r"<!--.*?-->", lambda m: self.put("H", m.group(0)), text, flags=re.S)
        text = re.sub(r"\{%-?.*?-?%\}|\{\{.*?\}\}", self._liquid, text, flags=re.S)
        if self.style.endswith("-min"):
            return text
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


def ident_of(token):
    m = re.search(r'⟦([^⟧]*)⟧|id="([^"]*)"', token)
    return m.group(1) or m.group(2) if m else token


def distance(a, b):
    """同じ長さならハミング距離、違う長さなら大きい値。"""
    if len(a) != len(b):
        return 99
    return sum(x != y for x, y in zip(a, b))


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


def visible(pattern, text):
    # 名前付きグループvがあればその部分を、無ければ一致した全体を取り出す。
    return sorted(m.group("v") if "v" in pattern.groupindex else m.group(0) for m in pattern.finditer(text))


def check(source_masked, translated_masked, style="seq"):
    errors = []
    src_tokens = TOKEN_RE[base_style(style)].findall(source_masked)
    out_tokens = TOKEN_RE[base_style(style)].findall(translated_masked)
    # 退避せずに見せた行内コードとリンク先も、原文と同じものが同じ数だけあるかを確かめる。
    for name, pattern in VISIBLE_RE.items():
        a, b = visible(pattern, source_masked), visible(pattern, translated_masked)
        if a != b:
            diff = {v: (a.count(v), b.count(v)) for v in set(a) | set(b) if a.count(v) != b.count(v)}
            errors.append(f"{name}: source/translation counts {dict(list(diff.items())[:5])}")
    for token in sorted(set(src_tokens) | set(out_tokens)):
        a, b = src_tokens.count(token), out_tokens.count(token)
        if a != b:
            errors.append(f"placeholder {token}: source {a}, translation {b}")
    s, t = structure(source_masked), structure(translated_masked)
    for key in s:
        if s[key] != t[key]:
            errors.append(f"{key}: source {s[key]}, translation {t[key]}")
    return errors


def call_gemini(spec, api_key, text, style, retries=3):
    # specは「モデル名」か「モデル名@推論の量」。推論の量はlow、mediumなど。
    model, _, level = spec.partition("@")
    config = {"maxOutputTokens": 65536}
    if level:
        config["thinkingConfig"] = {"thinkingLevel": level}
    body = {
        "systemInstruction": {"parts": [{"text": instructions(style)}]},
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


VARIABLE_RE = re.compile(r"\{%-?\s*data\s+variables\.([\w.\-]+)\s*-?%\}")


def expand_variables(source, text, cache):
    """{% data variables.X.Y %}を、data/variables/X.ymlのYの値に置き換える。

    製品名などの短い名詞なので、目印にせず文字のまま見せる。目印にすると、日本語で
    主語を省くときにモデルが目印ごと落とし、検査に落ちるため。値にLiquidを含むものは残す。
    """
    import yaml

    def value(m):
        file, *keys = m.group(1).split(".")
        if file not in cache:
            try:
                cache[file] = yaml.safe_load(fetch(source, f"data/variables/{file}.yml")) or {}
            except Exception:
                cache[file] = {}
        node = cache[file]
        for key in keys:
            node = node.get(key) if isinstance(node, dict) else None
        if isinstance(node, str) and "{%" not in node and "{{" not in node:
            return node
        return m.group(0)

    return VARIABLE_RE.sub(value, text)


def fetch(source, path):
    with urllib.request.urlopen(SOURCES[source].format(path=path), timeout=60) as response:
        return response.read().decode()


def translate_once(spec, api_key, masked, dry_run, masker):
    started = time.time()
    result = {"spec": spec}
    try:
        if dry_run:
            data = {"candidates": [{"content": {"parts": [{"text": masked}]}, "finishReason": "STOP"}]}
        else:
            data = call_gemini(spec, api_key, masked, masker.style)
        text, finish = response_text(data)
        result["raw_errors"] = len(check(masked, text, masker.style))
        text, result["repaired"] = masker.repair(text)
        result["text"] = text
        result["finish_reason"] = finish
        result["usage"] = data.get("usageMetadata")
        result["errors"] = check(masked, text, masker.style)
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
    parser.add_argument("--styles", nargs="+", default=["seq"], choices=["seq", "rand", "xml", "rand-min"], help="目印の形")
    parser.add_argument("--repeat", type=int, default=1, help="同じ条件で何回訳すか")
    parser.add_argument("--expand-variables", action="store_true", help="{% data variables.… %}を値に展開してから訳す")
    parser.add_argument("--dry-run", action="store_true", help="訳さずに、退避と検査だけを確かめる")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("GEMINI_API_KEY is not set")

    pages = [line.split() for line in Path(args.pages).read_text().splitlines() if line.strip() and not line.startswith("#")]
    out = Path(args.out)
    report = []
    variable_cache = {}

    for source, path in pages:
        original = fetch(source, path)
        front, body = split_front_matter(original)
        if args.expand_variables:
            body = expand_variables(source, body, variable_cache.setdefault(source, {}))
        slug = f"{source}--" + path.replace("/", "--")

        runs = [[m] for m in args.models]
        if args.pipeline:
            runs.append(args.pipeline)
        for style in args.styles:
            for rep in range(args.repeat):
                masker = Masker(style, seed=f"{slug}/{rep}")
                masked = masker.mask(body)
                for chain in runs:
                    name = "pipeline" if len(chain) > 1 else chain[0]
                    entry = {"source": source, "path": path, "model": name, "style": style, "repeat": rep, "input_chars": len(body), "placeholders": masker.count, "attempts": []}
                    model_dir = out / name / style
                    model_dir.mkdir(parents=True, exist_ok=True)
                    started = time.time()
                    for spec in chain:
                        attempt = translate_once(spec, api_key, masked, args.dry_run, masker)
                        entry["attempts"].append({k: v for k, v in attempt.items() if k != "text"})
                        if not args.dry_run:
                            time.sleep(10)
                        if not attempt["errors"]:
                            break
                    entry["errors"] = attempt["errors"]
                    entry["used"] = spec
                    text = attempt.get("text")
                    if text is not None:
                        stem = f"{slug}.{rep}"
                        (model_dir / (stem + ".masked.txt")).write_text(text)
                        restored = keep_trailing_newlines(body, masker.unmask(text))
                        if args.dry_run and restored != body:
                            entry["errors"].append("dry run: unmask did not restore the source")
                        (model_dir / stem).write_text(front + restored)
                    entry["seconds"] = round(time.time() - started, 1)
                    entry["ok"] = not entry["errors"]
                    report.append(entry)
                    print(json.dumps(entry, ensure_ascii=False), flush=True)

    out.mkdir(parents=True, exist_ok=True)
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
