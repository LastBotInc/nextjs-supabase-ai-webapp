CREATE TABLE addresses (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name text,
    last_name text,
    company text,
    address1 text,
    address2 text,
    city text,
    province text,
    province_code text,
    country text,
    country_code text, -- ISO 3166-1 alpha-2
    zip text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE addresses IS 'Stores shipping and billing addresses.';

CREATE TABLE orders (
    id bigserial PRIMARY KEY,
    shopify_order_id bigint UNIQUE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    order_number text NOT NULL UNIQUE,
    total_price decimal(10,2) NOT NULL,
    subtotal_price decimal(10,2) NOT NULL,
    total_tax decimal(10,2),
    total_discounts decimal(10,2),
    currency text NOT NULL, -- ISO 4217 currency code
    financial_status text, -- e.g., 'pending', 'paid', 'refunded', 'voided'
    fulfillment_status text, -- e.g., 'fulfilled', 'unfulfilled', 'partially_fulfilled', 'scheduled'
    customer_note text,
    shipping_address_id bigint REFERENCES addresses(id) ON DELETE SET NULL,
    billing_address_id bigint REFERENCES addresses(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    cancelled_at timestamptz,
    cancel_reason text
);
COMMENT ON TABLE orders IS 'Stores customer order information.';
COMMENT ON COLUMN orders.shopify_order_id IS 'Shopify Order ID for syncing.';
COMMENT ON COLUMN orders.financial_status IS 'Payment status of the order.';
COMMENT ON COLUMN orders.fulfillment_status IS 'Fulfillment status of the order.';

CREATE TABLE order_line_items (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id bigint REFERENCES product_variants(id) ON DELETE SET NULL, -- Nullable if variant is deleted
    shopify_line_item_id bigint UNIQUE,
    title text NOT NULL, -- Denormalized product title
    variant_title text, -- Denormalized variant title
    sku text, -- Denormalized SKU
    quantity integer NOT NULL,
    price decimal(10,2) NOT NULL, -- Price per unit
    total_discount decimal(10,2) DEFAULT 0.00,
    taxable boolean DEFAULT true,
    grams integer, -- Weight of a single item in grams
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE order_line_items IS 'Stores individual line items for an order.';

-- Triggers for updated_at
CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_line_items_updated_at
BEFORE UPDATE ON order_line_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_orders_shopify_order_id ON orders(shopify_order_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_line_items_order_id ON order_line_items(order_id);
CREATE INDEX idx_order_line_items_variant_id ON order_line_items(variant_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Examples, adjust as needed)
-- Users can manage their own addresses
CREATE POLICY "Users can manage their own addresses" ON addresses
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own order line items (implicitly via orders)
CREATE POLICY "Users can view their own order_line_items" ON order_line_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_line_items.order_id AND auth.uid() = orders.user_id));

-- Admins can manage all
CREATE POLICY "Admins can manage addresses" ON addresses
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage order_line_items" ON order_line_items
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
