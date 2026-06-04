-- Patient portal user link. This is optional because not every patient needs a portal account.
ALTER TABLE "Patient" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

ALTER TABLE "Patient"
ADD CONSTRAINT "Patient_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Doctors are login-capable staff in this system, so their user links are mandatory.
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

ALTER TABLE "Doctor" DROP CONSTRAINT IF EXISTS "Doctor_userId_fkey";

ALTER TABLE "Doctor" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Doctor"
ADD CONSTRAINT "Doctor_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Nurse portal login remains optional. Keep the existing unique nullable user link.
ALTER TABLE "Nurse" DROP CONSTRAINT IF EXISTS "Nurse_userId_fkey";

ALTER TABLE "Nurse"
ADD CONSTRAINT "Nurse_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Keep mandatory appointment date/time fields, but store them with proper date/time types.
DROP INDEX IF EXISTS "Appointment_doctorId_appointmentDate_appointmentTime_idx";

ALTER TABLE "Appointment"
ALTER COLUMN "appointmentDate" TYPE DATE
USING "appointmentDate"::date;

ALTER TABLE "Appointment"
ALTER COLUMN "appointmentTime" TYPE TIME(0)
USING "appointmentTime"::time;

CREATE INDEX "Appointment_doctorId_appointmentDate_appointmentTime_idx"
ON "Appointment"("doctorId", "appointmentDate", "appointmentTime");

CREATE UNIQUE INDEX "Appointment_doctorId_appointmentDate_appointmentTime_active_key"
ON "Appointment"("doctorId", "appointmentDate", "appointmentTime")
WHERE "status" <> 'Cancelled';

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

-- Optional normalized invoice lines.
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10, 2) NOT NULL,
    "totalPrice" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

ALTER TABLE "InvoiceItem"
ADD CONSTRAINT "InvoiceItem_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Optional normalized doctor availability.
CREATE TABLE "DoctorSchedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DoctorSchedule_doctorId_idx" ON "DoctorSchedule"("doctorId");
CREATE INDEX "DoctorSchedule_dayOfWeek_idx" ON "DoctorSchedule"("dayOfWeek");
CREATE UNIQUE INDEX "DoctorSchedule_doctorId_dayOfWeek_startTime_endTime_key"
ON "DoctorSchedule"("doctorId", "dayOfWeek", "startTime", "endTime");

ALTER TABLE "DoctorSchedule"
ADD CONSTRAINT "DoctorSchedule_doctorId_fkey"
FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id")
ON DELETE CASCADE
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

ALTER TABLE "InvoiceItem"
ADD CONSTRAINT "InvoiceItem_quantity_positive_check"
CHECK ("quantity" > 0);

ALTER TABLE "InvoiceItem"
ADD CONSTRAINT "InvoiceItem_unit_price_non_negative_check"
CHECK ("unitPrice" >= 0);

ALTER TABLE "InvoiceItem"
ADD CONSTRAINT "InvoiceItem_total_price_non_negative_check"
CHECK ("totalPrice" >= 0);

ALTER TABLE "DoctorSchedule"
ADD CONSTRAINT "DoctorSchedule_day_of_week_check"
CHECK ("dayOfWeek" BETWEEN 0 AND 6);

ALTER TABLE "DoctorSchedule"
ADD CONSTRAINT "DoctorSchedule_time_order_check"
CHECK ("endTime" > "startTime");
