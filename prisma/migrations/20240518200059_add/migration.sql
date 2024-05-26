-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'password',
ADD COLUMN     "profile_pic" TEXT NOT NULL DEFAULT 'profile_pic';
