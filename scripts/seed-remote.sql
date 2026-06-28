-- Mark Prisma migration as applied
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
SELECT '20250627120000-init', 'manual', NOW(), '20250627120000_init', NOW(), 1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20250627120000_init'
);

-- Seed products (skip if any exist)
INSERT INTO "Product" ("id", "name", "packSize", "price", "visible", "trackStock", "stock", "sortOrder", "createdAt", "updatedAt")
SELECT v.id, v.name, v."packSize", v.price, true, false, 0, v."sortOrder", NOW(), NOW()
FROM (VALUES
  ('seed_prod_01', 'Beef Meaty Bones', '5kg', 25000, 1),
  ('seed_prod_02', 'Pork Meaty Bones', '5kg', 25000, 2),
  ('seed_prod_03', 'Chicken Meaty Bones', '5kg', 15000, 3),
  ('seed_prod_04', 'Cheese Burger', '12 patties', 13000, 4),
  ('seed_prod_05', 'Cheese Russians', '10 pack', 13000, 5),
  ('seed_prod_06', 'Chicken Smoked Wings', '', 13000, 6),
  ('seed_prod_07', 'Smoked Riblets', '', 13000, 7),
  ('seed_prod_08', 'Chips', '2.5kg', 10000, 8),
  ('seed_prod_09', 'Cheese Wors', '', 13000, 9),
  ('seed_prod_10', 'Bulk Wors', '20 pieces', 20000, 10),
  ('seed_prod_11', 'T Bone Steak', '2kg', 30000, 11),
  ('seed_prod_12', 'Beef Chuck', '2kg', 30000, 12),
  ('seed_prod_13', 'Oxtail', '1kg', 15000, 13),
  ('seed_prod_14', 'Baby Hake', '5kg', 40000, 14)
) AS v(id, name, "packSize", price, "sortOrder")
WHERE NOT EXISTS (SELECT 1 FROM "Product" LIMIT 1);
