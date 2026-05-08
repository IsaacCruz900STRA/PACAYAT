-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "resetCodeExp" TIMESTAMP(3);
