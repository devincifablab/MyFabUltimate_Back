
CREATE TABLE IF NOT EXISTS `users` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_firstName` VARCHAR(75) NOT NULL , `v_lastName` VARCHAR(75) NOT NULL , `v_email` VARCHAR(75) NOT NULL , `v_password` VARCHAR(64) NOT NULL ,`dt_creationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `v_discordid` VARCHAR(18) NULL DEFAULT NULL , `v_language` VARCHAR(2) NOT NULL DEFAULT 'fr' , `dt_ruleSignature` DATETIME NULL DEFAULT NULL , `b_deleted` BOOLEAN NOT NULL DEFAULT FALSE ,`b_visible` BOOLEAN NOT NULL DEFAULT TRUE , `b_mailValidated` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gd_roles` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(25) NOT NULL , `v_color` VARCHAR(6) NOT NULL , `b_isProtected` BOOLEAN NOT NULL DEFAULT FALSE , `b_viewUsers` BOOLEAN NOT NULL DEFAULT FALSE , `b_changeUserRole` BOOLEAN NOT NULL DEFAULT FALSE , `b_changeUserProtectedRole` BOOLEAN NOT NULL DEFAULT FALSE , `b_myFabAgent` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `rolesCorrelation` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idRole` INT NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `rolesCorrelation` ADD CONSTRAINT `rc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `rolesCorrelation` ADD CONSTRAINT `rc_idRole` FOREIGN KEY IF NOT EXISTS (`i_idRole`) REFERENCES `gd_roles`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_rolesChange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUserAdmin` INT(11) NOT NULL , `i_idUserTarget` INT(11) NOT NULL , `v_actionType` VARCHAR(3) NOT NULL , `i_idRole` INT(11) NOT NULL , `dt_changeDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_rolesChange` ADD CONSTRAINT `lrc_idUserAdmin` FOREIGN KEY IF NOT EXISTS (`i_idUserAdmin`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_rolesChange` ADD CONSTRAINT `lrc_idUserTarget` FOREIGN KEY IF NOT EXISTS (`i_idUserTarget`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `discordticket` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_idGuild` VARCHAR(18) NOT NULL , `v_idChannel` VARCHAR(18) NOT NULL , `v_idUser` VARCHAR(18) NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `printstickets` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_projecttype` INT(3) NOT NULL ,`dt_creationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `dt_modificationdate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `i_step` INT(1) NOT NULL , `b_waitingAnswer` BOOLEAN NOT NULL , `i_priority` INT(3) NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `printstickets` ADD CONSTRAINT `pt_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `gd_ticketPriority` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(50) NOT NULL , `v_color` VARCHAR(6) NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `printstickets` ADD CONSTRAINT `pt_idPriority` FOREIGN KEY IF NOT EXISTS (`i_priority`) REFERENCES `gd_ticketPriority`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_ticketsChange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_action` VARCHAR(25) NOT NULL , `v_newValue` VARCHAR(100) , `dt_timeStamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_ticketsChange` ADD CONSTRAINT `ltc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_ticketsChange` ADD CONSTRAINT `ltc_idTickets` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_priorityChange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT(11) NOT NULL , `i_newPriority` INT(3) NOT NULL , `dt_changeDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_priorityChange` ADD CONSTRAINT `lpc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_priorityChange` ADD CONSTRAINT `lpc_idPriority` FOREIGN KEY IF NOT EXISTS (`i_newPriority`) REFERENCES `gd_ticketPriority`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `gd_ticketprojecttype` ( `i_id` INT NOT NULL AUTO_INCREMENT , `v_name` VARCHAR(50) NOT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `printstickets` ADD CONSTRAINT `pt_projecttype` FOREIGN KEY IF NOT EXISTS (`i_projecttype`) REFERENCES `gd_ticketprojecttype`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `ticketMessages` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_content` VARCHAR(1000) NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `ticketMessages` ADD CONSTRAINT `tm_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticketMessages` ADD CONSTRAINT `tm_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `ticketFiles` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicket` INT NOT NULL , `v_fileName` VARCHAR(50) NOT NULL , `v_fileServerName` VARCHAR(256) NOT NULL , `v_comment` VARCHAR(256) NOT NULL , `b_valid` BOOLEAN , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `dt_modificationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `ticketFiles` ADD CONSTRAINT `tf_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticketFiles` ADD CONSTRAINT `tf_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTicket`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `log_ticketsFilesChange` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `i_idTicketFiles` INT NOT NULL , `v_comment` VARCHAR(256) NOT NULL , `b_valid` BOOLEAN , `dt_timeStamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `log_ticketsFilesChange` ADD CONSTRAINT `ltfc_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `log_ticketsFilesChange` ADD CONSTRAINT `ltfc_idTickets` FOREIGN KEY IF NOT EXISTS (`i_idTicketFiles`) REFERENCES `ticketFiles`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--CREATE TABLE IF NOT EXISTS `cookies` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `v_value` VARCHAR(64) NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
--ALTER TABLE `cookies` ADD CONSTRAINT `c_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `mailTocken` ( `i_id` INT NOT NULL AUTO_INCREMENT , `i_idUser` INT NOT NULL , `v_value` VARCHAR(15) NOT NULL , `b_mailSend` BOOLEAN NOT NULL , `dt_creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `mailTocken` ADD CONSTRAINT `mt_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE IF NOT EXISTS `lockers` ( `i_id` INT NOT NULL , `i_idUser` INT , `i_idTickets` INT , `dt_usedSince` DATETIME DEFAULT NULL , `i_idLastUser` INT , `i_idLastTickets` INT , `dt_lastUsedSince` DATETIME DEFAULT NULL , PRIMARY KEY (`i_id`)) ENGINE = InnoDB;
ALTER TABLE `lockers` ADD CONSTRAINT `l_idUser` FOREIGN KEY IF NOT EXISTS (`i_idUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `l_idTicket` FOREIGN KEY IF NOT EXISTS (`i_idTickets`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `l_idLastUser` FOREIGN KEY IF NOT EXISTS (`i_idLastUser`) REFERENCES `users`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `lockers` ADD CONSTRAINT `l_idLastTicket` FOREIGN KEY IF NOT EXISTS (`i_idLastTickets`) REFERENCES `printstickets`(`i_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
