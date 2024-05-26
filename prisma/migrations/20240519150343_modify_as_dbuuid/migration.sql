/*
  Warnings:

  - The primary key for the `message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `to_user` column on the `message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `admin` column on the `room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `A` on the `_UserInRoom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_UserInRoom` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `from_user` on the `message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `room_id` on the `message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `room` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_UserInRoom" DROP CONSTRAINT "_UserInRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserInRoom" DROP CONSTRAINT "_UserInRoom_B_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_from_user_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_room_id_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_to_user_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_admin_fkey";

-- AlterTable
ALTER TABLE "_UserInRoom" DROP COLUMN "A",
ADD COLUMN     "A" UUID NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" UUID NOT NULL;

-- AlterTable
ALTER TABLE "message" DROP CONSTRAINT "message_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "from_user",
ADD COLUMN     "from_user" UUID NOT NULL,
DROP COLUMN "to_user",
ADD COLUMN     "to_user" UUID,
DROP COLUMN "room_id",
ADD COLUMN     "room_id" UUID NOT NULL,
ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "room" DROP CONSTRAINT "room_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "admin",
ADD COLUMN     "admin" UUID,
ADD CONSTRAINT "room_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "_UserInRoom_AB_unique" ON "_UserInRoom"("A", "B");

-- CreateIndex
CREATE INDEX "_UserInRoom_B_index" ON "_UserInRoom"("B");

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_admin_fkey" FOREIGN KEY ("admin") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_to_user_fkey" FOREIGN KEY ("to_user") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInRoom" ADD CONSTRAINT "_UserInRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInRoom" ADD CONSTRAINT "_UserInRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
