/*
  Warnings:

  - You are about to drop the column `matchedId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `petId` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[petId1,petId2]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `petId1` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petId2` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_matchedId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_petId_fkey";

-- DropIndex
DROP INDEX "Match_petId_matchedId_key";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "matchedId",
DROP COLUMN "petId",
ADD COLUMN     "petId1" TEXT NOT NULL,
ADD COLUMN     "petId2" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Match_petId1_petId2_key" ON "Match"("petId1", "petId2");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_petId1_fkey" FOREIGN KEY ("petId1") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_petId2_fkey" FOREIGN KEY ("petId2") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
