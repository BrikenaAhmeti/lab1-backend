-- Keep legacy patient gender rows in sync with the uppercase API contract.
UPDATE "Patient"
SET "gender" = UPPER(TRIM("gender"))
WHERE UPPER(TRIM("gender")) IN ('MALE', 'FEMALE', 'OTHER')
  AND "gender" <> UPPER(TRIM("gender"));
