/*
  Warnings:

  - You are about to drop the column `bornAt` on the `Pet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId,name]` on the table `Pet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthdate` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "bornAt",
ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Pet_ownerId_name_key" ON "Pet"("ownerId", "name");
