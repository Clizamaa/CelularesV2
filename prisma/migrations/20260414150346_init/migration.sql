-- CreateTable
CREATE TABLE `Celular` (
    `id` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(100) NOT NULL,
    `serial` VARCHAR(50) NOT NULL,
    `imei` CHAR(15) NOT NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('DISPONIBLE', 'ASIGNADO', 'MANTENIMIENTO', 'BAJA') NOT NULL DEFAULT 'DISPONIBLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Celular_serial_key`(`serial`),
    UNIQUE INDEX `Celular_imei_key`(`imei`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Simcard` (
    `id` VARCHAR(191) NOT NULL,
    `numeroSimcard` VARCHAR(30) NOT NULL,
    `numeroTelefono` VARCHAR(15) NULL,
    `operador` VARCHAR(50) NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('DISPONIBLE', 'ASIGNADA', 'SUSPENDIDA') NOT NULL DEFAULT 'DISPONIBLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Simcard_numeroSimcard_key`(`numeroSimcard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignacion` (
    `id` VARCHAR(191) NOT NULL,
    `celularId` VARCHAR(191) NOT NULL,
    `simcardId` VARCHAR(191) NULL,
    `funcionarioId` VARCHAR(100) NULL,
    `funcionarioNombre` VARCHAR(200) NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaDevolucion` DATETIME(3) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `observaciones` TEXT NULL,

    UNIQUE INDEX `Asignacion_celularId_key`(`celularId`),
    UNIQUE INDEX `Asignacion_simcardId_key`(`simcardId`),
    INDEX `Asignacion_celularId_idx`(`celularId`),
    INDEX `Asignacion_simcardId_idx`(`simcardId`),
    INDEX `Asignacion_funcionarioId_idx`(`funcionarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_celularId_fkey` FOREIGN KEY (`celularId`) REFERENCES `Celular`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_simcardId_fkey` FOREIGN KEY (`simcardId`) REFERENCES `Simcard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
