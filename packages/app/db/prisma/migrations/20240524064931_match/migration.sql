-- CreateEnum
CREATE TYPE "PET_ACTION" AS ENUM ('LIKE', 'DISMISS');

-- CreateTable
CREATE TABLE "PetAction" (
    "id" TEXT NOT NULL,
    "sourcePetId" TEXT NOT NULL,
    "targetPetId" TEXT NOT NULL,
    "action" "PET_ACTION" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "matchedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PetAction_sourcePetId_targetPetId_key" ON "PetAction"("sourcePetId", "targetPetId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_petId_matchedId_key" ON "Match"("petId", "matchedId");

-- AddForeignKey
ALTER TABLE "PetAction" ADD CONSTRAINT "PetAction_sourcePetId_fkey" FOREIGN KEY ("sourcePetId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetAction" ADD CONSTRAINT "PetAction_targetPetId_fkey" FOREIGN KEY ("targetPetId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchedId_fkey" FOREIGN KEY ("matchedId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
