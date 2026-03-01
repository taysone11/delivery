-- V1__init.sql
-- Initial schema for sushi delivery backend

-- Function for automatic updated_at refresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- roles
CREATE TABLE IF NOT EXISTS roles (
  id          SMALLSERIAL PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE, -- admin, client, courier
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- users
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30) UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- user_roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id      SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- products
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  category_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  weight_grams  INTEGER CHECK (weight_grams > 0),
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- cart
CREATE TABLE IF NOT EXISTS cart (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_cart_updated_at
BEFORE UPDATE ON cart
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id          BIGSERIAL PRIMARY KEY,
  cart_id     BIGINT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- orders (v1: cash only)
CREATE TABLE IF NOT EXISTS orders (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  cart_id        BIGINT REFERENCES cart(id) ON DELETE SET NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','confirmed','preparing','delivering','completed','canceled')),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'
                 CHECK (payment_method IN ('cash')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN ('pending','paid')),
  total          NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id          BIGSERIAL PRIMARY KEY,
  order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- indexes
CREATE INDEX IF NOT EXISTS ix_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS ix_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS ix_orders_user_status_created ON orders(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);
