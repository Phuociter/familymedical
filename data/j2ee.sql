-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 20, 2025 lúc 02:46 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `j2ee`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctorassignment`
--

CREATE TABLE `doctorassignment` (
  `AssignmentID` int(11) NOT NULL,
  `FamilyID` int(11) NOT NULL,
  `DoctorID` int(11) NOT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctorrequests`
--

CREATE TABLE `doctorrequests` (
  `RequestID` int(11) NOT NULL,
  `FamilyID` int(11) NOT NULL,
  `DoctorID` int(11) NOT NULL,
  `Message` text DEFAULT NULL,
  `RequestDate` datetime DEFAULT current_timestamp(),
  `Status` enum('Pending','Accepted','Rejected') DEFAULT 'Pending',
  `ResponseDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `doctorrequests`
--

INSERT INTO `doctorrequests` (`RequestID`, `FamilyID`, `DoctorID`, `Message`, `RequestDate`, `Status`, `ResponseDate`) VALUES
(1, 1, 2, 'Gia đình tôi muốn bác sĩ phụ trách khám định kỳ', '2025-10-20 07:45:21', 'Pending', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `family`
--

CREATE TABLE `family` (
  `FamilyID` int(11) NOT NULL,
  `FamilyName` varchar(100) NOT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `HeadOfFamilyID` int(11) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `family`
--

INSERT INTO `family` (`FamilyID`, `FamilyName`, `Address`, `HeadOfFamilyID`, `CreatedAt`) VALUES
(1, 'Gia đình Nguyễn Văn A', '123 Đường Lê Lợi, Hà Nội', 1, '2025-10-20 07:45:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medicalrecords`
--

CREATE TABLE `medicalrecords` (
  `RecordID` int(11) NOT NULL,
  `MemberID` int(11) NOT NULL,
  `Symptoms` text DEFAULT NULL,
  `Diagnosis` text DEFAULT NULL,
  `TreatmentPlan` text DEFAULT NULL,
  `RecordDate` datetime DEFAULT current_timestamp(),
  `FileLink` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `members`
--

CREATE TABLE `members` (
  `MemberID` int(11) NOT NULL,
  `FamilyID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Gender` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `CCCD` varchar(20) DEFAULT NULL,
  `Relationship` varchar(50) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `members`
--

INSERT INTO `members` (`MemberID`, `FamilyID`, `FullName`, `DateOfBirth`, `Gender`, `CCCD`, `Relationship`, `PhoneNumber`) VALUES
(1, 1, 'Nguyễn Văn A', '1980-05-10', 'Nam', '012345678901', 'Chủ hộ', NULL),
(2, 1, 'Nguyễn Thị C', '1985-07-20', 'Nữ', '012345678902', 'Vợ', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

CREATE TABLE `payment` (
  `PaymentID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `PackageType` enum('1 tháng','6 tháng','1 năm') NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime DEFAULT current_timestamp(),
  `ExpiryDate` datetime NOT NULL,
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `PaymentStatus` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `TransactionCode` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `UpdatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payment`
--

INSERT INTO `payment` (`PaymentID`, `UserID`, `PackageType`, `Amount`, `PaymentDate`, `ExpiryDate`, `PaymentMethod`, `PaymentStatus`, `TransactionCode`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '1 tháng', 100000.00, '2025-10-20 07:45:21', '2025-11-20 07:45:21', 'Momo', 'Completed', 'TXN001', '2025-10-20 07:45:21', '2025-10-20 07:45:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('ChuHo','BacSi','Admin') DEFAULT 'ChuHo',
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `CCCD` varchar(20) DEFAULT NULL,
  `DoctorCode` varchar(20) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`UserID`, `FullName`, `Email`, `PasswordHash`, `Role`, `PhoneNumber`, `Address`, `CCCD`, `DoctorCode`, `CreatedAt`) VALUES
(1, 'Nguyễn Văn A', 'nguyenvana@gmail.com', 'hashed_pass_1', 'ChuHo', NULL, NULL, '012345678901', NULL, '2025-10-20 07:45:20'),
(2, 'Trần Thị B', 'tranthib@gmail.com', 'hashed_pass_2', 'BacSi', NULL, NULL, '098765432109', 'BS001', '2025-10-20 07:45:20'),
(3, 'Admin', 'admin@system.com', 'hashed_admin', 'Admin', NULL, NULL, NULL, NULL, '2025-10-20 07:45:20');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `doctorassignment`
--
ALTER TABLE `doctorassignment`
  ADD PRIMARY KEY (`AssignmentID`),
  ADD KEY `FamilyID` (`FamilyID`),
  ADD KEY `DoctorID` (`DoctorID`);

--
-- Chỉ mục cho bảng `doctorrequests`
--
ALTER TABLE `doctorrequests`
  ADD PRIMARY KEY (`RequestID`),
  ADD KEY `FamilyID` (`FamilyID`),
  ADD KEY `DoctorID` (`DoctorID`);

--
-- Chỉ mục cho bảng `family`
--
ALTER TABLE `family`
  ADD PRIMARY KEY (`FamilyID`),
  ADD KEY `HeadOfFamilyID` (`HeadOfFamilyID`);

--
-- Chỉ mục cho bảng `medicalrecords`
--
ALTER TABLE `medicalrecords`
  ADD PRIMARY KEY (`RecordID`),
  ADD KEY `MemberID` (`MemberID`);

--
-- Chỉ mục cho bảng `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`MemberID`),
  ADD KEY `FamilyID` (`FamilyID`);

--
-- Chỉ mục cho bảng `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `UserID` (`UserID`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `doctorassignment`
--
ALTER TABLE `doctorassignment`
  MODIFY `AssignmentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `doctorrequests`
--
ALTER TABLE `doctorrequests`
  MODIFY `RequestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `family`
--
ALTER TABLE `family`
  MODIFY `FamilyID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `medicalrecords`
--
ALTER TABLE `medicalrecords`
  MODIFY `RecordID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `members`
--
ALTER TABLE `members`
  MODIFY `MemberID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `payment`
--
ALTER TABLE `payment`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `doctorassignment`
--
ALTER TABLE `doctorassignment`
  ADD CONSTRAINT `doctorassignment_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `family` (`FamilyID`),
  ADD CONSTRAINT `doctorassignment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `users` (`UserID`);

--
-- Các ràng buộc cho bảng `doctorrequests`
--
ALTER TABLE `doctorrequests`
  ADD CONSTRAINT `doctorrequests_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `family` (`FamilyID`),
  ADD CONSTRAINT `doctorrequests_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `users` (`UserID`);

--
-- Các ràng buộc cho bảng `family`
--
ALTER TABLE `family`
  ADD CONSTRAINT `family_ibfk_1` FOREIGN KEY (`HeadOfFamilyID`) REFERENCES `users` (`UserID`);

--
-- Các ràng buộc cho bảng `medicalrecords`
--
ALTER TABLE `medicalrecords`
  ADD CONSTRAINT `medicalrecords_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`);

--
-- Các ràng buộc cho bảng `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `family` (`FamilyID`);

--
-- Các ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
