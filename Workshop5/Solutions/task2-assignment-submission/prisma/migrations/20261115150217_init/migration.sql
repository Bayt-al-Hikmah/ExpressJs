-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" INTEGER NOT NULL,
    "assignment_id" INTEGER NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_files" (
    "id" SERIAL NOT NULL,
    "storage_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(180) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "submission_id" INTEGER NOT NULL,

    CONSTRAINT "submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "submission_files_storage_name_key" ON "submission_files"("storage_name");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
