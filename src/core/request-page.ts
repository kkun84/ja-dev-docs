/**
 * 訳がまだ無いページの画面。サイトの部品を読み込まない、単独のHTMLにする。
 *
 * Workerを小さく保ち、訳したページが増えてもデプロイの上限に届かないようにするため。
 */

/** WorkerとサイトのHTMLに付ける、セキュリティのヘッダー。`public/_headers`と同じ内容にする。 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; " +
    "img-src 'self' https: data:; media-src 'self' https:; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin"
}

const escapeHtml = (text: string): string => text.replaceAll(/[&<>"']/g, (character) => `&#${character.codePointAt(0)};`)

/** 翻訳をリクエストする画面のHTML。`id`はページの場所、`siteKey`はTurnstileのサイトキー。 */
export const untranslatedPage = (id: string, siteKey: string): string => {
  const original = `https://${id}`
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>まだ日本語訳がありません | 開発者ドキュメント日本語訳(非公式)</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.8; color: #222; }
  a { color: #0b5cad; overflow-wrap: anywhere; }
  button { font-size: 1rem; padding: 0.5rem 1rem; margin-top: 0.5rem; }
  [role=status] { min-height: 1.8em; }
  @media (prefers-color-scheme: dark) { body { background: #17181c; color: #eee; } a { color: #8cc4ff; } }
</style>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
<p><a href="/">開発者ドキュメント日本語訳(非公式)</a></p>
<h1>まだ日本語訳がありません</h1>
<p><a href="${escapeHtml(original)}">${escapeHtml(original)}</a> の日本語訳は、まだありません。</p>
<p>翻訳をリクエストすると、順番に機械翻訳します。訳ができると、このページが自動で日本語訳に切り替わります。数分かかります。</p>
<div id="request" data-page="${escapeHtml(id)}">
  <div class="cf-turnstile" data-sitekey="${escapeHtml(siteKey)}" data-callback="onTurnstile"></div>
  <button type="button" disabled>翻訳をリクエストする</button>
  <p role="status" aria-live="polite"></p>
</div>
<p><a href="${escapeHtml(original)}">原文(英語)を読む</a></p>
<script>
  const root = document.getElementById("request");
  const page = root.dataset.page;
  const button = root.querySelector("button");
  const status = root.querySelector("[role=status]");
  let token = "";
  window.onTurnstile = (t) => { token = t; button.disabled = false; };
  const show = (s) => {
    if (s.published) { status.textContent = "日本語訳ができました。表示を切り替えます。"; location.reload(); return true; }
    if (s.error) status.textContent = s.error;
    else if (s.state === "queued") status.textContent = "順番待ちです(" + s.position + "番目)。このページを開いたまま待ってください。";
    else if (s.state === "translating") status.textContent = "翻訳中です。このページを開いたまま待ってください。";
    else if (s.state === "translated" || s.state === "done") status.textContent = "公開の準備をしています。";
    else if (s.state === "failed") status.textContent = "翻訳に失敗しました。もう一度リクエストできます。";
    return false;
  };
  let timer = 0;
  const poll = () => {
    if (timer) return;
    timer = setInterval(async () => {
      const s = await fetch("/api/status?page=" + encodeURIComponent(page)).then((r) => r.json()).catch(() => ({}));
      if (show(s) || s.state === "failed") { clearInterval(timer); timer = 0; }
    }, 15000);
  };
  fetch("/api/status?page=" + encodeURIComponent(page)).then((r) => r.json()).then((s) => {
    if (s.state && s.state !== "failed") { show(s); poll(); }
  }).catch(() => {});
  button.addEventListener("click", async () => {
    button.disabled = true;
    const res = await fetch("/api/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ page, token }) });
    const s = await res.json().catch(() => ({ error: "送信に失敗しました" }));
    if (!show(s) && res.ok) poll();
    if (!res.ok && window.turnstile) window.turnstile.reset();
  });
</script>
</body>
</html>
`
}
