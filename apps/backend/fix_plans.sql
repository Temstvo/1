-- Fix plans table: change protocols and regions from enum[] to text[]
-- Then re-insert seed data

ALTER TABLE "plans" ALTER COLUMN "protocols" TYPE TEXT[] USING ARRAY[protocols::text];
ALTER TABLE "plans" ALTER COLUMN "regions" TYPE TEXT[] USING ARRAY[regions::text];
ALTER TABLE "plans" ALTER COLUMN "features" TYPE TEXT[];

-- Re-seed plans with correct types
DELETE FROM "plans";

INSERT INTO "plans" ("id", "name", "description", "price", "currency", "duration", "traffic_limit", "device_limit", "protocols", "regions", "priority", "features", "is_active") VALUES
('a0000000-0000-0000-0000-000000000001', 'Free Trial', '7-day free trial with full access', 0.00, 'USD', 7, 10737418240, 2, ARRAY['WIREGUARD', 'OPENVPN']::text[], ARRAY['US', 'EU']::text[], 0, ARRAY['Basic VPN', '5 Servers', 'Email Support']::text[], true),
('a0000000-0000-0000-0000-000000000002', 'Starter', 'Perfect for personal use', 4.99, 'USD', 30, 53687091200, 3, ARRAY['WIREGUARD', 'OPENVPN']::text[], ARRAY['US', 'EU', 'ASIA']::text[], 1, ARRAY['All Servers', 'Kill Switch', 'Email Support']::text[], true),
('a0000000-0000-0000-0000-000000000003', 'Pro', 'Best value for power users', 9.99, 'USD', 30, 214748364800, 5, ARRAY['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS']::text[], ARRAY['US', 'EU', 'ASIA', 'OCEANIA']::text[], 2, ARRAY['All Servers', 'Kill Switch', 'Ad Blocker', 'Priority Support', 'Dedicated IP']::text[], true),
('a0000000-0000-0000-0000-000000000004', 'Business', 'For teams and businesses', 19.99, 'USD', 30, 1099511627776, 10, ARRAY['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS']::text[], ARRAY['US', 'EU', 'ASIA', 'OCEANIA', 'SA', 'AF']::text[], 3, ARRAY['All Servers', 'Kill Switch', 'Ad Blocker', 'Dedicated IP', '24/7 Support', 'Team Management', 'Custom Configs']::text[], true);
