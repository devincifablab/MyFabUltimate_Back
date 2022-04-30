
CREATE TABLE IF NOT EXISTS `articles` (`id` int(11) NOT NULL, `article` varchar(255) DEFAULT NULL, `likes` int(11) NOT NULL DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `likes` (`id` int(11) NOT NULL, `ip` varchar(255) DEFAULT NULL, `article` varchar(255) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_firstName` VARCHAR(75) NOT NULL , `v_lastName` VARCHAR(75) NOT NULL , `v_email` VARCHAR(75) NOT NULL , `v_password` VARCHAR(64) NOT NULL ,`dt_creationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `v_discordid` VARCHAR(18) NULL DEFAULT NULL , `v_language` VARCHAR(2) NOT NULL DEFAULT 'fr' , `dt_ruleSignature` DATETIME NULL DEFAULT NULL , `b_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,`b_visible` BOOLEAN NOT NULL DEFAULT TRUE , `b_mailValidated` BOOLEAN NOT NULL DEFAULT FALSE , `b_isMicrosoft` BOOLEAN NOT NULL DEFAULT FALSE , `v_title` VARCHAR(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_email Unique (`v_email`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_roles` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(25) NOT NULL , `v_description` VARCHAR(255) NOT NULL , `v_idDiscordRole` VARCHAR(18) NULL , `v_discordPrefix` VARCHAR(10) NOT NULL DEFAULT '' , `v_color` VARCHAR(6) NOT NULL , `b_isProtected` BOOLEAN NOT NULL DEFAULT FALSE , `b_viewUsers` BOOLEAN NOT NULL DEFAULT FALSE , `b_manageUser` BOOLEAN NOT NULL DEFAULT FALSE , `b_changeUserRole` BOOLEAN NOT NULL DEFAULT FALSE , `b_changeUserProtectedRole` BOOLEAN NOT NULL DEFAULT FALSE , `b_myFabAgent` BOOLEAN NOT NULL DEFAULT FALSE , `b_blogAuthor` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_name Unique (`v_name`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_status` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(25) NOT NULL , `b_isOpen` BOOLEAN NOT NULL , `v_color` VARCHAR(6) NOT NULL , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_name Unique (`v_name`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_ticketpriority` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(50) NOT NULL , `v_color` VARCHAR(6) NOT NULL , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_name Unique (`v_name`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_ticketprojecttype` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(50) NOT NULL , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_name Unique (`v_name`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_printer` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(25) NOT NULL , `b_isAvailable` BOOLEAN NOT NULL , PRIMARY KEY (`i_id`), CONSTRAINT uk_v_name Unique (`v_name`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `discordticket` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_idGuild` VARCHAR(18) NOT NULL , `v_idChannel` VARCHAR(18) NOT NULL , `v_idUser` VARCHAR(18) NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `rolescorrelation` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idRole` INT NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `rolescorrelation` ADD CONSTRAINT `fk_rc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `rolescorrelation` ADD CONSTRAINT `fk_rc_idRole` FOREIGN KEY IF NOT EXISTS (`i_idRole`) REFERENCES `gd_roles`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_roleschange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUserAdmin` INT(11) NOT NULL , `i_idUserTarget` INT(11) NOT NULL , `v_actionType` VARCHAR(3) NOT NULL , `i_idRole` INT(11) NOT NULL , `dt_changeDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_roleschange` ADD CONSTRAINT `fk_lrc_idUserAdmin` FOREIGN KEY IF NOT EXISTS (`i_idUserAdmin`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_roleschange` ADD CONSTRAINT `fk_lrc_idUserTarget` FOREIGN KEY IF NOT EXISTS (`i_idUserTarget`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_roleschange` ADD CONSTRAINT `fk_lrc_idRole` FOREIGN KEY IF NOT EXISTS (`i_idRole`) REFERENCES `gd_roles`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `printstickets` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_projecttype` INT(3) NOT NULL , `i_groupNumber` INT(4) NULL DEFAULT NULL , `v_idChannel` VARCHAR(18) NULL , `dt_creationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `dt_modificationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `i_status` INT(4) NULL DEFAULT NULL , `i_priority` INT(4) NOT NULL, `b_isDeleted` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `printstickets` ADD CONSTRAINT `fk_pt_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `printstickets` ADD CONSTRAINT `fk_pt_idStatus` FOREIGN KEY IF NOT EXISTS (`i_status`) REFERENCES `gd_status`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `printstickets` ADD CONSTRAINT `fk_pt_idpriority` FOREIGN KEY IF NOT EXISTS (`i_priority`) REFERENCES `gd_ticketpriority`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `printstickets` ADD CONSTRAINT `fk_pt_idprojecttype` FOREIGN KEY IF NOT EXISTS (`i_projecttype`) REFERENCES `gd_ticketprojecttype`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_ticketschange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_action` VARCHAR(25) NOT NULL , `v_newValue` VARCHAR(100) , `dt_timeStamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_ticketschange` ADD CONSTRAINT `fk_ltc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_ticketschange` ADD CONSTRAINT `fk_ltc_idTickets` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `ticketmessages` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_content` VARCHAR(1000) NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `ticketmessages` ADD CONSTRAINT `fk_tm_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticketmessages` ADD CONSTRAINT `fk_tm_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `ticketfiles` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_fileName` VARCHAR(50) NOT NULL , `v_fileServerName` VARCHAR(256) NOT NULL , `v_comment` VARCHAR(256) NOT NULL DEFAULT '' , `b_valid` BOOLEAN , `i_idprinter` INT DEFAULT NULL, `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `dt_modificationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `ticketfiles` ADD CONSTRAINT `fk_tf_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticketfiles` ADD CONSTRAINT `fk_tf_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticketfiles` ADD CONSTRAINT `fk_tf_idPrinter` FOREIGN KEY IF NOT EXISTS (`i_idprinter`) REFERENCES `gd_printer`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_ticketsfileschange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicketFiles` INT NOT NULL , `v_comment` VARCHAR(256) NOT NULL , `b_valid` BOOLEAN , `dt_timeStamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_ticketsfileschange` ADD CONSTRAINT `fk_ltfc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_ticketsfileschange` ADD CONSTRAINT `fk_ltfc_idTickets` FOREIGN KEY IF NOT EXISTS (`i_idTicketFiles`) REFERENCES `ticketfiles`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- CREATE TABLE IF NOT EXISTS `cookies` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `v_value` VARCHAR(64) NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
-- ALTER TABLE `cookies` ADD CONSTRAINT `c_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `mailtocken` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `v_value` VARCHAR(15) NOT NULL , `b_mailSend` BOOLEAN NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `mailtocken` ADD CONSTRAINT `fk_mt_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `lockers` ( `i_id` INT NOT NULL , `i_idUser` INT , `i_idTickets` INT , `dt_usedSince` DATETIME DEFAULT NULL , `i_idLastUser` INT , `i_idLastTickets` INT , `dt_lastUsedSince` DATETIME DEFAULT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `lockers` ADD CONSTRAINT `fk_l_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `fk_l_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTickets`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `fk_l_idLastUser` FOREIGN KEY IF NOT EXISTS (`i_idLastUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `fk_l_idLastTicket` FOREIGN KEY IF NOT EXISTS (`i_idLastTickets`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
