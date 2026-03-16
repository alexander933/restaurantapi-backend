/*
  Warnings:

  - The values [MESERO,CLIENTE] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `activo` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `apellido` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `dispositivo` on the `Users_logins` table. All the data in the column will be lost.
  - You are about to drop the column `exitoso` on the `Users_logins` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `Users_logins` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'SERVER', 'CUSTOMER');
ALTER TABLE "public"."Users" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
ALTER TABLE "Users" ALTER COLUMN "rol" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "activo",
DROP COLUMN "apellido",
DROP COLUMN "nombre",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL,
ALTER COLUMN "rol" SET DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "Users_logins" DROP COLUMN "dispositivo",
DROP COLUMN "exitoso",
DROP COLUMN "fecha",
ADD COLUMN     "Device" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "successful" BOOLEAN NOT NULL DEFAULT true;
