/*
  Warnings:

  - Added the required column `exerciseId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Save" ADD COLUMN     "proficiencyPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "exerciseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseReps" INTEGER NOT NULL,
    "baseEnergy" INTEGER NOT NULL,
    "baseXp" INTEGER NOT NULL,
    "statType" TEXT NOT NULL,
    "imagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseProficiency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 0,
    "totalReps" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchUpgrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "upgradeType" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "ExerciseProficiency_userId_idx" ON "ExerciseProficiency"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseProficiency_userId_exerciseId_key" ON "ExerciseProficiency"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "ResearchUpgrade_userId_idx" ON "ResearchUpgrade"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchUpgrade_userId_exerciseId_upgradeType_key" ON "ResearchUpgrade"("userId", "exerciseId", "upgradeType");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProficiency" ADD CONSTRAINT "ExerciseProficiency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Save"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProficiency" ADD CONSTRAINT "ExerciseProficiency_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchUpgrade" ADD CONSTRAINT "ResearchUpgrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Save"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchUpgrade" ADD CONSTRAINT "ResearchUpgrade_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
