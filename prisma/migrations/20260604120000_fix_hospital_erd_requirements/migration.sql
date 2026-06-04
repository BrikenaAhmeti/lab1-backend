-- Patient portal user link.
ALTER TABLE "Patient" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

ALTER TABLE "Patient"
ADD CONSTRAINT "Patient_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Doctors and nurses are login-capable staff, so their user links are mandatory.
INSERT INTO "User" (
    "id",
    "firstName",
    "lastName",
    "email",
    "normalizedEmail",
    "username",
    "normalizedUsername",
    "passwordHash",
    "phoneNumber",
    "emailConfirmed",
    "lockoutEnabled",
    "accessFailedCount",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'migration-doctor-user-' || "id",
    "firstName",
    "lastName",
    'doctor-' || "id" || '@medsphere.local',
    UPPER('doctor-' || "id" || '@medsphere.local'),
    'doctor-' || "id",
    UPPER('doctor-' || "id"),
    'unusable-migration-password',
    "phoneNumber",
    false,
    true,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Doctor"
WHERE "userId" IS NULL;

UPDATE "Doctor"
SET "userId" = 'migration-doctor-user-' || "id"
WHERE "userId" IS NULL;

INSERT INTO "User" (
    "id",
    "firstName",
    "lastName",
    "email",
    "normalizedEmail",
    "username",
    "normalizedUsername",
    "passwordHash",
    "phoneNumber",
    "emailConfirmed",
    "lockoutEnabled",
    "accessFailedCount",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'migration-nurse-user-' || "id",
    "firstName",
    "lastName",
    'nurse-' || "id" || '@medsphere.local',
    UPPER('nurse-' || "id" || '@medsphere.local'),
    'nurse-' || "id",
    UPPER('nurse-' || "id"),
    'unusable-migration-password',
    NULL,
    false,
    true,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Nurse"
WHERE "userId" IS NULL;

UPDATE "Nurse"
SET "userId" = 'migration-nurse-user-' || "id"
WHERE "userId" IS NULL;

ALTER TABLE "Doctor" DROP CONSTRAINT IF EXISTS "Doctor_userId_fkey";
ALTER TABLE "Nurse" DROP CONSTRAINT IF EXISTS "Nurse_userId_fkey";

ALTER TABLE "Doctor" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Nurse" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Doctor"
ADD CONSTRAINT "Doctor_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Nurse"
ADD CONSTRAINT "Nurse_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Store appointments as one proper timestamp. API responses still expose date/time aliases.
ALTER TABLE "Appointment" ADD COLUMN "appointmentDateTime" TIMESTAMP(3);

UPDATE "Appointment"
SET "appointmentDateTime" = ("appointmentDate"::date + "appointmentTime"::time);

ALTER TABLE "Appointment" ALTER COLUMN "appointmentDateTime" SET NOT NULL;

DROP INDEX IF EXISTS "Appointment_appointmentDate_idx";
DROP INDEX IF EXISTS "Appointment_doctorId_appointmentDate_appointmentTime_idx";

ALTER TABLE "Appointment" DROP COLUMN "appointmentDate";
ALTER TABLE "Appointment" DROP COLUMN "appointmentTime";

CREATE INDEX "Appointment_appointmentDateTime_idx"
ON "Appointment"("appointmentDateTime");

CREATE INDEX "Appointment_doctorId_appointmentDateTime_idx"
ON "Appointment"("doctorId", "appointmentDateTime");

CREATE UNIQUE INDEX "Appointment_doctorId_appointmentDateTime_active_key"
ON "Appointment"("doctorId", "appointmentDateTime")
WHERE "status" <> 'Cancelled';

-- Preserve orphan legacy prescription notes before removing duplicate storage.
INSERT INTO "Prescription" (
    "id",
    "medicalRecordId",
    "medicine",
    "dosage",
    "duration",
    "instructions",
    "createdAt",
    "updatedAt"
)
SELECT
    'legacy-prescription-' || "MedicalRecord"."id",
    "MedicalRecord"."id",
    'Legacy prescription notes',
    'See instructions',
    'Unspecified',
    "MedicalRecord"."prescriptionsText",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "MedicalRecord"
WHERE "MedicalRecord"."prescriptionsText" IS NOT NULL
  AND BTRIM("MedicalRecord"."prescriptionsText") <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM "Prescription"
      WHERE "Prescription"."medicalRecordId" = "MedicalRecord"."id"
  );

ALTER TABLE "MedicalRecord" DROP COLUMN "prescriptionsText";

-- Optional invoice links to the care event being billed.
ALTER TABLE "Invoice" ADD COLUMN "appointmentId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "admissionId" TEXT;

CREATE INDEX "Invoice_appointmentId_idx" ON "Invoice"("appointmentId");
CREATE INDEX "Invoice_admissionId_idx" ON "Invoice"("admissionId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_appointmentId_fkey"
FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_admissionId_fkey"
FOREIGN KEY ("admissionId") REFERENCES "Admission"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Database-level invariants for required validations.
ALTER TABLE "Room"
ADD CONSTRAINT "Room_capacity_positive_check"
CHECK ("capacity" > 0);

ALTER TABLE "Admission"
ADD CONSTRAINT "Admission_discharge_not_before_admission_check"
CHECK ("dischargeDate" IS NULL OR "dischargeDate" >= "admissionDate");

ALTER TABLE "Admission"
ADD CONSTRAINT "Admission_status_discharge_date_check"
CHECK (
    ("status" = 'ACTIVE' AND "dischargeDate" IS NULL)
    OR ("status" = 'DISCHARGED' AND "dischargeDate" IS NOT NULL)
);

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_amount_positive_check"
CHECK ("amount" > 0);
