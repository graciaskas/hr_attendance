SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `hr_attendance`;

USE `hr_attendance`;

-- CREATE TABLE `hr_attendances`
CREATE TABLE IF NOT EXISTS  `hr_attendances` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `checkin` text DEFAULT NULL,
  `checkout` text DEFAULT NULL,
  `worked_hours` int(11) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `create_user` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_user` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `state` varchar(45) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `hr_countries`
CREATE TABLE IF NOT EXISTS  `hr_countries` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `code` int(11) NOT NULL UNIQUE KEY,
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL UNIQUE KEY,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `create_user` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_user` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `hr_departments`
CREATE TABLE IF NOT EXISTS  `hr_departments` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(6) NOT NULL UNIQUE KEY,
  `name` varchar(255) NOT NULL UNIQUE KEY,
  `manager_id` int(11) NULL DEFAULT NULL,
  `total_employees` int(11) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `create_user` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_user` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- CREATE TABLE `hr_employee`
CREATE TABLE IF NOT EXISTS `hr_employee` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `roll_no` varchar(7) NOT NULL UNIQUE KEY,
  `name` varchar(255) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `mobile_phone` int(11) NOT NULL UNIQUE KEY,
  `email` varchar(45) NOT NULL UNIQUE KEY,
  `state` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  `street` varchar(45) NOT NULL,
  `zipcode` varchar(45) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `birth_place` varchar(2555) NOT NULL,
  `birth_day` date NOT NULL,
  `gender` varchar(45) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `create_user` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_user` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `present` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- CREATE TABLE `hr_users`
CREATE TABLE IF NOT EXISTS `hr_users` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `roll_no` varchar(7) NOT NULL UNIQUE KEY,
  `name` varchar(255) NOT NULL,
  `login` varchar(255) NOT NULL UNIQUE KEY,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `create_user` int(11) NOT NULL,
  `update_user` int(11) NOT NULL,
  `is_employee` tinyint(1) NOT NULL DEFAULT 0,
  `employee_id` int(11) DEFAULT NULL,
  `roles` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `online` tinyint(4) NOT NULL DEFAULT 0,
  `Latest_authentication` timestamp NOT NULL DEFAULT current_timestamp(),
  `time_zone` int(11) NOT NULL,
  `lang` varchar(45) NOT NULL DEFAULT 'en_US'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERT ADMIN
INSERT INTO `hr_users` (name,login,email,password,roles) VALUES ('Chrispin Admin','chrispin','admin@example.com','admin','admin');


-- CREATE TABLES INDEX --------------------------------------


-- TABLE `hr_attendances`
ALTER TABLE `hr_attendances`
  ADD KEY `hr_attendance_employee` (`employee_id`),
  ADD KEY `hr_attendance_employee_approve` (`approved_by`);

-- TABLE `hr_departments`
ALTER TABLE `hr_departments`
  ADD KEY `manager_id` (`manager_id`);

-- TABLE `hr_employee`
ALTER TABLE `hr_employee`
  ADD KEY `department_id` (`department_id`);

-- TABLE `hr_users`
ALTER TABLE `hr_users`
  ADD KEY `employee_id` (`employee_id`);


-- TABLES CONSTRAINSTS -----------

-- TABLE `hr_attendances`
ALTER TABLE `hr_attendances`
  ADD CONSTRAINT `hr_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `hr_employee` (`id`),
  ADD CONSTRAINT `hr_attendance_employee_approve` FOREIGN KEY (`approved_by`) REFERENCES `hr_employee` (`id`);

-- TABLE `hr_departments`
ALTER TABLE `hr_departments`
  ADD CONSTRAINT `hr_departments_manager_employee` FOREIGN KEY (`manager_id`) REFERENCES `hr_employee` (`id`);

-- TABLE `hr_employee`
ALTER TABLE `hr_employee`
  ADD CONSTRAINT `hr_employee_department` FOREIGN KEY (`department_id`) REFERENCES `hr_departments` (`id`),
  ADD CONSTRAINT `hr_employee_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `hr_employee`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `hr_employee_country` FOREIGN KEY (`country_id`) REFERENCES `hr_countries`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- TABLE `hr_users`
ALTER TABLE `hr_users`
  ADD CONSTRAINT `hr_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `hr_employee` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
