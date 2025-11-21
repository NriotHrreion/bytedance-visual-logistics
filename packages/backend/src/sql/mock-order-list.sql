INSERT INTO orders (id, name, price, created_at, status, destination) VALUES
  (
    'eBdC32',
    'iPhone 17 Pro Max 2TB',
    17999.00,
    '2025-12-18 00:00:00',
    'pending',
    ROW(120.72816841, 30.75408188)
  ),
  (
    'rAdC12',
    'iPhone 17 512GB',
    7999.30,
    '2025-12-17 00:00:00',
    'delivering',
    ROW(120.72816841, 30.75408188)
  ),
  (
    'RktE73',
    'iPhone 16 Pro Max 1TB',
    11177.00,
    '2025-12-17 00:00:00',
    'delivered',
    ROW(120.72816841, 30.75408188)
  ),
  (
    'bS2rQ5',
    'iPhone 16 Plus 256GB',
    6999.00,
    '2025-12-17 00:00:00',
    'received',
    ROW(120.72816841, 30.75408188)
  ),
  (
    'e4Tr89',
    'iPhone 16 Plus 256GB',
    6999.00,
    '2025-12-17 00:00:00',
    'cancelled',
    ROW(120.72816841, 30.75408188)
  )
ON CONFLICT (id) DO NOTHING;
