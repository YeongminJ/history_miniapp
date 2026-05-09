ALTER TABLE `users` ADD COLUMN `pending_points` integer NOT NULL DEFAULT 0;

CREATE TABLE `mission_claims` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_key` text NOT NULL,
  `date` text NOT NULL,
  `claimed_at` integer NOT NULL
);

CREATE UNIQUE INDEX `mission_claims_user_date` ON `mission_claims` (`user_key`, `date`);
