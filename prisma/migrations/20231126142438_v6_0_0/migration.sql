-- AlterTable
ALTER TABLE "message" ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "seen_at" TIMESTAMP(3),
ALTER COLUMN "is_sent" SET DEFAULT true,
ALTER COLUMN "is_delivered" SET DEFAULT false,
ALTER COLUMN "is_seen" SET DEFAULT false;
