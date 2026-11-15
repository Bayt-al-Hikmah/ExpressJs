-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('TO_READ', 'READING', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "ReadingStatus" NOT NULL DEFAULT 'TO_READ',
    "date_added" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "books_user_id_idx" ON "books"("user_id");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
