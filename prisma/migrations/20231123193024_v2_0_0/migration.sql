/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_from_user_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_room_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_to_user_fkey";

-- DropForeignKey
ALTER TABLE "_UserInRoom" DROP CONSTRAINT "_UserInRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserInRoom" DROP CONSTRAINT "_UserInRoom_B_fkey";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoomTypes" NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "is_private" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "from_user" TEXT NOT NULL,
    "to_user" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "is_sent" BOOLEAN NOT NULL,
    "is_delivered" BOOLEAN NOT NULL,
    "is_seen" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_to_user_fkey" FOREIGN KEY ("to_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInRoom" ADD CONSTRAINT "_UserInRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInRoom" ADD CONSTRAINT "_UserInRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
