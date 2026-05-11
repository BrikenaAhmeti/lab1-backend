ALTER TABLE "Doctor"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Doctor_isActive_idx" ON "Doctor"("isActive");
