DELETE FROM "RefreshToken";

DROP INDEX "RefreshToken_token_key";

ALTER TABLE "RefreshToken"
DROP COLUMN "token",
DROP COLUMN "replacedByToken",
ADD COLUMN "tokenId" TEXT NOT NULL,
ADD COLUMN "tokenHash" TEXT NOT NULL,
ADD COLUMN "replacedByTokenId" TEXT;

CREATE UNIQUE INDEX "RefreshToken_tokenId_key" ON "RefreshToken"("tokenId");
