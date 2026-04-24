-- ============================================================
-- XploreIA Database v3 — MySQL 8.0+ version
-- Team: Bakkari Zakariae, Meriem Hamri, Errami Youssef,
--       Noureddine Oubraim, Saad Ait Yahya
--
-- Converted from PostgreSQL. Changes made:
--   - Removed: CREATE EXTENSION (not supported in MySQL)
--   - Removed: CREATE TYPE ... AS ENUM (not supported in MySQL)
--   - ENUMs are now inline on each column: ENUM('a','b','c')
--   - UUID type → CHAR(36)
--   - uuid_generate_v4() → (UUID())
--   - BYTEA → VARBINARY(255)
--   - Inline REFERENCES replaced with explicit FOREIGN KEY blocks
--     (MySQL requires FK syntax inside the table definition)
--   - BOOLEAN → TINYINT(1) with DEFAULT 0/1
--   - Added ENGINE=InnoDB and CHARSET=utf8mb4 to every table
--   - Seed password hashes converted from PostgreSQL hex literal
--     to MySQL X'...' hex literal syntax
-- ============================================================
DROP DATABASE xplore_ia;
CREATE DATABASE xplore_ia;
USE xplore_ia;
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARBINARY(255)  NOT NULL,
    name            VARCHAR(150)    DEFAULT NULL,
    profile_url     VARCHAR(500)    DEFAULT NULL,
    status          ENUM('active','pending','banned','deleted')
                                    NOT NULL DEFAULT 'pending',
    role            ENUM('user','moderator','admin')
                                    NOT NULL DEFAULT 'user',
    last_login_at   TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PROVIDERS
-- ============================================================
CREATE TABLE providers (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    name            VARCHAR(255)    NOT NULL,
    country         VARCHAR(100)    DEFAULT NULL,
    description     TEXT            DEFAULT NULL,
    ceo             VARCHAR(150)    DEFAULT NULL,
    date_founded    DATE            DEFAULT NULL,
    website_url     VARCHAR(500)    DEFAULT NULL,
    logo_url        VARCHAR(500)    DEFAULT NULL,
    status          ENUM('active','inactive','pending','rejected')
                                    NOT NULL DEFAULT 'pending',
    created_by      CHAR(36)        DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_providers_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    name            VARCHAR(150)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- AI_TOOLS
-- ============================================================
CREATE TABLE ai_tools (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    main_category_id    CHAR(36)        DEFAULT NULL,
    provider_id         CHAR(36)        DEFAULT NULL,
    created_by          CHAR(36)        DEFAULT NULL,
    validated_by        CHAR(36)        DEFAULT NULL,
    name                VARCHAR(255)    NOT NULL,
    description         TEXT            DEFAULT NULL,
    logo_url            VARCHAR(500)    DEFAULT NULL,
    global_rating       DECIMAL(3,2)    DEFAULT NULL
                            CHECK (global_rating BETWEEN 0 AND 5),
    website_url         VARCHAR(500)    DEFAULT NULL,
    release_date        DATE            DEFAULT NULL,
    pricing_model       ENUM('free','freemium','premium')
                                        NOT NULL DEFAULT 'free',
    status              ENUM('draft','pending','published','rejected','archived')
                                        NOT NULL DEFAULT 'draft',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tools_category    FOREIGN KEY (main_category_id) REFERENCES categories(id)  ON DELETE SET NULL,
    CONSTRAINT fk_tools_provider    FOREIGN KEY (provider_id)      REFERENCES providers(id)   ON DELETE SET NULL,
    CONSTRAINT fk_tools_created_by  FOREIGN KEY (created_by)       REFERENCES users(id)       ON DELETE SET NULL,
    CONSTRAINT fk_tools_validated   FOREIGN KEY (validated_by)     REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CHARACTERISTICS
-- ============================================================
CREATE TABLE characteristics (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    name            VARCHAR(150)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    type            ENUM('capability','limitation','modality','language','integration','other')
                                    NOT NULL DEFAULT 'other',
    status          ENUM('active','inactive','pending','rejected')
                                    NOT NULL DEFAULT 'pending',
    created_by      CHAR(36)        DEFAULT NULL,
    validated_by    CHAR(36)        DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_char_created_by FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_char_validated  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TOOL_CHARACTERISTICS  (M:N)
-- ============================================================
CREATE TABLE tool_characteristics (
    id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
    tool_id             CHAR(36)    NOT NULL,
    characteristic_id   CHAR(36)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tool_char (tool_id, characteristic_id),
    CONSTRAINT fk_tc_tool FOREIGN KEY (tool_id)           REFERENCES ai_tools(id)       ON DELETE CASCADE,
    CONSTRAINT fk_tc_char FOREIGN KEY (characteristic_id) REFERENCES characteristics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MODELS
-- ============================================================
CREATE TABLE models (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    provider_id     CHAR(36)        DEFAULT NULL,
    created_by      CHAR(36)        DEFAULT NULL,
    validated_by    CHAR(36)        DEFAULT NULL,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    tags            TEXT            DEFAULT NULL,
    status          ENUM('active','inactive','pending','rejected')
                                    NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_models_provider   FOREIGN KEY (provider_id)  REFERENCES providers(id) ON DELETE SET NULL,
    CONSTRAINT fk_models_created_by FOREIGN KEY (created_by)   REFERENCES users(id)     ON DELETE SET NULL,
    CONSTRAINT fk_models_validated  FOREIGN KEY (validated_by) REFERENCES users(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MODEL_CHARACTERISTICS  (M:N)
-- ============================================================
CREATE TABLE model_characteristics (
    id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
    model_id            CHAR(36)    NOT NULL,
    characteristic_id   CHAR(36)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_model_char (model_id, characteristic_id),
    CONSTRAINT fk_mc_model FOREIGN KEY (model_id)          REFERENCES models(id)         ON DELETE CASCADE,
    CONSTRAINT fk_mc_char  FOREIGN KEY (characteristic_id) REFERENCES characteristics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TOOL_MODELS  (M:N)
-- ============================================================
CREATE TABLE tool_models (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()),
    tool_id     CHAR(36)    NOT NULL,
    model_id    CHAR(36)    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tool_model (tool_id, model_id),
    CONSTRAINT fk_tm_tool  FOREIGN KEY (tool_id)  REFERENCES ai_tools(id) ON DELETE CASCADE,
    CONSTRAINT fk_tm_model FOREIGN KEY (model_id) REFERENCES models(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()),
    tool_id     CHAR(36)    NOT NULL,
    user_id     CHAR(36)    NOT NULL,
    comment     TEXT        DEFAULT NULL,
    rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    status      ENUM('pending','approved','rejected')
                            NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review_tool_user (tool_id, user_id),
    CONSTRAINT fk_reviews_tool FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PLAYLISTS
-- ============================================================
CREATE TABLE playlists (
    id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)        NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    description TEXT            DEFAULT NULL,
    is_public   TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_playlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PLAYLIST_ITEMS
-- ============================================================
CREATE TABLE playlist_items (
    id              CHAR(36)    NOT NULL DEFAULT (UUID()),
    playlist_id     CHAR(36)    NOT NULL,
    tool_id         CHAR(36)    NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_playlist_tool (playlist_id, tool_id),
    CONSTRAINT fk_pi_playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_tool     FOREIGN KEY (tool_id)     REFERENCES ai_tools(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRICING_PLANS
-- ============================================================
CREATE TABLE pricing_plans (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    tool_id         CHAR(36)        NOT NULL,
    plan_name       VARCHAR(100)    NOT NULL,
    pricing_type    ENUM('free','freemium','subscription','one_time','usage_based','enterprise')
                                    NOT NULL DEFAULT 'free',
    tier_number     INT             DEFAULT NULL,
    price_month     DECIMAL(10,2)   DEFAULT NULL,
    price_year      DECIMAL(10,2)   DEFAULT NULL,
    features        TEXT            DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pp_tool FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ADVANTAGES
-- ============================================================
CREATE TABLE advantages (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    tool_id         CHAR(36)        NOT NULL,
    advantage_name  VARCHAR(255)    NOT NULL,
    created_by      CHAR(36)        DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_adv_tool       FOREIGN KEY (tool_id)    REFERENCES ai_tools(id) ON DELETE CASCADE,
    CONSTRAINT fk_adv_created_by FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DISADVANTAGES
-- ============================================================
CREATE TABLE disadvantages (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    tool_id             CHAR(36)        NOT NULL,
    disadvantage_name   VARCHAR(255)    NOT NULL,
    created_by          CHAR(36)        DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_disadv_tool       FOREIGN KEY (tool_id)    REFERENCES ai_tools(id) ON DELETE CASCADE,
    CONSTRAINT fk_disadv_created_by FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PERFORMANCE
-- ============================================================
CREATE TABLE performance (
    id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
    model_id            CHAR(36)    NOT NULL,
    response_quality    INT         DEFAULT NULL CHECK (response_quality BETWEEN 0 AND 100),
    speed               INT         DEFAULT NULL CHECK (speed BETWEEN 0 AND 100),
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_perf_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- HISTORY
-- ============================================================
CREATE TABLE history (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)    NOT NULL,
    type        ENUM('search','view','compare','add_to_playlist','review')
                            NOT NULL,
    content     TEXT        DEFAULT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)        NOT NULL,
    message     TEXT            NOT NULL,
    link        VARCHAR(500)    DEFAULT NULL,
    status      ENUM('unread','read')
                                NOT NULL DEFAULT 'unread',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_ai_tools_category    ON ai_tools(main_category_id);
CREATE INDEX idx_ai_tools_provider    ON ai_tools(provider_id);
CREATE INDEX idx_ai_tools_status      ON ai_tools(status);
CREATE INDEX idx_reviews_tool         ON reviews(tool_id);
CREATE INDEX idx_reviews_user         ON reviews(user_id);
CREATE INDEX idx_history_user         ON history(user_id);
CREATE INDEX idx_history_type         ON history(type);
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_playlist_items_pl    ON playlist_items(playlist_id);
CREATE INDEX idx_tool_models_tool     ON tool_models(tool_id);
CREATE INDEX idx_tool_models_model    ON tool_models(model_id);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEEDS
-- ============================================================

-- ------------------------------------------------------------
-- USERS  (1 admin · 2 moderators · 5 regular users)
-- Password = bcrypt of "Password123!" stored as binary
-- ------------------------------------------------------------
INSERT INTO users (id, email, password_hash, name, profile_url, status, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@xplore-ia.com',    X'243262243132244e6762784a3835', 'Zakariae Bakkari',   'https://xplore-ia.com/avatars/zakariae.png', 'active',  'admin'),
  ('00000000-0000-0000-0000-000000000002', 'meriem@xplore-ia.com',   X'243262243132244e6762784a3835', 'Meriem Hamri',       'https://xplore-ia.com/avatars/meriem.png',   'active',  'moderator'),
  ('00000000-0000-0000-0000-000000000003', 'youssef@xplore-ia.com',  X'243262243132244e6762784a3835', 'Youssef Errami',     'https://xplore-ia.com/avatars/youssef.png',  'active',  'moderator'),
  ('00000000-0000-0000-0000-000000000004', 'noureddine@gmail.com',   X'243262243132244e6762784a3835', 'Noureddine Oubraim', NULL,                                         'active',  'user'),
  ('00000000-0000-0000-0000-000000000005', 'saad@gmail.com',         X'243262243132244e6762784a3835', 'Saad Ait Yahya',     NULL,                                         'active',  'user'),
  ('00000000-0000-0000-0000-000000000006', 'alice.martin@gmail.com', X'243262243132244e6762784a3835', 'Alice Martin',       NULL,                                         'active',  'user'),
  ('00000000-0000-0000-0000-000000000007', 'bob.chen@gmail.com',     X'243262243132244e6762784a3835', 'Bob Chen',           NULL,                                         'active',  'user'),
  ('00000000-0000-0000-0000-000000000008', 'clara.dupont@gmail.com', X'243262243132244e6762784a3835', 'Clara Dupont',       NULL,                                         'pending', 'user');

-- ------------------------------------------------------------
-- PROVIDERS
-- ------------------------------------------------------------
INSERT INTO providers (id, name, country, description, ceo, date_founded, website_url, logo_url, status, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'OpenAI',          'USA', 'AI research lab behind GPT and DALL-E.',           'Sam Altman',             '2015-12-11', 'https://openai.com',      'https://logo.clearbit.com/openai.com',      'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Anthropic',       'USA', 'Safety-focused AI company, creator of Claude.',    'Dario Amodei',           '2021-01-01', 'https://anthropic.com',   'https://logo.clearbit.com/anthropic.com',   'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Google DeepMind', 'USA', 'Google AI division, creator of Gemini.',           'Demis Hassabis',         '2010-09-23', 'https://deepmind.google', 'https://logo.clearbit.com/deepmind.google', 'active', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'Midjourney',      'USA', 'Independent lab specialising in image generation.','David Holz',             '2021-08-01', 'https://midjourney.com',  'https://logo.clearbit.com/midjourney.com',  'active', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000005', 'Stability AI',    'UK',  'Open-source generative AI company.',               'Prem Akkaraju',          '2019-01-01', 'https://stability.ai',    'https://logo.clearbit.com/stability.ai',    'active', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000006', 'ElevenLabs',      'USA', 'AI voice synthesis and cloning platform.',         'Mati Staniszewski',      '2022-01-01', 'https://elevenlabs.io',   'https://logo.clearbit.com/elevenlabs.io',   'active', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000007', 'Runway',          'USA', 'Creative AI tools for video and images.',          'Cristobal Valenzuela',   '2018-01-01', 'https://runwayml.com',    'https://logo.clearbit.com/runwayml.com',    'active', '00000000-0000-0000-0000-000000000003');

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Text Generation',     'Tools for writing, summarising, and generating text content.'),
  ('20000000-0000-0000-0000-000000000002', 'Image Generation',    'Tools that create or edit images from text prompts.'),
  ('20000000-0000-0000-0000-000000000003', 'Code Assistant',      'Tools that help write, review, or debug code.'),
  ('20000000-0000-0000-0000-000000000004', 'Audio & Voice',       'Tools for voice synthesis, cloning, and audio processing.'),
  ('20000000-0000-0000-0000-000000000005', 'Video Generation',    'Tools that generate or edit video content using AI.'),
  ('20000000-0000-0000-0000-000000000006', 'Chatbot & Assistant', 'Conversational AI assistants for end users or businesses.'),
  ('20000000-0000-0000-0000-000000000007', 'Data & Analytics',    'Tools that analyse data, generate insights, or automate reporting.');

-- ------------------------------------------------------------
-- AI_TOOLS
-- ------------------------------------------------------------
INSERT INTO ai_tools (id, main_category_id, provider_id, created_by, validated_by, name, description, logo_url, global_rating, website_url, release_date, pricing_model, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'ChatGPT', 'Conversational AI assistant by OpenAI, powered by GPT-4o. Supports text, images, file uploads, and browsing.',
   'https://logo.clearbit.com/openai.com', 4.70, 'https://chat.openai.com', '2022-11-30', 'freemium', 'published'),

  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Claude', 'Advanced AI assistant by Anthropic, designed for safety, long context, and nuanced reasoning.',
   'https://logo.clearbit.com/anthropic.com', 4.75, 'https://claude.ai', '2023-03-14', 'freemium', 'published'),

  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Gemini', 'Google multimodal AI assistant with deep integration into Google Workspace.',
   'https://logo.clearbit.com/google.com', 4.50, 'https://gemini.google.com', '2023-12-06', 'freemium', 'published'),

  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Midjourney', 'State-of-the-art AI image generation tool accessible via Discord and a web interface.',
   'https://logo.clearbit.com/midjourney.com', 4.80, 'https://midjourney.com', '2022-07-12', 'premium', 'published'),

  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Stable Diffusion', 'Open-source latent diffusion model for high-quality image synthesis, runnable locally or via API.',
   'https://logo.clearbit.com/stability.ai', 4.30, 'https://stability.ai/stable-diffusion', '2022-08-22', 'free', 'published'),

  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'GitHub Copilot', 'AI pair programmer that suggests code completions and full functions inside your IDE.',
   'https://logo.clearbit.com/github.com', 4.60, 'https://github.com/features/copilot', '2022-06-21', 'premium', 'published'),

  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'ElevenLabs', 'Realistic AI voice synthesis and voice cloning with multilingual support.',
   'https://logo.clearbit.com/elevenlabs.io', 4.65, 'https://elevenlabs.io', '2022-11-15', 'freemium', 'published'),

  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002',
   'Runway Gen-3', 'Professional AI video generation and editing platform used in creative industries.',
   'https://logo.clearbit.com/runwayml.com', 4.40, 'https://runwayml.com', '2024-06-17', 'freemium', 'published'),

  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', NULL,
   'GPT-4o API', 'OpenAI flagship model API for text, vision, and audio in custom applications.',
   'https://logo.clearbit.com/openai.com', NULL, 'https://platform.openai.com', '2024-05-13', 'premium', 'pending');

-- ------------------------------------------------------------
-- MODELS
-- ------------------------------------------------------------
INSERT INTO models (id, provider_id, created_by, validated_by, name, description, tags, status) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'GPT-4o',                    'OpenAI multimodal flagship model supporting text, image, and audio I/O.',       'multimodal,text,vision,audio,openai',   'active'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Claude Sonnet 4.6',         'Anthropic balanced model optimised for speed and quality.',                     'text,reasoning,safety,anthropic',      'active'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gemini 2.5 Pro',            'Google latest multimodal model with advanced reasoning and long context.',      'multimodal,text,vision,google',        'active'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Midjourney v6.1',           'Latest Midjourney diffusion model with enhanced photorealism.',                 'image,diffusion,midjourney',           'active'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'SDXL 1.0',                  'Stability AI high-resolution open-source image generation model.',              'image,diffusion,open-source,stability','active'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Codex',                     'OpenAI code-specialised model powering GitHub Copilot.',                       'code,text,openai',                     'active'),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ElevenLabs Multilingual v2','ElevenLabs TTS model supporting 29 languages with natural prosody.',            'audio,tts,multilingual,elevenlabs',    'active');

-- ------------------------------------------------------------
-- TOOL_MODELS
-- ------------------------------------------------------------
INSERT INTO tool_models (id, tool_id, model_id) VALUES
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003'),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006'),
  ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007'),
  ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000001');

-- ------------------------------------------------------------
-- CHARACTERISTICS
-- ------------------------------------------------------------
INSERT INTO characteristics (id, name, description, type, status, created_by, validated_by) VALUES
  ('60000000-0000-0000-0000-000000000001', 'Text input',          'Accepts plain text as input.',                        'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'Image input',         'Accepts images as input.',                            'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000003', 'Audio input',         'Accepts audio files or microphone input.',            'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000004', 'Text output',         'Produces text as output.',                            'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000005', 'Image output',        'Produces images as output.',                          'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000006', 'Audio output',        'Produces audio or speech as output.',                 'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000007', 'Video output',        'Produces video as output.',                           'modality',    'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000008', 'API access',          'Provides a public REST or WebSocket API.',            'integration', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000009', 'Long context window', 'Supports very long conversations or documents.',      'capability',  'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000010', 'Code generation',     'Capable of writing and explaining code.',             'capability',  'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000011', 'Fine-tuning',         'Supports custom fine-tuning on user data.',           'capability',  'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000012', 'Open source',         'Model weights or code are publicly available.',       'capability',  'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000013', 'Rate limited',        'Free tier is subject to request rate limits.',        'limitation',  'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000014', 'No offline mode',     'Requires internet connection to function.',           'limitation',  'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000015', 'Multilingual',        'Supports multiple languages beyond English.',         'language',    'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001');

-- ------------------------------------------------------------
-- TOOL_CHARACTERISTICS
-- ------------------------------------------------------------
INSERT INTO tool_characteristics (id, tool_id, characteristic_id) VALUES
  ('61000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002'),
  ('61000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004'),
  ('61000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000008'),
  ('61000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000010'),
  ('61000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000015'),
  ('61000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002'),
  ('61000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004'),
  ('61000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000008'),
  ('61000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000009'),
  ('61000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000015'),
  ('61000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002'),
  ('61000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000004'),
  ('61000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000009'),
  ('61000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000005'),
  ('61000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000013'),
  ('61000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000005'),
  ('61000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000012'),
  ('61000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000004'),
  ('61000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000010'),
  ('61000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000006'),
  ('61000000-0000-0000-0000-000000000028', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000008'),
  ('61000000-0000-0000-0000-000000000029', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000015'),
  ('61000000-0000-0000-0000-000000000030', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000001'),
  ('61000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000005'),
  ('61000000-0000-0000-0000-000000000032', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000007');

-- ------------------------------------------------------------
-- PRICING_PLANS
-- ------------------------------------------------------------
INSERT INTO pricing_plans (id, tool_id, plan_name, pricing_type, tier_number, price_month, price_year, features) VALUES
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Free',        'free',         1,  0.00,   NULL,   '["GPT-4o mini","Limited GPT-4o","DALL-E basic"]'),
  ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Plus',        'subscription', 2, 20.00, 200.00,  '["GPT-4o full","DALL-E 3","Advanced data analysis","File uploads"]'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Team',        'subscription', 3, 30.00, 300.00,  '["Everything in Plus","Team workspace","Admin controls"]'),
  ('70000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Free',        'free',         1,  0.00,   NULL,   '["Claude Sonnet","Limited messages per day"]'),
  ('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Pro',         'subscription', 2, 20.00, 200.00,  '["Claude Opus","Priority access","Extended context","Projects"]'),
  ('70000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Team',        'subscription', 3, 30.00, 300.00,  '["Everything in Pro","Team workspace","SSO"]'),
  ('70000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'Free',        'free',         1,  0.00,   NULL,   '["Gemini 1.5 Flash","Google Workspace integration"]'),
  ('70000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'Advanced',    'subscription', 2, 21.99, 219.90,  '["Gemini 2.5 Pro","2M token context","Google One 2TB storage"]'),
  ('70000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', 'Basic',       'subscription', 1, 10.00,  96.00,  '["200 generations/month","General commercial terms"]'),
  ('70000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', 'Standard',    'subscription', 2, 30.00, 288.00,  '["Unlimited relaxed","15h fast GPU","General commercial terms"]'),
  ('70000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000004', 'Pro',         'subscription', 3, 60.00, 576.00,  '["Unlimited relaxed","30h fast GPU","Stealth mode"]'),
  ('70000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000005', 'Open Source', 'free',         1,  0.00,   NULL,   '["Self-hosted","Full model weights","No usage limits"]'),
  ('70000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000005', 'API Starter', 'usage_based',  2,  NULL,   NULL,   '["Pay-per-image","REST API access","Priority support"]'),
  ('70000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000006', 'Individual',  'subscription', 1, 10.00, 100.00,  '["IDE plugin","Code completions","Chat","CLI"]'),
  ('70000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000006', 'Business',    'subscription', 2, 19.00, 190.00,  '["Everything Individual","Policy management","Audit logs"]'),
  ('70000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000007', 'Free',        'free',         1,  0.00,   NULL,   '["10k characters/month","3 custom voices"]'),
  ('70000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000007', 'Starter',     'subscription', 2,  5.00,  50.00,  '["30k characters/month","10 custom voices","API access"]'),
  ('70000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000007', 'Creator',     'subscription', 3, 22.00, 220.00,  '["100k characters/month","30 custom voices","Commercial licence"]'),
  ('70000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000008', 'Basic',       'subscription', 1, 12.00, 120.00,  '["125 credits/month","720p video","Watermark"]'),
  ('70000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000008', 'Standard',    'subscription', 2, 28.00, 280.00,  '["625 credits/month","1080p video","No watermark"]'),
  ('70000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000008', 'Pro',         'subscription', 3, 76.00, 760.00,  '["2250 credits/month","4K video","Custom voices","Priority"]');

-- ------------------------------------------------------------
-- ADVANTAGES
-- ------------------------------------------------------------
INSERT INTO advantages (id, tool_id, advantage_name, created_by) VALUES
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Very large user community and ecosystem',       '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Multimodal: text, image, file, and web',        '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Plugin and GPT store integrations',             '00000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Best-in-class reasoning and writing quality',   '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Extremely long context window (200k tokens)',   '00000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Strong safety and alignment focus',             '00000000-0000-0000-0000-000000000006'),
  ('80000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'Deep integration with Google Workspace',        '00000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'Excellent multilingual support',                '00000000-0000-0000-0000-000000000006'),
  ('80000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', 'Industry-leading image quality and coherence',  '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', 'Active community and style sharing',            '00000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000005', 'Fully open source - run locally',               '00000000-0000-0000-0000-000000000006'),
  ('80000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000005', 'Unlimited generations when self-hosted',        '00000000-0000-0000-0000-000000000007'),
  ('80000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000006', 'Deeply integrated into VS Code and JetBrains',  '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000006', 'Supports 30+ programming languages',            '00000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000007', 'Highly realistic voice cloning',                '00000000-0000-0000-0000-000000000006'),
  ('80000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000007', 'Supports 29 languages',                         '00000000-0000-0000-0000-000000000007'),
  ('80000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000008', 'State-of-the-art video generation quality',     '00000000-0000-0000-0000-000000000004'),
  ('80000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000008', 'Professional video editing tools built in',     '00000000-0000-0000-0000-000000000006');

-- ------------------------------------------------------------
-- DISADVANTAGES
-- ------------------------------------------------------------
INSERT INTO disadvantages (id, tool_id, disadvantage_name, created_by) VALUES
  ('81000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Knowledge cutoff - not always up to date',    '00000000-0000-0000-0000-000000000004'),
  ('81000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Rate limits on free tier',                    '00000000-0000-0000-0000-000000000005'),
  ('81000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'No internet browsing on free tier',           '00000000-0000-0000-0000-000000000004'),
  ('81000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'No image generation capability',             '00000000-0000-0000-0000-000000000005'),
  ('81000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Quality can be inconsistent vs competitors', '00000000-0000-0000-0000-000000000006'),
  ('81000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', 'Requires Discord account to use',            '00000000-0000-0000-0000-000000000004'),
  ('81000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 'No free tier available',                     '00000000-0000-0000-0000-000000000005'),
  ('81000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'Requires significant GPU to self-host',      '00000000-0000-0000-0000-000000000006'),
  ('81000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', 'Steeper learning curve for beginners',       '00000000-0000-0000-0000-000000000007'),
  ('81000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000006', 'Requires paid GitHub subscription',          '00000000-0000-0000-0000-000000000004'),
  ('81000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000007', 'Character limits even on paid tiers',        '00000000-0000-0000-0000-000000000005'),
  ('81000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000008', 'Credits run out quickly on lower plans',     '00000000-0000-0000-0000-000000000006');

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
INSERT INTO reviews (id, tool_id, user_id, comment, rating, status) VALUES
  ('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'ChatGPT is incredibly versatile. I use it daily for writing, research, and code. The free tier is quite generous.', 5, 'approved'),
  ('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Great for most tasks, but I wish the knowledge cutoff was more recent. Still, the best all-around AI tool.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Claude produces the most natural, thoughtful responses I have seen from any AI. The long context is a game changer.', 5, 'approved'),
  ('90000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Excellent for document analysis and writing. Would love image generation though.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Gemini is great if you are in the Google ecosystem. The Workspace integration saves me hours every week.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Midjourney v6 images are stunning. Nothing else comes close for artistic quality. The Discord UX is a bit clunky though.', 5, 'approved'),
  ('90000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'Incredible image quality. Wish there was a proper web app instead of relying on Discord.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'Love the open-source nature. Running it locally gives full control. Setup takes time but is worth it.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'Copilot has made me at least 30% faster as a developer. The inline suggestions are accurate and context-aware.', 5, 'approved'),
  ('90000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'The voice cloning quality is unreal. I use it for YouTube voiceovers. The multilingual support is a big plus.', 5, 'approved'),
  ('90000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'Runway Gen-3 is impressive for short video clips. Credits disappear fast though - pricing could be better.', 4, 'approved'),
  ('90000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Solid tool but it hallucinates more than I would like for factual questions. Always verify the output.', 3, 'approved');

-- ------------------------------------------------------------
-- PLAYLISTS
-- ------------------------------------------------------------
INSERT INTO playlists (id, user_id, name, description, is_public) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'My daily AI stack',          'Tools I use every single day.',             1),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Creative AI tools',          'Best tools for art and creative projects.',  1),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'Developer toolkit',          'AI tools every developer should know.',      1),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'Content creator essentials', 'Voice, video, and image AI in one list.',    1),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'To evaluate',                'Tools I want to try later.',                 0);

-- ------------------------------------------------------------
-- PLAYLIST_ITEMS
-- ------------------------------------------------------------
INSERT INTO playlist_items (id, playlist_id, tool_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000009');

-- ------------------------------------------------------------
-- PERFORMANCE
-- ------------------------------------------------------------
INSERT INTO performance (id, model_id, response_quality, speed) VALUES
  ('c0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 94, 88),
  ('c0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 96, 85),
  ('c0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 92, 82),
  ('c0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 95, 70),
  ('c0000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 88, 65),
  ('c0000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 91, 93),
  ('c0000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', 93, 78);

-- ------------------------------------------------------------
-- HISTORY
-- ------------------------------------------------------------
INSERT INTO history (id, user_id, type, content) VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'search',          'image generation tools'),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'view',            '30000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'compare',         '30000000-0000-0000-0000-000000000004,30000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'add_to_playlist', '30000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'search',          'code assistant AI'),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'view',            '30000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'review',          '30000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'search',          'text to speech'),
  ('d0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000006', 'view',            '30000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000007', 'search',          'AI video generation'),
  ('d0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000007', 'view',            '30000000-0000-0000-0000-000000000008'),
  ('d0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000007', 'add_to_playlist', '30000000-0000-0000-0000-000000000008');

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
INSERT INTO notifications (id, user_id, message, link, status) VALUES
  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Your review for ChatGPT has been approved.',                          '/tools/30000000-0000-0000-0000-000000000001',     'read'),
  ('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Your review for GitHub Copilot has been approved.',                   '/tools/30000000-0000-0000-0000-000000000006',     'read'),
  ('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'A new tool has been added to the category you follow: Audio & Voice.', '/categories/20000000-0000-0000-0000-000000000004','unread'),
  ('e0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'Your review for Runway Gen-3 has been approved.',                     '/tools/30000000-0000-0000-0000-000000000008',     'unread'),
  ('e0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'Midjourney has released a new version. Check it out!',                '/tools/30000000-0000-0000-0000-000000000004',     'unread'),
  ('e0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'Welcome to XploreIA! Confirm your email to get started.',             '/account/verify',                                'unread');
