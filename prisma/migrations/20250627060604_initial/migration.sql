-- CreateTable
CREATE TABLE `UsersLogin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'AUDITOR') NOT NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `emp_number` VARCHAR(10) NOT NULL,
    `face_directory` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RFIDCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `RFIDNumber`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255) NULL,
    `ip_address` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersRFIDCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `rfid_id` INTEGER NOT NULL,

    UNIQUE INDEX `UsersRFIDCard_user_id_rfid_id_key`(`user_id`, `rfid_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersRFIDCardRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userrfid_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,

    UNIQUE INDEX `UsersRFIDCardRoom_userrfid_id_room_id_key`(`userrfid_id`, `room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userrfid_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `access_log_image_dir` VARCHAR(255) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersRFIDCard` ADD CONSTRAINT `UsersRFIDCard_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersRFIDCard` ADD CONSTRAINT `UsersRFIDCard_rfid_id_fkey` FOREIGN KEY (`rfid_id`) REFERENCES `RFIDCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersRFIDCardRoom` ADD CONSTRAINT `UsersRFIDCardRoom_userrfid_id_fkey` FOREIGN KEY (`userrfid_id`) REFERENCES `UsersRFIDCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersRFIDCardRoom` ADD CONSTRAINT `UsersRFIDCardRoom_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessLog` ADD CONSTRAINT `AccessLog_userrfid_id_fkey` FOREIGN KEY (`userrfid_id`) REFERENCES `UsersRFIDCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccessLog` ADD CONSTRAINT `AccessLog_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
