-- AlterTable
ALTER TABLE "_MateriaToPersonal" ADD CONSTRAINT "_MateriaToPersonal_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MateriaToPersonal_AB_unique";
