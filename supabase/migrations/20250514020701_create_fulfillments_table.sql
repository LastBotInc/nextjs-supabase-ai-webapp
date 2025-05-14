CREATE TABLE fulfillments (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shopify_fulfillment_id bigint UNIQUE,
    location_id bigint REFERENCES locations(id) ON DELETE SET NULL,
    status text NOT NULL, -- e.g., 'pending', 'open', 'success', 'cancelled', 'error', 'failure'
    tracking_company text,
    tracking_number text,
    tracking_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE fulfillments IS 'Stores fulfillment information for orders.';
COMMENT ON COLUMN fulfillments.shopify_fulfillment_id IS 'Shopify Fulfillment ID.';

CREATE TABLE fulfillment_line_items (
    id bigserial PRIMARY KEY,
    fulfillment_id bigint NOT NULL REFERENCES fulfillments(id) ON DELETE CASCADE,
    order_line_item_id bigint NOT NULL REFERENCES order_line_items(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now(), -- Added created_at
    updated_at timestamptz DEFAULT now()  -- Added updated_at
);
COMMENT ON TABLE fulfillment_line_items IS 'Links fulfillments to specific order line items and quantities.';

-- Triggers for updated_at
CREATE TRIGGER update_fulfillments_updated_at
BEFORE UPDATE ON fulfillments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fulfillment_line_items_updated_at -- Added trigger for fulfillment_line_items
BEFORE UPDATE ON fulfillment_line_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_fulfillments_order_id ON fulfillments(order_id);
CREATE INDEX idx_fulfillments_shopify_fulfillment_id ON fulfillments(shopify_fulfillment_id);
CREATE INDEX idx_fulfillment_line_items_fulfillment_id ON fulfillment_line_items(fulfillment_id);
CREATE INDEX idx_fulfillment_line_items_order_line_item_id ON fulfillment_line_items(order_line_item_id);

-- Enable RLS
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view fulfillments related to their orders
CREATE POLICY "Users can view their order fulfillments" ON fulfillments
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = fulfillments.order_id AND auth.uid() = orders.user_id));

-- Users can view fulfillment line items related to their orders (implicitly)
CREATE POLICY "Users can view their order fulfillment_line_items" ON fulfillment_line_items
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM fulfillments f
        JOIN orders o ON f.order_id = o.id
        WHERE f.id = fulfillment_line_items.fulfillment_id AND auth.uid() = o.user_id
    ));

-- Admins can manage all
CREATE POLICY "Admins can manage fulfillments" ON fulfillments
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage fulfillment_line_items" ON fulfillment_line_items
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
