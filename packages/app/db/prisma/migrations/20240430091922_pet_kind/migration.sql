/*
  Warnings:

  - Changed the type of `kind` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PET_KIND" AS ENUM ('DOG');

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "kind",
ADD COLUMN     "kind" "PET_KIND" NOT NULL;
