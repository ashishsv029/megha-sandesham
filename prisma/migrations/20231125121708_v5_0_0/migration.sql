-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_to_user_fkey";

-- AlterTable
ALTER TABLE "message" ALTER COLUMN "to_user" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_to_user_fkey" FOREIGN KEY ("to_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
