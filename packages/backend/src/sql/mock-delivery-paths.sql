INSERT INTO delivery_paths (order_id, time, location, action, claim_code)
VALUES 
  ('rAdC12', '2025-11-17 00:00:00', ROW(118.78221974, 32.07915573), '已发货', NULL);

INSERT INTO delivery_paths (order_id, time, location, action, claim_code)
VALUES 
  ('RktE73', '2025-11-17 00:00:00', ROW(121.42653336, 29.86982248), '已发货', NULL),
  ('RktE73', '2025-11-17 12:00:00', ROW(120.08487785, 30.30987378), '配送中', NULL),
  ('RktE73', '2025-11-18 00:00:00', ROW(120.72816841, 30.75408188), '已到货', '111-111-111');

INSERT INTO delivery_paths (order_id, time, location, action, claim_code)
VALUES 
  ('bS2rQ5', '2025-11-17 00:00:00', ROW(121.42653336, 29.86982248), '已发货', NULL),
  ('bS2rQ5', '2025-11-17 12:00:00', ROW(120.08487785, 30.30987378), '配送中', NULL),
  ('bS2rQ5', '2025-11-18 00:00:00', ROW(120.72816841, 30.75408188), '已到货', '111-222-222'),
  ('bS2rQ5', '2025-11-18 12:00:00', ROW(120.72816841, 30.75408188), '已签收', NULL);

INSERT INTO delivery_paths (order_id, time, location, action, claim_code)
VALUES 
  ('e4Tr89', '2025-11-17 00:00:00', ROW(121.42653336, 29.86982248), '已发货', NULL),
  ('e4Tr89', '2025-11-17 12:00:00', ROW(120.08487785, 30.30987378), '配送中', NULL),
  ('e4Tr89', '2025-11-17 15:00:00', ROW(120.08487785, 30.30987378), '已取消', NULL);
