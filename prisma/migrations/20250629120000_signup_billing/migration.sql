-- Phase 3/4: signup, hub linkage, billing state per tenant

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "hubInstanceId" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "planId" TEXT NOT NULL DEFAULT 'connect_trial';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "billingLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "billingMessage" TEXT;

UPDATE "Business" SET "hubInstanceId" = 'connect-' || slug WHERE "hubInstanceId" IS NULL;
UPDATE "Business" SET "onboardingStep" = 0 WHERE "onboardingStep" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Business_hubInstanceId_key" ON "Business"("hubInstanceId");
