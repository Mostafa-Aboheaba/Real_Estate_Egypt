-- M6: FAQ knowledge chunks in embeddings table + pgvector session tuning notes
ALTER TYPE "embedding_entity_type" ADD VALUE IF NOT EXISTS 'faq';

-- Documented ef_search for HNSW (set per session in app if needed):
-- SET hnsw.ef_search = 40;
