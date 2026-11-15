-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(120) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "organiser_id" INTEGER NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_media" (
    "id" SERIAL NOT NULL,
    "storage_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(180) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "caption" VARCHAR(200),
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "event_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "event_media_storage_name_key" ON "event_media"("storage_name");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_fkey" FOREIGN KEY ("organiser_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
