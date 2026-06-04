-- Maintain search_vector on property insert/update
CREATE OR REPLACE FUNCTION properties_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'simple',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_search_vector_trigger ON properties;

CREATE TRIGGER properties_search_vector_trigger
BEFORE INSERT OR UPDATE OF title, description ON properties
FOR EACH ROW
EXECUTE FUNCTION properties_search_vector_update();

-- Backfill existing rows
UPDATE properties
SET search_vector = to_tsvector(
  'simple',
  coalesce(title, '') || ' ' || coalesce(description, '')
)
WHERE search_vector IS NULL;
