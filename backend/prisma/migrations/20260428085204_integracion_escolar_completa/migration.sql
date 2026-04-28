/*
  Warnings:

  - A unique constraint covering the columns `[nombre,grado]` on the table `materias` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'ADMINISTRATIVO';

-- DropIndex
DROP INDEX "materias_nombre_key";

-- AlterTable
ALTER TABLE "alumnos" ADD COLUMN     "grado" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "materias" ADD COLUMN     "grado" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "personal" ADD COLUMN     "contacto" TEXT,
ADD COLUMN     "especialidad" TEXT;

-- CreateTable
CREATE TABLE "periodos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MateriaToPersonal" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MateriaToPersonal_AB_unique" ON "_MateriaToPersonal"("A", "B");

-- CreateIndex
CREATE INDEX "_MateriaToPersonal_B_index" ON "_MateriaToPersonal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "materias_nombre_grado_key" ON "materias"("nombre", "grado");

-- AddForeignKey
ALTER TABLE "_MateriaToPersonal" ADD CONSTRAINT "_MateriaToPersonal_A_fkey" FOREIGN KEY ("A") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToPersonal" ADD CONSTRAINT "_MateriaToPersonal_B_fkey" FOREIGN KEY ("B") REFERENCES "personal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
