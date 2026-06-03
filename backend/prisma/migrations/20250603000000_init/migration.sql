-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('buyer', 'agent', 'admin');
CREATE TYPE "listing_provider" AS ENUM ('shaety', 'aqarmap', 'property_finder');
CREATE TYPE "listing_type" AS ENUM ('sale', 'rent');
CREATE TYPE "property_type" AS ENUM ('apartment', 'villa', 'duplex', 'townhouse', 'commercial', 'land', 'other');
CREATE TYPE "project_status" AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE "booking_status" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'declined');
CREATE TYPE "message_role" AS ENUM ('user', 'assistant', 'system');
CREATE TYPE "embedding_entity_type" AS ENUM ('property', 'project');
CREATE TYPE "sync_run_status" AS ENUM ('running', 'success', 'failed');
CREATE TYPE "OAuthProvider" AS ENUM ('google', 'apple');

-- CreateTable users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" VARCHAR(255),
    "role" "user_role" NOT NULL DEFAULT 'buyer',
    "name" VARCHAR(120),
    "phone" VARCHAR(20),
    "locale" VARCHAR(10) NOT NULL DEFAULT 'ar-EG',
    "avatar_url" TEXT,
    "preferred_agent_id" VARCHAR(50),
    "agent_profile" JSONB,
    "search_preferences" JSONB,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "consent_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateTable projects
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "description_i18n" JSONB,
    "developer" VARCHAR(120),
    "location" JSONB NOT NULL,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "status" "project_status" NOT NULL DEFAULT 'active',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateTable properties
CREATE TABLE "properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID,
    "agent_id" UUID,
    "external_id" VARCHAR(100) NOT NULL,
    "provider" "listing_provider" NOT NULL,
    "listing_type" "listing_type" NOT NULL,
    "property_type" "property_type" NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "price_egp" DECIMAL(14,2) NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area_sqm" DECIMAL(10,2),
    "location" JSONB NOT NULL,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "images" JSONB NOT NULL DEFAULT '[]',
    "source_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "properties" ADD COLUMN "search_vector" tsvector;

CREATE INDEX "properties_search_vector_idx" ON "properties" USING GIN ("search_vector");
CREATE UNIQUE INDEX "properties_provider_external_id_key" ON "properties"("provider", "external_id");
CREATE INDEX "properties_is_active_price_egp_idx" ON "properties"("is_active", "price_egp");

ALTER TABLE "properties" ADD CONSTRAINT "properties_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable bookings
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'requested',
    "preferred_at" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_at" TIMESTAMPTZ(6),
    "buyer_message" TEXT,
    "agent_message" TEXT,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable conversations
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "agent_id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "last_message_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable messages
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "role" "message_role" NOT NULL,
    "content" TEXT NOT NULL,
    "agent_id" VARCHAR(50),
    "listing_refs" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB,
    "token_count" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable embeddings
CREATE TABLE "embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" "embedding_entity_type" NOT NULL,
    "entity_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "model_version" VARCHAR(50) NOT NULL DEFAULT 'text-embedding-004',
    "embedding" vector(768) NOT NULL,
    "embedded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "embeddings_entity_type_entity_id_chunk_index_key" ON "embeddings"("entity_type", "entity_id", "chunk_index");
CREATE INDEX "embeddings_embedding_idx" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);

-- Supporting tables
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_user_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_accounts_provider_provider_user_id_key" ON "oauth_accounts"("provider", "provider_user_id");
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "favorites_user_id_property_id_key" ON "favorites"("user_id", "property_id");
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "sync_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "listing_provider" NOT NULL,
    "status" "sync_run_status" NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "listings_fetched" INTEGER NOT NULL DEFAULT 0,
    "listings_upserted" INTEGER NOT NULL DEFAULT 0,
    "listings_deactivated" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sync_runs_provider_started_at_idx" ON "sync_runs"("provider", "started_at" DESC);

CREATE TABLE "ai_agents" (
    "id" VARCHAR(50) NOT NULL,
    "name_i18n" JSONB NOT NULL,
    "description" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "model_id" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);
