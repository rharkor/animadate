/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[petPhotosId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CHARACTERISTIC" AS ENUM ('FRIENDLY', 'PLAYFUL', 'CALM', 'ACTIVE', 'INDEPENDENT', 'LOYAL', 'INTELLIGENT', 'PROTECTIVE', 'AGGRESSIVE', 'AFFECTIONATE', 'CURIOUS', 'ENERGETIC', 'SWEET', 'HAPPY', 'LOVING', 'QUIET', 'SHY', 'SOCIAL', 'TALKATIVE', 'TIMID', 'BOLD', 'BRAVE', 'CLEVER', 'CONFIDENT', 'COOL', 'CRAZY', 'CUTE', 'DARING', 'DEVOTED', 'DOCILE', 'DYNAMIC', 'EASYGOING', 'ENTHUSIASTIC', 'FAITHFUL', 'FEARLESS', 'FIERCE', 'FUNNY', 'GENTLE', 'GOOD', 'HARDWORKING', 'HELPFUL', 'HONEST', 'HUMBLE', 'JOYFUL', 'KIND', 'MATURE', 'OBEDIENT', 'PATIENT', 'PEACEFUL', 'POLITE', 'RELIABLE', 'RESPONSIBLE', 'SENSITIVE', 'SERIOUS', 'SINCERE', 'SMART', 'STRONG', 'TENDER', 'TOUGH', 'TRUSTWORTHY', 'WISE', 'WITTY', 'ZEALOUS', 'ADAPTABLE', 'AMUSING', 'BRIGHT', 'CHARMING', 'CHEERFUL', 'COURAGEOUS', 'CREATIVE', 'DECISIVE', 'DETERMINED', 'FAIR', 'FLEXIBLE', 'GENEROUS');

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "petPhotosId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "Characteristic" (
    "id" TEXT NOT NULL,
    "value" "CHARACTERISTIC" NOT NULL,
    "petId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "bornAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "researchedCharacteristics" "CHARACTERISTIC"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pet_ownerId_key" ON "Pet"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "File_petPhotosId_key" ON "File"("petPhotosId");

-- AddForeignKey
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_petPhotosId_fkey" FOREIGN KEY ("petPhotosId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
