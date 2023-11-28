-- AlterTable
ALTER TABLE "room" ADD COLUMN     "admin" TEXT,
ADD COLUMN     "min_participants" INTEGER NOT NULL DEFAULT 2;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_admin_fkey" FOREIGN KEY ("admin") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
