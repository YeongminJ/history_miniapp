ALTER TABLE `mission_claims` ADD COLUMN `type` text NOT NULL DEFAULT 'daily_1';
ALTER TABLE `mission_claims` ADD COLUMN `amount` integer NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS `mission_claims_user_date`;
CREATE UNIQUE INDEX `mission_claims_user_date_type` ON `mission_claims` (`user_key`, `date`, `type`);
