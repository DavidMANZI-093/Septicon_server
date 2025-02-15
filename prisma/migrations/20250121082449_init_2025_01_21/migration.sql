/*
  Warnings:

  - Added the required column `rank` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRank" AS ENUM ('CIV', 'LT2', 'LT', 'CPT', 'MAJ', 'LTC', 'COL', 'BG', 'MG', 'LTG', 'GEN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rank" "UserRank" NOT NULL;
