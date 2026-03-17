/*
  Warnings:

  - You are about to drop the column `Device` on the `Users_logins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users_logins" DROP COLUMN "Device",
ADD COLUMN     "device" TEXT;
