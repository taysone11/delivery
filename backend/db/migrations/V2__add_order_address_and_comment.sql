-- V2__add_order_address_and_comment.sql
-- Adds delivery address and customer comment fields to orders

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS comment TEXT;

UPDATE orders
SET address = 'Не указан'
WHERE address IS NULL;

ALTER TABLE orders
ALTER COLUMN address SET NOT NULL;
