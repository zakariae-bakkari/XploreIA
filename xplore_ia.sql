-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2026 at 02:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xplore_ia`
--

-- --------------------------------------------------------

--
-- Table structure for table `advantages`
--

CREATE TABLE `advantages` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `advantage_name` varchar(255) NOT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advantages`
--

INSERT INTO `advantages` (`id`, `tool_id`, `advantage_name`, `created_by`, `created_at`) VALUES
('7014d560-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', 'Very large user community and ecosystem', NULL, '2026-06-04 01:12:17'),
('7014e47d-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', 'Multimodal: text, image, file, and web', NULL, '2026-06-04 01:12:17'),
('7014fa1c-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', 'Plugin and GPT store integrations', NULL, '2026-06-04 01:12:17'),
('75d3c5df-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Interaction naturelle avec les utilisateurs.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d3f79c-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Réponses contextuelles et précises.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d42f24-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Accès via API pour intégration facile.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d466c1-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Capacité de fine-tuning pour des besoins spécifiques.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('80000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000006', 'Deeply integrated into VS Code and JetBrains', '00000000-0000-0000-0000-000000000004', '2026-04-27 21:09:28'),
('80000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000006', 'Supports 30+ programming languages', '00000000-0000-0000-0000-000000000005', '2026-04-27 21:09:28'),
('80000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000007', 'Highly realistic voice cloning', '00000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28'),
('80000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000007', 'Supports 29 languages', NULL, '2026-04-27 21:09:28'),
('80000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000008', 'State-of-the-art video generation quality', '00000000-0000-0000-0000-000000000004', '2026-04-27 21:09:28'),
('80000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000008', 'Professional video editing tools built in', '00000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `ai_tools`
--

CREATE TABLE `ai_tools` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `main_category_id` char(36) DEFAULT NULL,
  `provider_id` char(36) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `validated_by` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `global_rating` decimal(3,2) DEFAULT NULL CHECK (`global_rating` between 0 and 5),
  `website_url` varchar(500) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `pricing_model` enum('free','freemium','premium') NOT NULL DEFAULT 'freemium',
  `status` enum('draft','pending','published','rejected','archived') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_tools`
--

INSERT INTO `ai_tools` (`id`, `main_category_id`, `provider_id`, `created_by`, `validated_by`, `name`, `description`, `logo_url`, `global_rating`, `website_url`, `release_date`, `pricing_model`, `status`, `created_at`, `updated_at`) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ChatGPT', 'Conversational AI assistant by OpenAI, powered by GPT-4o. Supports text, images, file uploads, and browsing.', 'https://logo.clearbit.com/openai.com', 4.70, 'https://chat.openai.com', '2022-11-30', 'freemium', '', '2026-04-27 21:09:28', '2026-06-04 01:12:17'),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'GitHub Copilot', 'AI pair programmer that suggests code completions and full functions inside your IDE.', 'https://logo.clearbit.com/github.com', 5.00, 'https://github.com/features/copilot', '2022-06-21', 'premium', 'published', '2026-04-27 21:09:28', '2026-06-04 11:21:15'),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ElevenLabs', 'Realistic AI voice synthesis and voice cloning with multilingual support.', 'https://logo.clearbit.com/elevenlabs.io', 4.65, 'https://elevenlabs.io', '2022-11-15', 'freemium', 'published', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Runway Gen-3', 'Professional AI video generation and editing platform used in creative industries.', 'https://logo.clearbit.com/runwayml.com', 4.40, 'https://runwayml.com', '2024-06-17', 'freemium', 'published', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('75d26c89-68e4-11f1-8226-e4a8dfef831e', '20000000-0000-0000-0000-000000000006', '283e9065-60ce-11f1-8c64-e4a8dfef831e', NULL, NULL, 'claude', 'Claude est un assistant virtuel avancé, conçu pour interagir de manière naturelle et efficace avec les utilisateurs, offrant des réponses précises et contextuelles.', NULL, NULL, 'https://claude.ai', NULL, 'freemium', 'published', '2026-06-15 18:03:06', '2026-06-15 18:03:06');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
('20000000-0000-0000-0000-000000000001', 'Text Generation', 'Tools for writing, summarising, and generating text content.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('20000000-0000-0000-0000-000000000002', 'Image Generation', 'Tools that create or edit images from text prompts.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('20000000-0000-0000-0000-000000000003', 'Code Assistant', 'Tools that help write, review, or debug code.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('20000000-0000-0000-0000-000000000004', 'Audio & Voice', 'Tools for voice synthesis, cloning, and audio processing.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('20000000-0000-0000-0000-000000000005', 'Video Generation', 'Tools that generate or edit video content using AI.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('20000000-0000-0000-0000-000000000006', 'Chatbot & Assistant', 'Conversational AI assistants for end users or businesses.', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `characteristics`
--

CREATE TABLE `characteristics` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('capability','limitation','modality','language','integration','other') NOT NULL DEFAULT 'other',
  `status` enum('active','inactive','pending','rejected') NOT NULL DEFAULT 'pending',
  `created_by` char(36) DEFAULT NULL,
  `validated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `characteristics`
--

INSERT INTO `characteristics` (`id`, `name`, `description`, `type`, `status`, `created_by`, `validated_by`, `created_at`) VALUES
('60000000-0000-0000-0000-000000000001', 'Text input', 'Accepts plain text as input.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000002', 'Image input', 'Accepts images as input.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000003', 'Audio input', 'Accepts audio files or microphone input.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000004', 'Text output', 'Produces text as output.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000005', 'Image output', 'Produces images as output.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000006', 'Audio output', 'Produces audio or speech as output.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000007', 'Video output', 'Produces video as output.', 'modality', 'active', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000008', 'API access', 'Provides a public REST or WebSocket API.', 'integration', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000009', 'Long context window', 'Supports very long conversations or documents.', 'capability', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000010', 'Code generation', 'Capable of writing and explaining code.', 'capability', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000011', 'Fine-tuning', 'Supports custom fine-tuning on user data.', 'capability', 'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000012', 'Open source', 'Model weights or code are publicly available.', 'capability', 'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000013', 'Rate limited', 'Free tier is subject to request rate limits.', 'limitation', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000014', 'No offline mode', 'Requires internet connection to function.', 'limitation', 'active', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28'),
('60000000-0000-0000-0000-000000000015', 'Multilingual', 'Supports multiple languages beyond English.', 'language', 'active', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `disadvantages`
--

CREATE TABLE `disadvantages` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `disadvantage_name` varchar(255) NOT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disadvantages`
--

INSERT INTO `disadvantages` (`id`, `tool_id`, `disadvantage_name`, `created_by`, `created_at`) VALUES
('70160e03-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', 'Knowledge cutoff - not always up to date', NULL, '2026-06-04 01:12:17'),
('70162967-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', 'Rate limits on free tier', NULL, '2026-06-04 01:12:17'),
('75d4d2eb-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Peut nécessiter une connexion Internet constante.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d50128-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Limité par des quotas d\'utilisation.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d56db0-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Pas encore open source.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('75d58e65-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', 'Peut avoir des temps de réponse variables.', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', '2026-06-15 18:03:06'),
('81000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000006', 'Requires paid GitHub subscription', '00000000-0000-0000-0000-000000000004', '2026-04-27 21:09:28'),
('81000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000007', 'Character limits even on paid tiers', '00000000-0000-0000-0000-000000000005', '2026-04-27 21:09:28'),
('81000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000008', 'Credits run out quickly on lower plans', '00000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `type` enum('search','view','compare','add_to_playlist','review') NOT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`id`, `user_id`, `type`, `content`, `created_at`) VALUES
('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'search', 'image generation tools', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'view', '30000000-0000-0000-0000-000000000004', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'compare', '30000000-0000-0000-0000-000000000004,30000000-0000-0000-0000-000000000005', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'add_to_playlist', '30000000-0000-0000-0000-000000000002', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'search', 'code assistant AI', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'view', '30000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', 'review', '30000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'search', 'text to speech', '2026-04-27 21:09:28'),
('d0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000006', 'view', '30000000-0000-0000-0000-000000000007', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `models`
--

CREATE TABLE `models` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `provider_id` char(36) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `validated_by` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `status` enum('active','inactive','pending','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `models`
--

INSERT INTO `models` (`id`, `provider_id`, `created_by`, `validated_by`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'GPT-4o', 'OpenAI multimodal flagship model supporting text, image, and audio I/O.', 'multimodal,text,vision,audio,openai', 'active', '2026-05-22 11:08:48', '2026-05-22 11:08:48'),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Claude Sonnet 4.6', 'Anthropic balanced model optimised for speed and quality.', 'text,reasoning,safety,anthropic', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gemini 2.5 Pro', 'Google latest multimodal model with advanced reasoning and long context.', 'multimodal,text,vision,google', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Midjourney v6.1', 'Latest Midjourney diffusion model with enhanced photorealism.', 'image,diffusion,midjourney', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'SDXL 1.0', 'Stability AI high-resolution open-source image generation model.', 'image,diffusion,open-source,stability', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Codex', 'OpenAI code-specialised model powering GitHub Copilot.', 'code,text,openai', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ElevenLabs Multilingual v2', 'ElevenLabs TTS model supporting 29 languages with natural prosody.', 'audio,tts,multilingual,elevenlabs', 'active', '2026-04-27 21:09:28', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `model_characteristics`
--

CREATE TABLE `model_characteristics` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `model_id` char(36) NOT NULL,
  `characteristic_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `status` enum('unread','read') NOT NULL DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `link`, `status`, `created_at`, `updated_at`) VALUES
('0ec65cdc-68e5-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Félicitations ! Votre suggestion d\'outil \'Midjourney\' a été approuvée par l\'administrateur.', '/discover/midjourney', 'unread', '2026-06-15 18:07:22', '2026-06-15 18:07:22'),
('2841749d-60ce-11f1-8c64-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Félicitations ! Votre suggestion d\'outil \'ChatGPT extern\' a été automatiquement validée et publiée.', '/discover/chatgpt-extern', 'unread', '2026-06-05 11:03:15', '2026-06-05 11:03:15'),
('5a75e2c8-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'Midjourney AI Image Generator\' a été refusée par l\'administrateur. Raison : tt', NULL, 'unread', '2026-06-15 17:48:01', '2026-06-15 17:48:01'),
('5ed3ce7b-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'ChatGPT6\' a été refusée par l\'administrateur. Raison : rejected\n', NULL, 'unread', '2026-06-15 17:48:08', '2026-06-15 17:48:08'),
('6280f8f2-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'Midjourney AI2\' a été refusée par l\'administrateur. Raison : rejected\n', NULL, 'unread', '2026-06-15 17:48:14', '2026-06-15 17:48:14'),
('65c7a6f8-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'ChatGPT5\' a été refusée par l\'administrateur. Raison : rejected\n', NULL, 'unread', '2026-06-15 17:48:20', '2026-06-15 17:48:20'),
('6961b5e0-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'ChatGPT2\' a été refusée par l\'administrateur. Raison : rejected\n', NULL, 'unread', '2026-06-15 17:48:26', '2026-06-15 17:48:26'),
('6d11508e-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'Free Crypto Bitcoin Hack\' a été refusée par l\'administrateur. Raison : rejected', NULL, 'unread', '2026-06-15 17:48:32', '2026-06-15 17:48:32'),
('70d2780f-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'Cool Tool\' a été refusée par l\'administrateur. Raison : rejected', NULL, 'unread', '2026-06-15 17:48:38', '2026-06-15 17:48:38'),
('74b0cdeb-68e2-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'Midjourney AI\' a été refusée par l\'administrateur. Raison : rejected\n', NULL, 'unread', '2026-06-15 17:48:45', '2026-06-15 17:48:45'),
('75d61bf3-68e4-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Félicitations ! Votre suggestion d\'outil \'claude\' a été automatiquement validée et publiée.', '/discover/claude', 'unread', '2026-06-15 18:03:06', '2026-06-15 18:03:06'),
('7d6c1475-60cd-11f1-8c64-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'test\' a été refusée par l\'administrateur. Raison : test', NULL, 'unread', '2026-06-05 10:58:28', '2026-06-05 10:58:28'),
('888c9bb7-68e5-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Votre suggestion d\'outil \'gemini\' a été refusée par l\'administrateur. Raison : i want', NULL, 'unread', '2026-06-15 18:10:47', '2026-06-15 18:10:47'),
('938f09f3-68e4-11f1-8226-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'Félicitations ! Votre suggestion d\'outil \'Midjourney\' a été automatiquement validée et publiée.', '/discover/midjourney', 'unread', '2026-06-15 18:03:56', '2026-06-15 18:03:56'),
('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Your review for ChatGPT has been approved.', '/tools/30000000-0000-0000-0000-000000000001', 'read', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Your review for GitHub Copilot has been approved.', '/tools/30000000-0000-0000-0000-000000000006', 'read', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'A new tool has been added to the category you follow: Audio & Voice.', '/categories/20000000-0000-0000-0000-000000000004', 'unread', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('e0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'Midjourney has released a new version. Check it out!', '/tools/30000000-0000-0000-0000-000000000004', 'unread', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('e0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'Welcome to XploreIA! Confirm your email to get started.', '/account/verify', 'unread', '2026-04-27 21:09:28', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `performance`
--

CREATE TABLE `performance` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `model_id` char(36) NOT NULL,
  `response_quality` int(11) DEFAULT NULL CHECK (`response_quality` between 0 and 100),
  `speed` int(11) DEFAULT NULL CHECK (`speed` between 0 and 100),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance`
--

INSERT INTO `performance` (`id`, `model_id`, `response_quality`, `speed`, `created_at`) VALUES
('c0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 96, 85, '2026-04-27 21:09:28'),
('c0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 92, 82, '2026-04-27 21:09:28'),
('c0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 95, 70, '2026-04-27 21:09:28'),
('c0000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 88, 65, '2026-04-27 21:09:28'),
('c0000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 91, 93, '2026-04-27 21:09:28'),
('c0000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', 93, 78, '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `playlists`
--

CREATE TABLE `playlists` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `playlists`
--

INSERT INTO `playlists` (`id`, `user_id`, `name`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
('107ae3f8-4fee-11f1-90af-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'development', '', 0, '2026-05-14 23:38:52', '2026-05-15 08:13:11'),
('35a3b28b-60b8-11f1-8c64-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'gg', '', 0, '2026-06-05 08:26:08', '2026-06-05 08:26:08'),
('6ef1fea7-6915-11f1-bd1f-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'meriem', '', 0, '2026-06-15 23:53:40', '2026-06-15 23:53:40'),
('975c0f63-60cf-11f1-8c64-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'youssef', '', 0, '2026-06-05 11:13:31', '2026-06-05 11:13:31'),
('9de36b47-60cf-11f1-8c64-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'test', '', 0, '2026-06-05 11:13:42', '2026-06-05 11:13:42'),
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'My daily AI stack', 'Tools I use every single day.', 1, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Creative AI tools', 'Best tools for art and creative projects.', 1, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'Developer toolkit', 'AI tools every developer should know.', 1, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'To evaluate', 'Tools I want to try later.', 0, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('ea861b49-5fab-11f1-bcdb-e4a8dfef831e', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'test', 'test', 0, '2026-06-04 00:25:36', '2026-06-04 00:25:36');

-- --------------------------------------------------------

--
-- Table structure for table `playlist_items`
--

CREATE TABLE `playlist_items` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `playlist_id` char(36) NOT NULL,
  `tool_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `playlist_items`
--

INSERT INTO `playlist_items` (`id`, `playlist_id`, `tool_id`, `created_at`, `updated_at`) VALUES
('6efac276-6915-11f1-bd1f-e4a8dfef831e', '6ef1fea7-6915-11f1-bd1f-e4a8dfef831e', '30000000-0000-0000-0000-000000000006', '2026-06-15 23:53:40', '2026-06-15 23:53:40'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('c9fbdd1d-5fab-11f1-bcdb-e4a8dfef831e', '107ae3f8-4fee-11f1-90af-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '2026-06-04 00:24:42', '2026-06-04 00:24:42'),
('ef0446d3-5fab-11f1-bcdb-e4a8dfef831e', 'ea861b49-5fab-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000007', '2026-06-04 00:25:44', '2026-06-04 00:25:44');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_plans`
--

CREATE TABLE `pricing_plans` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `pricing_type` enum('free','freemium','subscription','one_time','usage_based','enterprise') NOT NULL DEFAULT 'free',
  `tier_number` int(11) DEFAULT NULL,
  `price_month` decimal(10,2) DEFAULT NULL,
  `price_year` decimal(10,2) DEFAULT NULL,
  `features` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pricing_plans`
--

INSERT INTO `pricing_plans` (`id`, `tool_id`, `plan_name`, `pricing_type`, `tier_number`, `price_month`, `price_year`, `features`, `created_at`) VALUES
('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Free', 'free', 1, 0.00, NULL, '[\"GPT-4o mini\",\"Limited GPT-4o\",\"DALL-E basic\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Plus', 'subscription', 2, 20.00, 200.00, '[\"GPT-4o full\",\"DALL-E 3\",\"Advanced data analysis\",\"File uploads\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Team', 'subscription', 3, 30.00, 300.00, '[\"Everything in Plus\",\"Team workspace\",\"Admin controls\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000006', 'Individual', 'subscription', 1, 10.00, 100.00, '[\"IDE plugin\",\"Code completions\",\"Chat\",\"CLI\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000006', 'Business', 'subscription', 2, 19.00, 190.00, '[\"Everything Individual\",\"Policy management\",\"Audit logs\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000007', 'Free', 'free', 1, 0.00, NULL, '[\"10k characters/month\",\"3 custom voices\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000007', 'Starter', 'subscription', 2, 5.00, 50.00, '[\"30k characters/month\",\"10 custom voices\",\"API access\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000007', 'Creator', 'subscription', 3, 22.00, 220.00, '[\"100k characters/month\",\"30 custom voices\",\"Commercial licence\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000008', 'Basic', 'subscription', 1, 12.00, 120.00, '[\"125 credits/month\",\"720p video\",\"Watermark\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000008', 'Standard', 'subscription', 2, 28.00, 280.00, '[\"625 credits/month\",\"1080p video\",\"No watermark\"]', '2026-04-27 21:09:28'),
('70000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000008', 'Pro', 'subscription', 3, 76.00, 760.00, '[\"2250 credits/month\",\"4K video\",\"Custom voices\",\"Priority\"]', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `providers`
--

CREATE TABLE `providers` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ceo` varchar(150) DEFAULT NULL,
  `date_founded` date DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','pending','rejected') NOT NULL DEFAULT 'pending',
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `providers`
--

INSERT INTO `providers` (`id`, `name`, `country`, `description`, `ceo`, `date_founded`, `website_url`, `logo_url`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('10000000-0000-0000-0000-000000000001', 'OpenAI', 'USA', 'AI research lab behind GPT and DALL-E.', 'Sam Altman', '2015-12-11', 'https://openai.com', 'https://logo.clearbit.com/openai.com', 'active', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000002', 'Anthropic', 'USA', 'Safety-focused AI company, creator of Claude.', 'Dario Amodei', '2021-01-01', 'https://anthropic.com', 'https://logo.clearbit.com/anthropic.com', 'active', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000003', 'Google DeepMind', 'USA', 'Google AI division, creator of Gemini.', 'Demis Hassabis', '2010-09-23', 'https://deepmind.google', 'https://logo.clearbit.com/deepmind.google', 'active', '00000000-0000-0000-0000-000000000001', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000004', 'Midjourney', 'USA', 'Independent lab specialising in image generation.', 'David Holz', '2021-08-01', 'https://midjourney.com', 'https://logo.clearbit.com/midjourney.com', 'active', '00000000-0000-0000-0000-000000000002', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000005', 'Stability AI', 'UK', 'Open-source generative AI company.', 'Prem Akkaraju', '2019-01-01', 'https://stability.ai', 'https://logo.clearbit.com/stability.ai', 'active', '00000000-0000-0000-0000-000000000002', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000006', 'ElevenLabs', 'USA', 'AI voice synthesis and cloning platform.', 'Mati Staniszewski', '2022-01-01', 'https://elevenlabs.io', 'https://logo.clearbit.com/elevenlabs.io', 'active', '00000000-0000-0000-0000-000000000003', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('10000000-0000-0000-0000-000000000007', 'Runway', 'USA', 'Creative AI tools for video and images.', 'Cristobal Valenzuela', '2018-01-01', 'https://runwayml.com', 'https://logo.clearbit.com/runwayml.com', 'active', '00000000-0000-0000-0000-000000000003', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('283e9065-60ce-11f1-8c64-e4a8dfef831e', 'Communauté', NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-05 11:03:15', '2026-06-05 11:03:15'),
('ec3cef25-60cd-11f1-8c64-e4a8dfef831e', 'Test Provider', NULL, NULL, NULL, NULL, NULL, NULL, 'inactive', NULL, '2026-06-05 11:01:34', '2026-06-05 19:40:54');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `tool_id`, `user_id`, `comment`, `rating`, `status`, `created_at`, `updated_at`) VALUES
('03c879f6-07f7-46c6-8ab5-ccbf1770dee1', '30000000-0000-0000-0000-000000000006', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'good', 5, 'approved', '2026-06-05 08:47:10', '2026-06-05 08:47:10'),
('67191128-fd25-4095-b3ee-f2d6a9b97a5d', '30000000-0000-0000-0000-000000000006', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'salam', 5, 'approved', '2026-06-04 11:21:15', '2026-06-04 11:21:15'),
('8627c89c-32ad-4950-ab64-d469c3810d6a', '30000000-0000-0000-0000-000000000006', '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'fuck', 5, 'rejected', '2026-06-05 08:47:22', '2026-06-05 08:47:22'),
('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'ChatGPT is incredibly versatile. I use it daily for writing, research, and code. The free tier is quite generous.', 5, 'approved', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Great for most tasks, but I wish the knowledge cutoff was more recent. Still, the best all-around AI tool.', 4, 'approved', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('90000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'Copilot has made me at least 30% faster as a developer. The inline suggestions are accurate and context-aware.', 5, 'approved', '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('90000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', 'Runway Gen-3 is impressive for short video clips. Credits disappear fast though - pricing could be better.', 4, 'approved', '2026-04-27 21:09:28', '2026-04-27 21:09:28');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key_name` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key_name`, `value`) VALUES
('ai_auto_approval', '0');

-- --------------------------------------------------------

--
-- Table structure for table `tool_characteristics`
--

CREATE TABLE `tool_characteristics` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `characteristic_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tool_characteristics`
--

INSERT INTO `tool_characteristics` (`id`, `tool_id`, `characteristic_id`) VALUES
('70180556-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001'),
('70189f7a-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002'),
('7018b271-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004'),
('7018c04d-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000008'),
('7018d2bc-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000010'),
('7018e2c2-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000015'),
('61000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000004'),
('61000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000010'),
('61000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000006'),
('61000000-0000-0000-0000-000000000028', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000008'),
('61000000-0000-0000-0000-000000000029', '30000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000015'),
('61000000-0000-0000-0000-000000000030', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000001'),
('61000000-0000-0000-0000-000000000031', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000005'),
('61000000-0000-0000-0000-000000000032', '30000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000007'),
('75d31797-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', '60000000-0000-0000-0000-000000000008'),
('75d388fc-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', '60000000-0000-0000-0000-000000000011');

-- --------------------------------------------------------

--
-- Table structure for table `tool_models`
--

CREATE TABLE `tool_models` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `tool_id` char(36) NOT NULL,
  `model_id` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tool_models`
--

INSERT INTO `tool_models` (`id`, `tool_id`, `model_id`) VALUES
('7017402c-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('7017b840-5fb2-11f1-bcdb-e4a8dfef831e', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006'),
('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006'),
('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007'),
('75d2e001-68e4-11f1-8226-e4a8dfef831e', '75d26c89-68e4-11f1-8226-e4a8dfef831e', '40000000-0000-0000-0000-000000000002');

-- --------------------------------------------------------

--
-- Table structure for table `tool_suggestions`
--

CREATE TABLE `tool_suggestions` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `main_category_id` varchar(50) DEFAULT NULL,
  `pricing_model` varchar(20) DEFAULT 'unknown',
  `provider_name` varchar(255) DEFAULT NULL,
  `submitted_by` varchar(50) DEFAULT NULL,
  `ai_score` int(11) DEFAULT NULL,
  `ai_feedback` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `model_ids` text DEFAULT NULL,
  `characteristic_ids` text DEFAULT NULL,
  `advantages` text DEFAULT NULL,
  `disadvantages` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tool_suggestions`
--

INSERT INTO `tool_suggestions` (`id`, `name`, `description`, `website_url`, `logo_url`, `main_category_id`, `pricing_model`, `provider_name`, `submitted_by`, `ai_score`, `ai_feedback`, `admin_notes`, `status`, `created_at`, `updated_at`, `model_ids`, `characteristic_ids`, `advantages`, `disadvantages`) VALUES
('0082d8b4-60cb-11f1-8c64-e4a8dfef831e', 'Cool Tool', 'Un outil sympa.', 'http://test.com', NULL, '20000000-0000-0000-0000-000000000004', 'free', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 25, 'L\'outil \'Cool Tool\' présente des caractéristiques très limitées, avec aucune fonctionnalité ou modèle spécifique mentionné. Bien qu\'il soit gratuit et puisse sembler sympathique, son manque de profondeur et d\'innovation le rend peu pertinent dans la catégorie Audio & Voice. Les avantages et inconvénients sont trop vagues pour évaluer son utilité réelle.', 'rejected', 'rejected', '2026-06-05 10:40:40', '2026-06-15 17:48:38', '[]', '[]', '[\"Sympa\"]', '[\"Trop simple\"]'),
('01f911e8-68e5-11f1-8226-e4a8dfef831e', 'Midjourney', 'Midjourney est un outil d\'intelligence artificielle spécialisé dans la génération d\'images à partir de descriptions textuelles, offrant des résultats artistiques et créatifs.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 100, 'L\'outil Midjourney existe réellement sur le marché et est bien connu pour sa capacité à générer des images à partir de descriptions textuelles. Les informations fournies, y compris le site web, les caractéristiques, les avantages et les inconvénients, sont toutes précises et correspondent aux capacités réelles du produit.', NULL, 'approved', '2026-06-15 18:07:01', '2026-06-15 18:07:22', '[\"40000000-0000-0000-0000-000000000004\"]', '[\"60000000-0000-0000-0000-000000000002\",\"60000000-0000-0000-0000-000000000005\"]', '[\"G\\u00e9n\\u00e9ration d\'images de haute qualit\\u00e9.\",\"Interface utilisateur intuitive.\",\"R\\u00e9sultats artistiques uniques.\",\"Acc\\u00e8s \\u00e0 une communaut\\u00e9 cr\\u00e9ative.\"]', '[\"Limites sur le nombre d\'images g\\u00e9n\\u00e9r\\u00e9es dans la version gratuite.\",\"Peut n\\u00e9cessiter un temps d\'attente pour le traitement.\",\"Pas d\'option hors ligne.\",\"D\\u00e9pendance \\u00e0 une connexion Internet.\"]'),
('067bbadf-681c-11f1-9b1d-e4a8dfef831e', 'Midjourney AI Image Generator', 'Midjourney est un service d’intelligence artificielle de pointe spécialisé dans la génération d’images ultra-réalistes et artistiques à partir de descriptions textuelles en langage naturel. Il utilise des modèles génératifs extrêmement performants pour aider les artistes, designers et créateurs de contenu à concevoir des œuvres visuelles uniques en quelques secondes.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 70, 'L\'outil Midjourney AI Image Generator existe réellement et est accessible via l\'URL fournie. Cependant, certaines informations sont inexactes, notamment les modèles utilisés, car Midjourney ne s\'appuie pas sur Claude Sonnet ou Codex. De plus, bien que le service soit accessible via Discord, il n\'a pas d\'interface web native, ce qui est un inconvénient notable. La tarification freemium est correcte, mais les détails sur l\'essai gratuit pourraient être plus précis.', 'tt', 'rejected', '2026-06-14 18:08:20', '2026-06-15 17:48:01', '[\"40000000-0000-0000-0000-000000000002\",\"40000000-0000-0000-0000-000000000006\"]', '[\"60000000-0000-0000-0000-000000000008\",\"60000000-0000-0000-0000-000000000003\"]', '[\"Qualit\\u00e9 d\\u2019image photor\\u00e9aliste et artistique exceptionnelle\",\"G\\u00e9n\\u00e9ration ultra-rapide par rapport aux autres services\",\"Grande communaut\\u00e9 active pour le partage d\\u2019id\\u00e9es\"]', '[\"N\\u2019a pas d\\u2019interface web native (accessible via Discord uniquement)\",\"Payant apr\\u00e8s un essai tr\\u00e8s court\"]'),
('08593fc9-60ca-11f1-8c64-e4a8dfef831e', 'test', 'test', 'https://exploreia.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog', NULL, '20000000-0000-0000-0000-000000000004', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 25, 'L\'outil présente des informations très limitées et peu claires, ce qui rend difficile une évaluation précise de sa pertinence. Les caractéristiques, avantages et inconvénients ne sont pas suffisamment développés pour juger de leur crédibilité.', 'test', 'rejected', '2026-06-05 10:33:43', '2026-06-05 10:58:28', '[\"40000000-0000-0000-0000-000000000006\",\"40000000-0000-0000-0000-000000000003\"]', '[\"60000000-0000-0000-0000-000000000011\",\"60000000-0000-0000-0000-000000000003\"]', '[\"test\"]', '[\"test2\"]'),
('090de91f-60cb-11f1-8c64-e4a8dfef831e', 'Free Crypto Bitcoin Hack', 'Gagnez de l\'argent facilement avec ce logiciel. Hack tous les comptes.', 'http://free-money.xyz', NULL, '20000000-0000-0000-0000-000000000005', 'free', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 10, 'L\'outil \'Free Crypto Bitcoin Hack\' semble être une arnaque, ce qui nuit gravement à sa crédibilité. Les caractéristiques et avantages mentionnés sont vagues et peu fiables, tandis que les inconvénients soulignent des problèmes éthiques et légaux. En conséquence, cet outil ne peut pas être considéré comme pertinent ou utile.', 'rejected', 'rejected', '2026-06-05 10:40:54', '2026-06-15 17:48:32', '[]', '[]', '[\"Argent gratuit\"]', '[\"Arnaque suspecte\",\"Ill\\u00e9gal\"]'),
('1874d7fb-60ce-11f1-8c64-e4a8dfef831e', 'ChatGPT6', 'Assistant IA conversationnel développé par OpenAI. Permet de discuter et de générer du texte.', 'https://chat.openai.com', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 50, 'L\'outil \'ChatGPT6\' n\'existe pas sous ce nom, mais il semble faire référence à ChatGPT développé par OpenAI. L\'URL fournie est correcte, mais le nom et le modèle \'GPT-4o\' ne sont pas des désignations officielles. Les informations sur les avantages et inconvénients sont en partie correctes, mais la description manque de détails sur les caractéristiques réelles du produit.', 'rejected\n', 'rejected', '2026-06-05 11:02:48', '2026-06-15 17:48:08', '[\"40000000-0000-0000-0000-000000000001\"]', '[]', '[\"G\\u00e9n\\u00e9ration de code\",\"Explications claires\",\"Interface web conviviale\"]', '[\"Parfois des hallucinations\"]'),
('19e18d17-60cb-11f1-8c64-e4a8dfef831e', 'ChatGPT2', 'Assistant IA conversationnel développé par OpenAI. Permet de discuter et de générer du texte.', 'https://chat.openai.ma', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 75, 'ChatGPT2 est un outil d\'IA conversationnel prometteur, offrant des fonctionnalités intéressantes comme la génération de code et des explications claires. Cependant, l\'absence de caractéristiques détaillées et le problème des hallucinations nuisent à sa crédibilité. Malgré cela, son interface conviviale et son modèle avancé en font un choix pertinent dans la catégorie des chatbots.', 'rejected\n', 'rejected', '2026-06-05 10:41:22', '2026-06-15 17:48:26', '[\"40000000-0000-0000-0000-000000000001\"]', '[]', '[\"G\\u00e9n\\u00e9ration de code\",\"Explications claires\",\"Interface web conviviale\"]', '[\"Parfois des hallucinations\"]'),
('283dd5e0-60ce-11f1-8c64-e4a8dfef831e', 'ChatGPT extern', 'Assistant IA conversationnel développé par OpenAI. Permet de discuter et de générer du texte.', 'https://chat.openai.com', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 70, 'L\'outil \'ChatGPT extern\' semble être une référence à ChatGPT développé par OpenAI, qui existe réellement. Cependant, le nom \'ChatGPT extern\' n\'est pas officiellement reconnu. L\'URL fournie est correcte, mais le modèle mentionné \'GPT-4o\' n\'existe pas, ce qui soulève des doutes sur l\'exactitude des informations. Les caractéristiques, avantages et inconvénients correspondent globalement aux capacités de ChatGPT, mais l\'absence de détails sur les caractéristiques principales limite la crédibilité.', NULL, 'approved', '2026-06-05 11:03:15', '2026-06-05 11:03:15', '[\"40000000-0000-0000-0000-000000000001\"]', '[]', '[\"G\\u00e9n\\u00e9ration de code\",\"Explications claires\",\"Interface web conviviale\"]', '[\"Parfois des hallucinations\"]'),
('4a1a9ff0-68e3-11f1-8226-e4a8dfef831e', 'claude', 'Claude est un assistant virtuel avancé, conçu pour interagir de manière naturelle et efficace avec les utilisateurs, offrant des réponses précises et contextuelles.', 'https://claude.ai', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 90, 'L\'outil Claude existe réellement sur le marché, développé par Anthropic, et l\'URL fournie (https://claude.ai) est correcte. Les informations sur ses caractéristiques, avantages et inconvénients sont également précises et correspondent aux capacités réelles du produit.', NULL, 'approved', '2026-06-15 17:54:43', '2026-06-15 18:03:06', '[\"40000000-0000-0000-0000-000000000002\"]', '[\"60000000-0000-0000-0000-000000000008\",\"60000000-0000-0000-0000-000000000011\"]', '[\"Interaction naturelle avec les utilisateurs.\",\"R\\u00e9ponses contextuelles et pr\\u00e9cises.\",\"Acc\\u00e8s via API pour int\\u00e9gration facile.\",\"Capacit\\u00e9 de fine-tuning pour des besoins sp\\u00e9cifiques.\"]', '[\"Peut n\\u00e9cessiter une connexion Internet constante.\",\"Limit\\u00e9 par des quotas d\'utilisation.\",\"Pas encore open source.\",\"Peut avoir des temps de r\\u00e9ponse variables.\"]'),
('7108052b-68e5-11f1-8226-e4a8dfef831e', 'gemini', 'Gemini est un outil d\'intelligence artificielle développé par Google, offrant des capacités avancées de traitement du langage naturel et d\'analyse de données.', 'https://gemini.google.com/app', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 70, 'L\'outil Gemini existe réellement et est développé par Google, mais l\'URL fournie n\'est pas correcte. Le site officiel de Gemini est accessible via d\'autres liens associés à Google. Les caractéristiques et avantages mentionnés sont en grande partie valides, mais la tarification et les modèles utilisés nécessitent une vérification plus approfondie. En raison de l\'URL incorrecte, le score est réduit.', 'i want', 'rejected', '2026-06-15 18:10:07', '2026-06-15 18:10:47', '[\"40000000-0000-0000-0000-000000000003\"]', '[\"60000000-0000-0000-0000-000000000010\",\"60000000-0000-0000-0000-000000000015\"]', '[\"Int\\u00e9gration facile avec d\'autres services Google.\",\"Capacit\\u00e9s avanc\\u00e9es de traitement du langage naturel.\",\"Interface utilisateur intuitive.\",\"Acc\\u00e8s \\u00e0 des fonctionnalit\\u00e9s de fine-tuning.\"]', '[\"Peut n\\u00e9cessiter une connexion Internet constante.\",\"Limit\\u00e9 par des quotas d\'utilisation.\",\"Pas encore disponible dans toutes les langues.\",\"Peut \\u00eatre complexe pour les nouveaux utilisateurs.\"]'),
('9386b82d-68e4-11f1-8226-e4a8dfef831e', 'Midjourney', 'Midjourney est un outil d\'intelligence artificielle spécialisé dans la génération d\'images à partir de descriptions textuelles, offrant des résultats artistiques et créatifs.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 100, 'L\'outil Midjourney existe réellement sur le marché et son site officiel est valide. Les informations fournies concernant ses caractéristiques, avantages et inconvénients sont précises et correspondent aux capacités réelles du produit.', NULL, 'approved', '2026-06-15 18:03:56', '2026-06-15 18:03:56', '[\"40000000-0000-0000-0000-000000000004\"]', '[\"60000000-0000-0000-0000-000000000002\",\"60000000-0000-0000-0000-000000000005\"]', '[\"G\\u00e9n\\u00e9ration d\'images de haute qualit\\u00e9.\",\"Interface utilisateur intuitive.\",\"R\\u00e9sultats artistiques vari\\u00e9s.\",\"Acc\\u00e8s \\u00e0 une communaut\\u00e9 cr\\u00e9ative.\"]', '[\"Limites sur le nombre d\'images g\\u00e9n\\u00e9r\\u00e9es dans la version gratuite.\",\"Peut n\\u00e9cessiter un temps d\'attente pour le traitement.\",\"Pas d\'option hors ligne.\",\"D\\u00e9pendance \\u00e0 une connexion Internet.\"]'),
('aabd6f8b-60cb-11f1-8c64-e4a8dfef831e', 'ChatGPT5', 'Assistant IA conversationnel développé par OpenAI. Permet de discuter et de générer du texte.', 'https://chat.openai.com', NULL, '20000000-0000-0000-0000-000000000006', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 50, 'L\'outil \'ChatGPT5\' n\'existe pas sous ce nom, bien que le site mentionné soit celui de ChatGPT développé par OpenAI. Le modèle utilisé est incorrectement nommé \'GPT-4o\', car le modèle actuel est GPT-4. Les informations sur les caractéristiques, avantages et inconvénients sont en partie correctes, mais le nom et le modèle sont erronés, ce qui affecte la crédibilité.', 'rejected\n', 'rejected', '2026-06-05 10:45:25', '2026-06-15 17:48:20', '[\"40000000-0000-0000-0000-000000000001\"]', '[]', '[\"G\\u00e9n\\u00e9ration de code\",\"Explications claires\",\"Interface web conviviale\"]', '[\"Parfois des hallucinations\"]'),
('bcd261a1-6914-11f1-bd1f-e4a8dfef831e', 'Midjourney', 'Midjourney est un outil d\'intelligence artificielle spécialisé dans la génération d\'images à partir de descriptions textuelles, offrant des résultats artistiques et créatifs.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 100, 'L\'outil Midjourney existe réellement sur le marché et est bien connu pour sa capacité à générer des images à partir de descriptions textuelles. Les informations fournies, y compris le site web, la tarification et les caractéristiques, sont toutes correctes et correspondent aux capacités réelles du produit.', NULL, 'pending', '2026-06-15 23:48:41', '2026-06-15 23:48:41', '[\"40000000-0000-0000-0000-000000000004\"]', '[\"60000000-0000-0000-0000-000000000002\",\"60000000-0000-0000-0000-000000000005\"]', '[\"G\\u00e9n\\u00e9ration d\'images de haute qualit\\u00e9.\",\"Interface utilisateur intuitive.\",\"R\\u00e9sultats artistiques uniques.\",\"Acc\\u00e8s \\u00e0 une communaut\\u00e9 cr\\u00e9ative.\"]', '[\"Limites sur le nombre d\'images g\\u00e9n\\u00e9r\\u00e9es dans la version gratuite.\",\"Peut n\\u00e9cessiter des ajustements pour des r\\u00e9sultats pr\\u00e9cis.\",\"D\\u00e9pendance \\u00e0 une connexion Internet.\",\"Pas d\'option hors ligne.\"]'),
('e1edc61b-60ca-11f1-8c64-e4a8dfef831e', 'Midjourney AI', 'Midjourney est un générateur d\'images par intelligence artificielle. Il permet de créer des visuels époustouflants à partir de descriptions textuelles. L\'outil est accessible via Discord et propose différents plans tarifaires. Il est utilisé par des millions de créateurs dans le monde.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 85, 'Midjourney AI est un outil d\'intelligence artificielle très pertinent pour la génération d\'images, offrant des résultats visuels impressionnants. Ses caractéristiques, telles que la qualité artistique et l\'accessibilité via Discord, sont des atouts majeurs. Cependant, le fait qu\'il soit limité à une plateforme et que l\'utilisation intensive soit payante peut constituer des inconvénients pour certains utilisateurs.', 'rejected\n', 'rejected', '2026-06-05 10:39:48', '2026-06-15 17:48:45', '[\"40000000-0000-0000-0000-000000000004\"]', '[\"60000000-0000-0000-0000-000000000002\"]', '[\"G\\u00e9n\\u00e9ration ultra-r\\u00e9aliste\",\"Grande communaut\\u00e9\",\"Qualit\\u00e9 artistique incroyable\"]', '[\"Uniquement sur Discord\",\"Payant pour usage intensif\"]'),
('fe3bd01f-60cc-11f1-8c64-e4a8dfef831e', 'Midjourney AI2', 'Midjourney est un générateur d\'images par intelligence artificielle. Il permet de créer des visuels époustouflants à partir de descriptions textuelles. L\'outil est accessible via Discord et propose différents plans tarifaires. Il est utilisé par des millions de créateurs dans le monde.', 'https://www.midjourney.com', NULL, '20000000-0000-0000-0000-000000000002', 'freemium', NULL, '58c0ba06-45a8-11f1-8588-e4a8dfef831e', 90, 'L\'outil Midjourney existe réellement et est accessible via le site officiel mentionné. Les informations fournies sont globalement correctes, bien que le modèle mentionné soit en réalité Midjourney v5 à la date de ma dernière mise à jour. Les caractéristiques et les avantages correspondent aux capacités réelles du produit, mais il est important de noter que l\'outil est principalement utilisé via Discord et que les tarifs peuvent varier selon l\'utilisation.', 'rejected\n', 'rejected', '2026-06-05 10:54:55', '2026-06-15 17:48:14', '[\"40000000-0000-0000-0000-000000000004\"]', '[\"60000000-0000-0000-0000-000000000002\"]', '[\"G\\u00e9n\\u00e9ration ultra-r\\u00e9aliste\",\"Grande communaut\\u00e9\",\"Qualit\\u00e9 artistique incroyable\"]', '[\"Uniquement sur Discord\",\"Payant pour usage intensif\"]');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) NOT NULL,
  `password_hash` varbinary(255) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `profile_url` varchar(500) DEFAULT NULL,
  `status` enum('active','pending','banned','deleted') NOT NULL DEFAULT 'pending',
  `role` enum('user','moderator','admin') NOT NULL DEFAULT 'user',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `profile_url`, `status`, `role`, `last_login_at`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@xplore-ia.com', 0x243262243132244e6762784a3835, 'Zakariae Bakkari', 'https://xplore-ia.com/avatars/zakariae.png', 'active', 'admin', NULL, '2026-04-27 21:09:28', '2026-05-22 10:52:50'),
('00000000-0000-0000-0000-000000000002', 'meriem@xplore-ia.com', 0x243262243132244e6762784a3835, 'Meriem Hamri', 'https://xplore-ia.com/avatars/meriem.png', 'active', 'admin', NULL, '2026-04-27 21:09:28', '2026-06-01 14:18:40'),
('00000000-0000-0000-0000-000000000003', 'youssef@xplore-ia.com', 0x243262243132244e6762784a3835, 'Youssef Errami', 'https://xplore-ia.com/avatars/youssef.png', 'active', 'admin', NULL, '2026-04-27 21:09:28', '2026-06-01 14:18:42'),
('00000000-0000-0000-0000-000000000004', 'noureddine@gmail.com', 0x243262243132244e6762784a3835, 'Noureddine Oubraim', NULL, 'active', 'user', NULL, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('00000000-0000-0000-0000-000000000005', 'saad@gmail.com', 0x243262243132244e6762784a3835, 'Saad Ait Yahya', NULL, 'active', 'user', NULL, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('00000000-0000-0000-0000-000000000006', 'alice.martin@gmail.com', 0x243262243132244e6762784a3835, 'Alice Martin', NULL, 'active', 'user', NULL, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('00000000-0000-0000-0000-000000000008', 'clara.dupont@gmail.com', 0x243262243132244e6762784a3835, 'Clara Dupont', NULL, 'pending', 'user', NULL, '2026-04-27 21:09:28', '2026-04-27 21:09:28'),
('58c0ba06-45a8-11f1-8588-e4a8dfef831e', 'zakariatubtob@gmail.com', 0x24327924313024464f4c43656f4675464a3259344c62386b594e5577655645564778714464414d2f72392f787a726e49427262744e496e5a43444f57, 'zakariae', NULL, 'active', 'admin', NULL, '2026-05-01 21:54:37', '2026-05-24 00:02:47'),
('e7841dfb-512f-11f1-86f8-e4a8dfef831e', 'zakariabakkari2006@gmail.com', 0x24327924313024587a6b357974487471655672546a556d53446e77774f566d757256737a706a4d7a397a4f504255654f315276536961743057694e4f, 'zakaraie', NULL, 'active', 'user', NULL, '2026-05-16 14:02:41', '2026-06-04 00:50:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advantages`
--
ALTER TABLE `advantages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_adv_tool` (`tool_id`),
  ADD KEY `fk_adv_created_by` (`created_by`);

--
-- Indexes for table `ai_tools`
--
ALTER TABLE `ai_tools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tools_created_by` (`created_by`),
  ADD KEY `fk_tools_validated` (`validated_by`),
  ADD KEY `idx_ai_tools_category` (`main_category_id`),
  ADD KEY `idx_ai_tools_provider` (`provider_id`),
  ADD KEY `idx_ai_tools_status` (`status`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_name` (`name`);

--
-- Indexes for table `characteristics`
--
ALTER TABLE `characteristics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_char_created_by` (`created_by`),
  ADD KEY `fk_char_validated` (`validated_by`);

--
-- Indexes for table `disadvantages`
--
ALTER TABLE `disadvantages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_disadv_tool` (`tool_id`),
  ADD KEY `fk_disadv_created_by` (`created_by`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_history_user` (`user_id`),
  ADD KEY `idx_history_type` (`type`);

--
-- Indexes for table `models`
--
ALTER TABLE `models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_models_provider` (`provider_id`),
  ADD KEY `fk_models_created_by` (`created_by`),
  ADD KEY `fk_models_validated` (`validated_by`);

--
-- Indexes for table `model_characteristics`
--
ALTER TABLE `model_characteristics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_model_char` (`model_id`,`characteristic_id`),
  ADD KEY `fk_mc_char` (`characteristic_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_status` (`status`);

--
-- Indexes for table `performance`
--
ALTER TABLE `performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_perf_model` (`model_id`);

--
-- Indexes for table `playlists`
--
ALTER TABLE `playlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_playlists_user` (`user_id`);

--
-- Indexes for table `playlist_items`
--
ALTER TABLE `playlist_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_playlist_tool` (`playlist_id`,`tool_id`),
  ADD KEY `fk_pi_tool` (`tool_id`),
  ADD KEY `idx_playlist_items_pl` (`playlist_id`);

--
-- Indexes for table `pricing_plans`
--
ALTER TABLE `pricing_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pp_tool` (`tool_id`);

--
-- Indexes for table `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_providers_created_by` (`created_by`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_tool` (`tool_id`),
  ADD KEY `idx_reviews_user` (`user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key_name`);

--
-- Indexes for table `tool_characteristics`
--
ALTER TABLE `tool_characteristics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tool_char` (`tool_id`,`characteristic_id`),
  ADD KEY `fk_tc_char` (`characteristic_id`);

--
-- Indexes for table `tool_models`
--
ALTER TABLE `tool_models`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tool_model` (`tool_id`,`model_id`),
  ADD KEY `idx_tool_models_tool` (`tool_id`),
  ADD KEY `idx_tool_models_model` (`model_id`);

--
-- Indexes for table `tool_suggestions`
--
ALTER TABLE `tool_suggestions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advantages`
--
ALTER TABLE `advantages`
  ADD CONSTRAINT `fk_adv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_adv_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_tools`
--
ALTER TABLE `ai_tools`
  ADD CONSTRAINT `fk_tools_category` FOREIGN KEY (`main_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_provider` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_validated` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `characteristics`
--
ALTER TABLE `characteristics`
  ADD CONSTRAINT `fk_char_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_char_validated` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `disadvantages`
--
ALTER TABLE `disadvantages`
  ADD CONSTRAINT `fk_disadv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_disadv_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `models`
--
ALTER TABLE `models`
  ADD CONSTRAINT `fk_models_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_models_provider` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_models_validated` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_characteristics`
--
ALTER TABLE `model_characteristics`
  ADD CONSTRAINT `fk_mc_char` FOREIGN KEY (`characteristic_id`) REFERENCES `characteristics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mc_model` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance`
--
ALTER TABLE `performance`
  ADD CONSTRAINT `fk_perf_model` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `playlists`
--
ALTER TABLE `playlists`
  ADD CONSTRAINT `fk_playlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `playlist_items`
--
ALTER TABLE `playlist_items`
  ADD CONSTRAINT `fk_pi_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pi_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pricing_plans`
--
ALTER TABLE `pricing_plans`
  ADD CONSTRAINT `fk_pp_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `providers`
--
ALTER TABLE `providers`
  ADD CONSTRAINT `fk_providers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tool_characteristics`
--
ALTER TABLE `tool_characteristics`
  ADD CONSTRAINT `fk_tc_char` FOREIGN KEY (`characteristic_id`) REFERENCES `characteristics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tc_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tool_models`
--
ALTER TABLE `tool_models`
  ADD CONSTRAINT `fk_tm_model` FOREIGN KEY (`model_id`) REFERENCES `models` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tm_tool` FOREIGN KEY (`tool_id`) REFERENCES `ai_tools` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
