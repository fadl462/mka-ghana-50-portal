ALTER TABLE submissions ADD COLUMN official_decision TEXT NOT NULL DEFAULT 'pending' CHECK(official_decision IN ('pending','winner','runner_up','finalist','not_selected'));
