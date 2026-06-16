-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 16, 2026 at 02:09 AM
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

--
-- Indexes for dumped tables
--

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
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_tools`
--
ALTER TABLE `ai_tools`
  ADD CONSTRAINT `fk_tools_category` FOREIGN KEY (`main_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_provider` FOREIGN KEY (`provider_id`) REFERENCES `providers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tools_validated` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
