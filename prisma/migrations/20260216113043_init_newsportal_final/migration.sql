/*
  Warnings:

  - The values [STUDENT,TUTOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `AvailabilitySlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TutorProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TutorCategories` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "AvailabilitySlot" DROP CONSTRAINT "AvailabilitySlot_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_slotId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_TutorCategories" DROP CONSTRAINT "_TutorCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_TutorCategories" DROP CONSTRAINT "_TutorCategories_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "status",
ALTER COLUMN "role" SET DEFAULT 'USER',
ALTER COLUMN "emailVerified" SET DEFAULT false;

-- DropTable
DROP TABLE "AvailabilitySlot";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "TutorProfile";

-- DropTable
DROP TABLE "_TutorCategories";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "featuredImage" TEXT NOT NULL,
    "imageCaption" TEXT,
    "videoUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_isBreaking_idx" ON "Post"("isBreaking");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
