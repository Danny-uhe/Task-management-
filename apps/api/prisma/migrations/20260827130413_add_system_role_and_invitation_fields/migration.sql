/*
  Warnings:

  - Added the required column `name` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('admin', 'member');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "systemRole" "SystemRole" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "systemRole" "SystemRole" NOT NULL DEFAULT 'member',
ALTER COLUMN "password" DROP NOT NULL;
