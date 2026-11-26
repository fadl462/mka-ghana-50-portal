-- Add a dedicated Tanzeem field while preserving the legacy category column.
-- The legacy column has a historical CHECK constraint limited to khuddam/atfal.
-- New submissions store the actual four-way Tanzeem in this column.
ALTER TABLE participants ADD COLUMN tanzeem TEXT;

UPDATE participants
SET tanzeem = category
WHERE tanzeem IS NULL;
