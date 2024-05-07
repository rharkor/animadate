/*
  Warnings:

  - A unique constraint covering the columns `[value,petId]` on the table `Characteristic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Characteristic_value_petId_key" ON "Characteristic"("value", "petId");
