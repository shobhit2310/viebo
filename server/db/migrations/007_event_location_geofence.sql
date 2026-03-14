-- Event geofence migration
-- Adds exact location coordinates and place id to events

ALTER TABLE events ADD COLUMN IF NOT EXISTS location_latitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_longitude DOUBLE PRECISION;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_place_id VARCHAR(255);
