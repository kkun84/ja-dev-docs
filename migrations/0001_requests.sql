-- 翻訳リクエストの順番待ちの列。同じページへのリクエストは1行にまとめ、件数を数える。
CREATE TABLE requests (
  page TEXT PRIMARY KEY,          -- 例: code.visualstudio.com/docs/agents/overview
  count INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN ('queued', 'translating', 'done', 'failed')),
  first_requested_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  error TEXT
);
CREATE INDEX requests_order ON requests (state, count DESC, first_requested_at);
