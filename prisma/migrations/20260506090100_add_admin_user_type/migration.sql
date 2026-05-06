-- AlterTable
ALTER TABLE `users` MODIFY `user_type` ENUM('creator', 'sponsor', 'admin') NOT NULL;
