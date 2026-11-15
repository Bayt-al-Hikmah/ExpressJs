DROP TABLE IF EXISTS quotes;
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author VARCHAR(100) NOT NULL,
    content VARCHAR(300) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Motivation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT author_min_length CHECK (char_length(btrim(author)) >= 3),
    CONSTRAINT content_not_empty CHECK (char_length(btrim(content)) > 0),
    CONSTRAINT category_not_empty CHECK (char_length(btrim(category)) > 0)
);
