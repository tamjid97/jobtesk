-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PosterStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailOrPhone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "occasionType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "layoutConfig" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poster" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "uploadedPhotoUrls" TEXT[],
    "generatedImageUrl" TEXT,
    "status" "PosterStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationLog" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "geminiPromptUsed" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "latencyMs" INTEGER,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "GenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailOrPhone_key" ON "User"("emailOrPhone");

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poster" ADD CONSTRAINT "Poster_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationLog" ADD CONSTRAINT "GenerationLog_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "Poster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
