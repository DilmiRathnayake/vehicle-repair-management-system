-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2026 at 10:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vehicle_repair_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `officers`
--

CREATE TABLE `officers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('engineer','subject_officer','rdhs') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `officers`
--

INSERT INTO `officers` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Engineer John', 'engineer@hospital.com', 'password123', 'engineer', '2026-01-28 05:43:00'),
(2, 'Subject Officer', 'officer@rdhs.com', 'password123', 'subject_officer', '2026-01-28 05:43:00'),
(3, 'RDHS Manager', 'rdhs@health.gov', 'password123', 'rdhs', '2026-01-28 05:43:00');

-- --------------------------------------------------------

--
-- Table structure for table `repair_requests`
--

CREATE TABLE `repair_requests` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `engineer_id` int(11) DEFAULT NULL,
  `repair_details` text DEFAULT NULL,
  `inspection_date` date DEFAULT NULL,
  `engineer_signature` varchar(255) DEFAULT NULL,
  `status` enum('pending','sent_to_rdhs','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `status_updates`
--

CREATE TABLE `status_updates` (
  `id` int(11) NOT NULL,
  `repair_request_id` int(11) DEFAULT NULL,
  `officer_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `registration_number` varchar(20) NOT NULL,
  `vehicle_type` varchar(50) NOT NULL,
  `hospital_name` varchar(100) DEFAULT NULL,
  `current_status` enum('operational','under_repair','repaired','approved') DEFAULT 'operational',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `registration_number`, `vehicle_type`, `hospital_name`, `current_status`, `created_at`) VALUES
(1, 'CAB-1234', 'Ambulance', 'Base Hospital Colombo', 'operational', '2026-01-28 05:43:00'),
(2, 'CAB-5678', 'Van', 'MOH Office Gampaha', 'operational', '2026-01-28 05:43:00'),
(3, 'WP-AB-9012', 'Car', 'Base Hospital Kalutara', 'operational', '2026-01-28 05:43:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `officers`
--
ALTER TABLE `officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `repair_requests`
--
ALTER TABLE `repair_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `status_updates`
--
ALTER TABLE `status_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `repair_request_id` (`repair_request_id`),
  ADD KEY `officer_id` (`officer_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `officers`
--
ALTER TABLE `officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `repair_requests`
--
ALTER TABLE `repair_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `status_updates`
--
ALTER TABLE `status_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `repair_requests`
--
ALTER TABLE `repair_requests`
  ADD CONSTRAINT `repair_requests_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `status_updates`
--
ALTER TABLE `status_updates`
  ADD CONSTRAINT `status_updates_ibfk_1` FOREIGN KEY (`repair_request_id`) REFERENCES `repair_requests` (`id`),
  ADD CONSTRAINT `status_updates_ibfk_2` FOREIGN KEY (`officer_id`) REFERENCES `officers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
