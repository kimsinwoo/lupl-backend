-- AlterTable
ALTER TABLE `users` ADD COLUMN `profileImage` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `providerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `users_provider_providerId_idx` ON `users`(`provider`, `providerId`);
