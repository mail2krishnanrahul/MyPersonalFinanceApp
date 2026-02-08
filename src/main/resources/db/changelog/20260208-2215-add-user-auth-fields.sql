--liquibase formatted sql

--changeset rahul:add-user-auth-fields
ALTER TABLE users ADD COLUMN password VARCHAR(255);
ALTER TABLE users ADD COLUMN role VARCHAR(50);
ALTER TABLE users ADD COLUMN enabled BOOLEAN DEFAULT TRUE;

-- Update existing users (if any) to have default values
UPDATE users SET password = '$2a$10$Dk/i.tB.i.tB.i.tB.i.tB.i.tB.i.tB.i.tB.i.tB.i.tB.i.tB.', role = 'USER', enabled = TRUE WHERE password IS NULL;

-- Add not null constraints after populating defaults
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN enabled SET NOT NULL;
