/*
  Warnings:

  - A unique constraint covering the columns `[event_creator_id,event_sponsor_id,event_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_event_creator_id_fkey`;

-- DropIndex
DROP INDEX `conversations_event_creator_id_event_sponsor_id_key` ON `conversations`;

-- CreateIndex
CREATE UNIQUE INDEX `conversations_event_creator_id_event_sponsor_id_event_id_key` ON `conversations`(`event_creator_id`, `event_sponsor_id`, `event_id`);

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_event_creator_id_fkey` FOREIGN KEY (`event_creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
