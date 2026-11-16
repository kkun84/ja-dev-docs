-- 「訳し終えて公開待ち」(translated)の状態を足す。SQLiteはCHECK制約を変えられないので、表を作り直す。
CREATE TABLE requests_new (
  page TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN ('queued', 'translating', 'translated', 'done', 'failed')),
  first_requested_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  error TEXT
);
INSERT INTO requests_new SELECT page, count, state, first_requested_at, updated_at, error FROM requests;
DROP TABLE requests;
ALTER TABLE requests_new RENAME TO requests;
CREATE INDEX requests_order ON requests (state, count DESC, first_requested_at);
CREATE INDEX requests_created ON requests (first_requested_at);

-- 翻訳モデルの1日の呼び出し回数。Googleの上限の応答だけに頼らず、自分でも数えて止める。
-- day は無料枠が戻る太平洋時間の日付。
CREATE TABLE usage (
  day TEXT NOT NULL,
  model TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, model)
);
