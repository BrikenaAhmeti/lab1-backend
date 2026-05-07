CREATE TYPE "RoomType" AS ENUM (
    'GENERAL',
    'ICU',
    'SURGERY',
    'EMERGENCY',
    'PEDIATRIC'
);

CREATE TYPE "RoomStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'UNDER_MAINTENANCE'
);

CREATE TYPE "AdmissionStatus" AS ENUM (
    'ACTIVE',
    'DISCHARGED'
);

ALTER TABLE "Room"
ALTER COLUMN "type" TYPE "RoomType"
USING (
    CASE
        WHEN UPPER("type") = 'ICU' THEN 'ICU'::"RoomType"
        WHEN UPPER("type") = 'SURGERY' THEN 'SURGERY'::"RoomType"
        WHEN UPPER("type") = 'EMERGENCY' THEN 'EMERGENCY'::"RoomType"
        WHEN UPPER("type") = 'PEDIATRIC' THEN 'PEDIATRIC'::"RoomType"
        ELSE 'GENERAL'::"RoomType"
    END
);

ALTER TABLE "Room"
ALTER COLUMN "status" TYPE "RoomStatus"
USING (
    CASE
        WHEN UPPER(REPLACE("status", ' ', '_')) = 'OCCUPIED' THEN 'OCCUPIED'::"RoomStatus"
        WHEN UPPER(REPLACE("status", ' ', '_')) = 'UNDER_MAINTENANCE' THEN 'UNDER_MAINTENANCE'::"RoomStatus"
        ELSE 'AVAILABLE'::"RoomStatus"
    END
);

CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "dischargeDate" TIMESTAMP(3),
    "status" "AdmissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");
CREATE INDEX "Admission_roomId_idx" ON "Admission"("roomId");
CREATE INDEX "Admission_status_idx" ON "Admission"("status");

ALTER TABLE "Admission"
ADD CONSTRAINT "Admission_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Admission"
ADD CONSTRAINT "Admission_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
