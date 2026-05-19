-- AlterTable
ALTER TABLE "horarios" ADD COLUMN     "id_periodo_escolar" INTEGER;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_id_periodo_escolar_fkey" FOREIGN KEY ("id_periodo_escolar") REFERENCES "periodos_escolares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
