-- CreateEnum
CREATE TYPE "feedback_sentiment" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "listing_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "sentiment" "feedback_sentiment" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "listing_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference_vectors" (
    "user_id" UUID NOT NULL,
    "embedding" vector(768) NOT NULL,
    "signal_count" INTEGER NOT NULL DEFAULT 0,
    "model_version" VARCHAR(40) NOT NULL,
    "computed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_preference_vectors_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_feedback_user_property_uidx" ON "listing_feedback"("user_id", "property_id");

-- AddForeignKey
ALTER TABLE "listing_feedback" ADD CONSTRAINT "listing_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_feedback" ADD CONSTRAINT "listing_feedback_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference_vectors" ADD CONSTRAINT "user_preference_vectors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
