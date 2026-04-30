-- AlterTable
ALTER TABLE "tutores" ADD COLUMN "curp" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tutores_curp_key" ON "tutores"("curp");
