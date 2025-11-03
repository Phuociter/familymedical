-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: family_medical
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `DoctorAssignment`
--

DROP TABLE IF EXISTS `DoctorAssignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorAssignment` (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `FamilyID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  PRIMARY KEY (`AssignmentID`),
  UNIQUE KEY `FamilyID` (`FamilyID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `DoctorAssignment_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `Family` (`FamilyID`),
  CONSTRAINT `DoctorAssignment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorAssignment`
--

LOCK TABLES `DoctorAssignment` WRITE;
/*!40000 ALTER TABLE `DoctorAssignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `DoctorAssignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoctorRequests`
--

DROP TABLE IF EXISTS `DoctorRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorRequests` (
  `RequestID` int NOT NULL AUTO_INCREMENT,
  `FamilyID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `Message` text COLLATE utf8mb4_general_ci,
  `RequestDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Pending','Accepted','Rejected') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `ResponseDate` datetime DEFAULT NULL,
  PRIMARY KEY (`RequestID`),
  KEY `FamilyID` (`FamilyID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `DoctorRequests_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `Family` (`FamilyID`),
  CONSTRAINT `DoctorRequests_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorRequests`
--

LOCK TABLES `DoctorRequests` WRITE;
/*!40000 ALTER TABLE `DoctorRequests` DISABLE KEYS */;
INSERT INTO `DoctorRequests` VALUES (1,1,2,'Gia đình tôi muốn bác sĩ phụ trách khám định kỳ','2025-10-20 07:45:21','Pending',NULL);
/*!40000 ALTER TABLE `DoctorRequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Family`
--

DROP TABLE IF EXISTS `Family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Family` (
  `FamilyID` int NOT NULL AUTO_INCREMENT,
  `FamilyName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `HeadOfFamilyID` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FamilyID`),
  KEY `HeadOfFamilyID` (`HeadOfFamilyID`),
  CONSTRAINT `Family_ibfk_1` FOREIGN KEY (`HeadOfFamilyID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Family`
--

LOCK TABLES `Family` WRITE;
/*!40000 ALTER TABLE `Family` DISABLE KEYS */;
INSERT INTO `Family` VALUES (1,'Gia đình Nguyễn Văn A','123 Đường Lê Lợi, Hà Nội',1,'2025-10-20 07:45:20');
/*!40000 ALTER TABLE `Family` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MedicalRecords`
--

DROP TABLE IF EXISTS `MedicalRecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MedicalRecords` (
  `RecordID` int NOT NULL AUTO_INCREMENT,
  `MemberID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `FileType` enum('X-Ray','MRI Scan','Blood Test','Urine Test','ECG','Ultrasound','Prescription Image','Other') COLLATE utf8mb4_general_ci NOT NULL,
  `FileLink` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Description` text COLLATE utf8mb4_general_ci,
  `UploadDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecordID`),
  KEY `MemberID` (`MemberID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `MedicalRecords_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `Members` (`MemberID`),
  CONSTRAINT `MedicalRecords_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MedicalRecords`
--

LOCK TABLES `MedicalRecords` WRITE;
/*!40000 ALTER TABLE `MedicalRecords` DISABLE KEYS */;
INSERT INTO `MedicalRecords` VALUES (1,1,2,'X-Ray','https://example.com/records/xray_nguyenvana.jpg','Ảnh X-quang phổi chụp ngày 25/10/2025','2025-11-03 22:30:05'),(2,1,2,'Blood Test','https://example.com/records/bloodtest_nguyenvana.pdf','Kết quả xét nghiệm máu tổng quát','2025-11-03 22:30:05'),(3,2,2,'Ultrasound','https://example.com/records/ultrasound_nguyenthic.png','Siêu âm bụng tổng quát','2025-11-03 22:30:05'),(4,2,2,'ECG','https://example.com/records/ecg_nguyenthic.pdf','Điện tâm đồ kiểm tra định kỳ','2025-11-03 22:30:05');
/*!40000 ALTER TABLE `MedicalRecords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Members` (
  `MemberID` int NOT NULL AUTO_INCREMENT,
  `FamilyID` int NOT NULL,
  `FullName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Gender` enum('Nam','Nữ','Khác') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CCCD` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Relationship` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PhoneNumber` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`MemberID`),
  KEY `FamilyID` (`FamilyID`),
  CONSTRAINT `Members_ibfk_1` FOREIGN KEY (`FamilyID`) REFERENCES `Family` (`FamilyID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Members`
--

LOCK TABLES `Members` WRITE;
/*!40000 ALTER TABLE `Members` DISABLE KEYS */;
INSERT INTO `Members` VALUES (1,1,'Nguyễn Văn A','1980-05-10','Nam','012345678901','Chủ hộ',NULL),(2,1,'Nguyễn Thị C','1985-07-20','Nữ','012345678902','Vợ',NULL);
/*!40000 ALTER TABLE `Members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `PaymentID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `PackageType` enum('1 tháng','6 tháng','1 năm') COLLATE utf8mb4_general_ci NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `ExpiryDate` datetime NOT NULL,
  `PaymentMethod` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentStatus` enum('Pending','Completed','Failed') COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `TransactionCode` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PaymentID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
INSERT INTO `Payment` VALUES (1,1,'1 tháng',100000.00,'2025-10-20 07:45:21','2025-11-20 07:45:21','Momo','Completed','TXN001','2025-10-20 07:45:21','2025-10-20 07:45:21');
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `FullName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Role` enum('ChuHo','BacSi','Admin') COLLATE utf8mb4_general_ci DEFAULT 'ChuHo',
  `PhoneNumber` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CCCD` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DoctorCode` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `GoogleID` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FacebookID` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsProfileComplete` tinyint(1) DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Nguyễn Văn A','nguyenvana@gmail.com','hashed_pass_1','ChuHo',NULL,NULL,'012345678901',NULL,NULL,NULL,0,'2025-10-20 07:45:20'),(2,'Trần Thị B','tranthib@gmail.com','hashed_pass_2','BacSi',NULL,NULL,'098765432109','BS001',NULL,NULL,0,'2025-10-20 07:45:20'),(3,'Admin','admin@system.com','hashed_admin','Admin',NULL,NULL,NULL,NULL,NULL,NULL,0,'2025-10-20 07:45:20');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04  5:42:15
