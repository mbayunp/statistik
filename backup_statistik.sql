-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: db_statistik
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aset_bidang`
--

DROP TABLE IF EXISTS `aset_bidang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aset_bidang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_barang` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `jenis_barang` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `merk_model` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `tahun_pembelian` int NOT NULL,
  `jumlah` int NOT NULL,
  `penempatan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT '-',
  `keadaan` enum('baik','kurang baik','rusak berat') COLLATE utf8mb4_general_ci DEFAULT 'baik',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aset_bidang`
--

LOCK TABLES `aset_bidang` WRITE;
/*!40000 ALTER TABLE `aset_bidang` DISABLE KEYS */;
INSERT INTO `aset_bidang` VALUES (1,'PC Asus 2026','Komputer','Intel Core i5',2026,1,'Ruang Garut Satu Data','baik','2026-03-06 02:29:04'),(2,'Printer HP L3251','Printer','Via Wifi',2026,1,'Ruang Garut Satu Data','baik','2026-03-06 02:30:40'),(3,'Mesin Penghancur Kertas','Mesin Penghancur Kertas','HSM',2022,1,'Ruang Garut Satu Data','baik','2026-03-10 04:15:29'),(4,'Meja Biro','Meja Biro','Meja 1/2 Biro',2015,5,'Ruang Garut Satu Data','baik','2026-03-10 04:16:31'),(5,'Meja Kerja','Meja Kerja','Costum',2021,2,'Ruang Garut Satu Data','baik','2026-03-10 04:17:52'),(6,'Komputer ','PC','HP',2020,1,'Ruang Garut Satu Data','baik','2026-03-10 04:18:31'),(7,'Kursi Besi','Kursi Besi','Chitose',2021,6,'Ruang Garut Satu Data','baik','2026-03-10 04:19:45'),(8,'Komputer','PC','Intel Core i3',2021,1,'Ruang Garut Satu Data','baik','2026-03-10 04:20:21'),(9,'Printer','Printer','HP Colour Laser 150a',2021,2,'Ruang Garut Satu Data','baik','2026-03-10 04:20:55'),(10,'Lemari Arsip','Lemari Besi','Victory',2021,1,'Ruang Garut Satu Data','baik','2026-03-10 04:21:32'),(11,'Komputer','PC','Intel Core i7',2021,1,'Ruang Garut Satu Data','baik','2026-03-10 04:22:04'),(12,'Smart TV','TV','LG UHD TV',2022,1,'Ruang Garut Satu Data','baik','2026-03-10 04:22:31'),(13,'Laptop','Laptop','Lenovo IdeaPad 5 14ITL05',2021,1,'Ruang Garut Satu Data','baik','2026-03-10 04:22:57'),(14,'HDD External 12 TB','Hardisk','My Book',2021,1,'Ruang Garut Satu Data','baik','2026-03-10 04:23:28'),(15,'HDD External 2 TB','Hardisk','My Passport',2022,1,'Ruang Garut Satu Data','baik','2026-03-10 04:23:53'),(16,'Komputer ','PC','Core i7 Gen 10th Ram 16GB VGA 4GB Monitor 19\"',2022,1,'Ruang Garut Satu Data','baik','2026-03-10 04:24:41'),(17,'Kursi','Kursi Besi','Informa',2023,1,'Ruang Garut Satu Data','baik','2026-03-10 04:25:36'),(18,'Komputer','PC','MSI',2023,1,'Ruang Garut Satu Data','baik','2026-03-10 04:26:03'),(19,'Monitor','Monitor','SPC',2023,1,'Ruang Garut Satu Data','baik','2026-03-10 04:26:21'),(20,'AC','AC','Sharp',2023,1,'Ruang Garut Satu Data','baik','2026-03-10 04:26:43'),(21,'Meja Biro','Meja Biro','Meja 1/2 Biro',2015,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:28:45'),(22,'Meja Biro','Meja Biro','Meja 1/2 Biro',2015,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','kurang baik','2026-03-10 04:29:20'),(23,'Personal Komputer','PC ALL IN ONE','Lenovo',2015,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:30:00'),(24,'Lemari Arsip','Lemari Besi','Filling Cabinet 4 Laci Proline',2018,2,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:30:28'),(25,'Printer','Printer','HP Printer Ink Tank',2020,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','kurang baik','2026-03-10 04:30:55'),(26,'Kursi Besi','Kursi Besi','Chitose',2021,2,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:31:26'),(27,'Kursi Besi','Kursi Besi','Chitose',2021,2,'Ruang Bidang Penyelenggaraan Statistik Sektoral','kurang baik','2026-03-10 04:31:48'),(28,'Dispenser','Dispenser','ARISA',2021,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','rusak berat','2026-03-10 04:32:39'),(29,'Mesin Penghancur Kertas','Mesin Penghancur Kertas','HSM',2021,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','rusak berat','2026-03-10 04:33:26'),(30,'Kursi Besi','Kursi Besi','Informa',2023,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:33:45'),(31,'Komputer ','PC','HP',2020,1,'Ruang Bidang Penyelenggaraan Statistik Sektoral','baik','2026-03-10 04:33:58'),(32,'Meja Kayu','Meja Kayu','Costum',2015,1,'Ruang Kepala Bidang','baik','2026-03-10 04:34:33'),(33,'Kursi Tamu','Kursi Tamu','Costum',2015,2,'Ruang Kepala Bidang','baik','2026-03-10 04:35:02'),(34,'Lemari Arsip','Lemari Besi','Filling Cabinet 4 Laci Proline',2018,1,'Ruang Kepala Bidang','baik','2026-03-10 04:35:33'),(35,'Kursi Besi','Kursi Besi','Chitose',2021,3,'Ruang Kepala Bidang','baik','2026-03-10 04:36:02'),(36,'Kursi Besi','Kursi Besi','Informa',2023,1,'Ruang Kepala Bidang','baik','2026-03-10 04:36:21'),(37,'AC','AC','Sharp',2023,1,'Ruang Kepala Bidang','baik','2026-03-10 04:36:37');
/*!40000 ALTER TABLE `aset_bidang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `berkas_arsip`
--

DROP TABLE IF EXISTS `berkas_arsip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `berkas_arsip` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_berkas` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `kategori` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `tahun` int NOT NULL,
  `keterangan` text COLLATE utf8mb4_general_ci,
  `file_arsip` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `berkas_arsip`
--

LOCK TABLES `berkas_arsip` WRITE;
/*!40000 ALTER TABLE `berkas_arsip` DISABLE KEYS */;
INSERT INTO `berkas_arsip` VALUES (3,'Perjanjian Penggunaan API BPS','LAINNYA',2026,'TERM OF USE\r\nAPPLICATION PROGRAMMING INTERFACE (API) BADAN PUSAT STATISTIK','1773197035478.pdf','2026-03-11 02:43:55');
/*!40000 ALTER TABLE `berkas_arsip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daftar_statistik`
--

DROP TABLE IF EXISTS `daftar_statistik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daftar_statistik` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_kegiatan` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tahun` int NOT NULL,
  `sudah_meminta` tinyint(1) DEFAULT '0',
  `sudah_mendapat` tinyint(1) DEFAULT '0',
  `nomor_rekomendasi` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `produsen_data` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cara_pengumpulan_data` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ada_dokumen_perencanaan` tinyint(1) DEFAULT '0',
  `jenis_dokumen_perencanaan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sudah_meminta_rekomendasi` tinyint(1) DEFAULT '0',
  `sudah_mendapat_rekomendasi` tinyint(1) DEFAULT '0',
  `nomor_identitas_rekomendasi` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ada_metadata_kegiatan` tinyint(1) DEFAULT '0',
  `input_ms_keg_ke_indah` tinyint(1) DEFAULT '0',
  `jumlah_variabel` int DEFAULT '0',
  `jumlah_indikator` int DEFAULT '0',
  `ada_metadata_variabel` tinyint(1) DEFAULT '0',
  `jumlah_metadata_variabel` int DEFAULT '0',
  `input_ms_var_ke_indah` tinyint(1) DEFAULT '0',
  `jumlah_ms_var_terinput` int DEFAULT '0',
  `ada_metadata_indikator` tinyint(1) DEFAULT '0',
  `jumlah_metadata_indikator` int DEFAULT '0',
  `input_ms_ind_ke_indah` tinyint(1) DEFAULT '0',
  `jumlah_ms_ind_terinput` int DEFAULT '0',
  `memenuhi_standar_data` tinyint(1) DEFAULT '0',
  `memenuhi_kode_referensi` tinyint(1) DEFAULT '0',
  `jadwal_rilis` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rilis_tepat_waktu` tinyint(1) DEFAULT '0',
  `jenis_diseminasi` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `link_diseminasi` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daftar_statistik`
--

LOCK TABLES `daftar_statistik` WRITE;
/*!40000 ALTER TABLE `daftar_statistik` DISABLE KEYS */;
INSERT INTO `daftar_statistik` VALUES (2,'Kompilasi Data Pengendalian Penduduk, Pemberdayaan Perempuan, dan Perlindungan Anak',2025,0,0,NULL,'Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak','2026-03-04 22:16:23','Kompilasi Data',0,'',1,0,'das',1,1,1,1,0,0,0,0,0,0,0,0,0,0,'dsa',1,'','sad');
/*!40000 ALTER TABLE `daftar_statistik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kegiatan`
--

DROP TABLE IF EXISTS `kegiatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kegiatan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tanggal` date DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_general_ci,
  `gambar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipe` enum('bulanan','semesteran') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kategori` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kegiatan`
--

LOCK TABLES `kegiatan` WRITE;
/*!40000 ALTER TABLE `kegiatan` DISABLE KEYS */;
INSERT INTO `kegiatan` VALUES (1,'2026-03-05','Rapat Koordinasi Statistik','/uploads/1772671320223.jpg','bulanan',NULL,'2026-03-05 00:42:00');
/*!40000 ALTER TABLE `kegiatan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laporan_keuangan`
--

DROP TABLE IF EXISTS `laporan_keuangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laporan_keuangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_laporan` enum('anggaran','pengadaan') COLLATE utf8mb4_general_ci NOT NULL,
  `kategori_pengadaan` enum('modal','pegawai') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `judul_laporan` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tahun` int NOT NULL,
  `periode` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nilai_anggaran` decimal(15,2) DEFAULT '0.00',
  `nilai_realisasi` decimal(15,2) DEFAULT '0.00',
  `file_laporan` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `keterangan` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laporan_keuangan`
--

LOCK TABLES `laporan_keuangan` WRITE;
/*!40000 ALTER TABLE `laporan_keuangan` DISABLE KEYS */;
INSERT INTO `laporan_keuangan` VALUES (1,'anggaran',NULL,'SPJ Fungsional ',2026,'Februari',0.00,0.00,'1772762095458.pdf','Statistik','2026-03-06 01:54:55'),(2,'anggaran',NULL,'Form D',2026,'Februari',0.00,0.00,'1772762299631.xlsx','Statistik','2026-03-06 01:58:19');
/*!40000 ALTER TABLE `laporan_keuangan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pegawai`
--

DROP TABLE IF EXISTS `pegawai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pegawai` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nip` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nama` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `jabatan` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `golongan` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `urutan` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nip` (`nip`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pegawai`
--

LOCK TABLES `pegawai` WRITE;
/*!40000 ALTER TABLE `pegawai` DISABLE KEYS */;
INSERT INTO `pegawai` VALUES (1,'','Muhammad Bayu Nurdiansyah Putra, S.T','Tenaga Terampil Programmer','-','2026-03-05 03:05:11',7),(2,'198506192009022008','Efita Irianti., S.P, M.Ec.Dev','Kepala Bidang','IV/','2026-03-05 03:07:21',1),(3,'197710252008011003','Asep Priatna.,S.Sos.,M. Si','Pranata Komputer Ahli Muda','Pembina IV/A','2026-03-05 03:08:32',3),(6,'-','Nurfahmi Zaynun, S.Stat','Tenaga Terampil Pengelola Data Statistik','-','2026-03-05 04:00:06',6),(7,'198006262014112001','Euis Hermawati, S.Sos., M.I.Kom.','Kepala Seksi Bidang','Penata Tingkat I, III/d','2026-03-05 05:55:31',2),(8,'199601252020121011','Indra Soraya, S.Kom','Pranata Komputer Ahli Pertama','III/b','2026-03-05 06:01:07',4),(9,'199211022020122013','Ghea Novani, S.Si','Statistisi Ahli Pertama','III/b','2026-03-06 02:16:14',5);
/*!40000 ALTER TABLE `pegawai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penugasan`
--

DROP TABLE IF EXISTS `penugasan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penugasan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tanggal_waktu` datetime NOT NULL,
  `tempat` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `peserta` text COLLATE utf8mb4_general_ci NOT NULL,
  `pelaksanaan` text COLLATE utf8mb4_general_ci NOT NULL,
  `dokumentasi` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penugasan`
--

LOCK TABLES `penugasan` WRITE;
/*!40000 ALTER TABLE `penugasan` DISABLE KEYS */;
/*!40000 ALTER TABLE `penugasan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rekapan_kegiatan`
--

DROP TABLE IF EXISTS `rekapan_kegiatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rekapan_kegiatan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tanggal` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_kegiatan` text COLLATE utf8mb4_general_ci NOT NULL,
  `keterangan` text COLLATE utf8mb4_general_ci,
  `kategori` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `dokumentasi` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rekapan_kegiatan`
--

LOCK TABLES `rekapan_kegiatan` WRITE;
/*!40000 ALTER TABLE `rekapan_kegiatan` DISABLE KEYS */;
INSERT INTO `rekapan_kegiatan` VALUES (5,'2026-03-05','Asistensi SSH','-','FGD/RAPAT/UNDANGAN','/uploads/1772690300392.jpeg','2026-03-05 05:58:20'),(7,'2026-03-09','Perubahan total styling backend',NULL,'PENGEMBANGAN BACKEND','/uploads/1773025927437.jpeg','2026-03-09 03:12:08'),(10,'2026-01-05','Menyusun Stock Opname Pakai Habis Bidang Statistik dari Januari - Desember 2025','Mengelompokan realisasi belanja pakai habis dari semua sub kegiatan bidang penyelenggaraan statistik ke dalam satu tabel berdasarkan jenis belanja','ADMINISTRASI','/uploads/1773102477702.jpeg','2026-03-10 00:27:57'),(11,'2026-01-02','Menyusun Daftar Metadata Kegiatan Statistik Tahun 2025','Merekap daftar metadata kegiatan dan ringkasannya untuk keperluan daftar data bidang statistik tahun 2025','METADATA','/uploads/1773102517750.jpeg','2026-03-10 00:28:37'),(12,'2026-01-13','Koordinasi dengan Bappeda terkait persiapan dan teknis pemeriksaan DSSD E-walidata','-','FGD/RAPAT/UNDANGAN','/uploads/1773102637498.jpeg','2026-03-10 00:30:37'),(13,'2026-01-15','Koordinasi dengan BPS terkait Ewalidata','-','FGD/RAPAT/UNDANGAN','/uploads/1773102710612.jpeg','2026-03-10 00:31:50'),(14,'2026-01-21','Menyusun Surat pemberitahuan pemeriksaan dssd ewalidata','-','ADMINISTRASI','/uploads/1773102837763.jpeg','2026-03-10 00:33:57'),(15,'2026-01-21','Menyusun Surat Permohonan Data ke DPPKBP3A','-','ADMINISTRASI','/uploads/1773103172331.jpeg','2026-03-10 00:39:32'),(16,'2026-01-21','Menyusun Surat Permohonan Pemeriksaan Mandiri DSSD 2025 ke BPS','-','ADMINISTRASI','/uploads/1773103236870.jpeg','2026-03-10 00:40:36'),(17,'2026-02-04','Verifikasi DSSD di SIPD Ewalidata','-','PENGELOLAAN PORTAL','/uploads/1773103300553.jpeg','2026-03-10 00:41:40'),(18,'2026-02-09','Melayani Konsultasi terkait DSSD dengan pengelola data dari Inspektorat Daerah','-','FGD/RAPAT/UNDANGAN','/uploads/1773103913999.png','2026-03-10 00:46:06'),(19,'2026-02-10','Assessment Indeks Kami 5.0 Garut Satu Data sebagai SE yang dinilai','-','FGD/RAPAT/UNDANGAN','/uploads/1773103949800.png','2026-03-10 00:52:29'),(20,'2026-02-11','Melanjutkan pembahasan Assessment Indeks Kami 5.0','-','FGD/RAPAT/UNDANGAN','/uploads/1773104043027.png','2026-03-10 00:54:03'),(21,'2026-02-12','Penutupan Assessment Indeks Kami 5.0','-','FGD/RAPAT/UNDANGAN','/uploads/1773104146333.png','2026-03-10 00:55:46'),(22,'2026-02-18','Menghadiri Zoom Meeting Kick off Pembinaan dan Evaluasi Penyelenggaraan Statistik Sektoral 2026','-','FGD/RAPAT/UNDANGAN','/uploads/1773104212726.png','2026-03-10 00:56:52'),(23,'2026-02-19','Menghadiri Zoom Forum Perangkat Daerah Bidang Kominfo, Statistik, Persandian Jawa Barat 2026','-','FGD/RAPAT/UNDANGAN','/uploads/1773104250905.png','2026-03-10 00:57:30'),(24,'2026-02-23','Pembahasan Prosedur Berbagi Pakai DTSEN','-','FGD/RAPAT/UNDANGAN','/uploads/1773104296677.png','2026-03-10 00:58:16'),(25,'2026-02-26','Menghadiri Zoom Webinar Statisitka Series #1 - 2026 : Upah Minimum dan Strategi Finansial Jangka Panjang Untuk Pekerja','-','FGD/RAPAT/UNDANGAN','/uploads/1773105026450.png','2026-03-10 01:10:26'),(26,'2026-02-26','FGD dengan Bappeda terkait RTL Hasil SDI 2025','-','FGD/RAPAT/UNDANGAN','/uploads/1773105051969.png','2026-03-10 01:10:51'),(27,'2026-02-27','Melaksanakan Forum PD DIskominfo Tahun 2026','-','FGD/RAPAT/UNDANGAN','/uploads/1773105082588.png','2026-03-10 01:11:22'),(28,'2026-02-27','Menghadiri Rapat Pleno Penetapan Nilai Akhir Pengukuran IRB 2025','-','FGD/RAPAT/UNDANGAN','/uploads/1773105114325.png','2026-03-10 01:11:54'),(29,'2026-03-03','Observasi mahasiswa uniga terkait Keamanan Portal Garut Satu Data','-','FGD/RAPAT/UNDANGAN','/uploads/1773105137303.png','2026-03-10 01:12:17'),(30,'2026-03-04','Rakor Satu Data Jabar 2026','-','FGD/RAPAT/UNDANGAN','/uploads/1773105168316.png','2026-03-10 01:12:48'),(31,'2026-03-05','Koordinasi dengan BPS terkait Pembentukan TPI dan Identifikasi Kegiatan Statistik Sektoral','-','FGD/RAPAT/UNDANGAN','/uploads/1773105212457.png','2026-03-10 01:13:10'),(32,'2026-03-11','Menghadiri Rapat Konsultasi Publik Badan Pusat Statistik Tahun 2026','Rapat dilaksanakan melalui zoom.','FGD/RAPAT/UNDANGAN','/uploads/1773200789427.png','2026-03-11 03:46:29'),(33,'2026-03-09','Garut Dalam Angka','Infografis statistik kunci Garut Dalam Angka','INFOGRAFIS','/uploads/1773276977919.png','2026-03-12 00:56:17'),(34,'2026-03-09','Garut Dalam Angka','Infografis statistik kunci Garut Dalam Angka','INFOGRAFIS','/uploads/1773276994022.png','2026-03-12 00:56:34'),(35,'2026-03-12','Desk Persiapan EPSS Tahun 2026 dengan Dinas Pariwisata dan Kebudayaan',NULL,'FGD/RAPAT/UNDANGAN','/uploads/1773294008120.jpeg','2026-03-12 05:40:08'),(36,'2026-03-12','Desk Persiapan EPSS Tahun 2026 dengan DisperindagESDM',NULL,'FGD/RAPAT/UNDANGAN','/uploads/1773294066303.jpeg','2026-03-12 05:41:06'),(37,'2026-03-13','Menyelesaikan permohonan data pada Portal',NULL,'PENGELOLAAN PORTAL','/uploads/1773372806127.png','2026-03-13 03:33:26'),(38,'2026-03-13','Menyusun Surat Identifikasi Kegiatan Statistik Sektoral Tahun 2026',NULL,'ADMINISTRASI','/uploads/1773372971826.PNG','2026-03-13 03:36:11'),(39,'2026-03-13','Menyiapkan Format Metadata Kegiatan, Variabel dan Indikator',NULL,'METADATA','/uploads/1773373071166.PNG','2026-03-13 03:37:51'),(40,'2026-03-16','Melayani Konsultasi dari BKD terkait Data dan Kegiatan Statistik',NULL,'FGD/RAPAT/UNDANGAN','/uploads/1773636979249.jpeg','2026-03-16 04:56:19'),(41,'2026-03-30','Kepegawaian','Daftar Data BKD Tahun 2025','INFOGRAFIS','/uploads/1775013048253.png','2026-04-01 03:10:48'),(42,'2026-03-21','Banner Selamat Hari Raya Idul Fitri','Banner sudah terupload pada portal garut satu data','INFOGRAFIS','/uploads/1775013118421.png','2026-04-01 03:11:58'),(43,'2026-04-02','audensi dengan DSI tentang layanan 112',NULL,'FGD/RAPAT/UNDANGAN','/uploads/1775099102556.jpeg','2026-04-02 03:05:02');
/*!40000 ALTER TABLE `rekapan_kegiatan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surat`
--

DROP TABLE IF EXISTS `surat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jenis_surat` enum('masuk','keluar') COLLATE utf8mb4_general_ci DEFAULT 'masuk',
  `nomor_surat` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `instansi` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tanggal_surat` date DEFAULT NULL,
  `tanggal_terima` date DEFAULT NULL,
  `perihal` text COLLATE utf8mb4_general_ci,
  `keterangan` text COLLATE utf8mb4_general_ci,
  `file_surat` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surat`
--

LOCK TABLES `surat` WRITE;
/*!40000 ALTER TABLE `surat` DISABLE KEYS */;
INSERT INTO `surat` VALUES (4,'keluar','500.14.5/150-DISKOMINFO/2026','Dinas Pariwisata dan Kebudayaan','2026-03-10','2026-03-10','Desk Persiapan Evaluasi Penyelenggaraan\r\nStatistik Sektoral (EPSS) Tahun 2026','','1773203571509.pdf','2026-03-11 04:32:51'),(5,'keluar','500.14.5/151-DISKOMINFO/2026','Dinas Perindustrian, Perdagangan, Energi, dan  Sumber Daya Mineral','2026-03-10','2026-03-10','Desk Persiapan Evaluasi Penyelenggaraan\r\nStatistik Sektoral (EPSS) Tahun 2026','','1773203634087.pdf','2026-03-11 04:33:54'),(6,'masuk','B-0568/3205/ES.000/2026','BPS Garut','2026-03-02','2026-03-02','Pembentukan Tim Internal Kegiatan\r\nEvaluasi Penyelenggaraan Statistik\r\nSektoral (EPSS) 2026','','1773296070349.pdf','2026-03-12 06:14:30');
/*!40000 ALTER TABLE `surat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('admin') COLLATE utf8mb4_general_ci DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$qk/sHPPZXlXc0cgrvPYG3.5ehJKAcyZUYg6byQ6ZHrlGEOinyt7iy','admin','2026-03-05 01:23:18'),(2,'bayu','$2b$10$uvP50n1HzJ7bPeUsyP51SeWBtzXcSOnb3zXH2mlg8Pq.JA1RWUrAu','admin','2026-03-05 01:28:42'),(3,'fahmi','$2b$10$Jy9RqGyNSHWb4oYbNoBE2.0rq9.U6TLSJHtnZgIcgM51wsoEqIS8W','admin','2026-03-05 03:45:17'),(4,'kasi','$2b$10$znHUmesfOAmz2jb31IboAeZTMRdeAH08uTMlngCXzHJiAyoC04WGq','admin','2026-03-05 06:00:35'),(5,'kabid','$2b$10$Q8NcZI119HJF7I.50VijlO3b2S.Hyjsy1tUOot25U6YWmsLpviSrm','admin','2026-03-05 07:14:35'),(6,'aspri','$2b$10$lT1c.zOSAgzNuhRuShZykeA9x1.Q/1oVLnuPJEf5jph1wmldES01O','admin','2026-03-10 03:15:15'),(7,'asfree','$2b$10$6LNq7tyo.tlB26/DJy0QLeZpCMRwI8IjaUS022UmEbAl7fL9yAntC','admin','2026-03-11 01:25:21'),(8,'indra','$2b$10$UdAkY4i1qu79Zzhh4DnS6OKL/gH9rrg5zGf724e5TwVH1yrJniRI.','admin','2026-03-11 02:18:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02  3:48:44
