-- CreateTable
CREATE TABLE "ChangeEmailToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ChangeEmailToken_identifier_key" ON "ChangeEmailToken"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeEmailToken_token_key" ON "ChangeEmailToken"("token");

-- AddForeignKey
ALTER TABLE "ChangeEmailToken" ADD CONSTRAINT "ChangeEmailToken_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
