-- CreateTable
CREATE TABLE "AlertEmailContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEmailContact_pkey" PRIMARY KEY ("id")
);
