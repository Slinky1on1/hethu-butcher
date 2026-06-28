-- Nexvintrix Connect: multi-tenant businesses

CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'general',
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankAccountName" TEXT NOT NULL DEFAULT '',
    "bankAccountNumber" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "ownerPinHash" TEXT NOT NULL,
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- Hethu tenant (PIN hash is bcrypt for "1234" — change in admin settings)
INSERT INTO "Business" (
    "id", "slug", "name", "industry", "phone", "whatsapp",
    "bankName", "bankAccountName", "bankAccountNumber", "bankBranch",
    "ownerPinHash", "updatedAt"
) VALUES (
    'biz_hethu',
    'hethu',
    'Hethu Mobile Butcher',
    'butcher',
    '0746410088',
    '27746410088',
    'Capitec',
    'MR HT NGWANE',
    '2480495678',
    '470010',
    '$2b$10$gvWBOuPxxUF.vq8D4RYMuOIcnwTF0WNNdhE0WXG7DMeYtcVxS9pI.',
    CURRENT_TIMESTAMP
);

ALTER TABLE "Product" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Shop" ADD COLUMN "businessId" TEXT;
ALTER TABLE "ConsignmentDrop" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Order" ADD COLUMN "businessId" TEXT;

UPDATE "Product" SET "businessId" = 'biz_hethu' WHERE "businessId" IS NULL;
UPDATE "Shop" SET "businessId" = 'biz_hethu' WHERE "businessId" IS NULL;
UPDATE "ConsignmentDrop" SET "businessId" = 'biz_hethu' WHERE "businessId" IS NULL;
UPDATE "Order" SET "businessId" = 'biz_hethu' WHERE "businessId" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Shop" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "ConsignmentDrop" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "businessId" SET NOT NULL;

CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");
CREATE INDEX "Shop_businessId_idx" ON "Shop"("businessId");
CREATE INDEX "ConsignmentDrop_businessId_idx" ON "ConsignmentDrop"("businessId");
CREATE INDEX "Order_businessId_idx" ON "Order"("businessId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsignmentDrop" ADD CONSTRAINT "ConsignmentDrop_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
