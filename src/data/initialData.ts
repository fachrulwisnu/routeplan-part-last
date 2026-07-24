import { ClientATM, VehicleOption } from '../types';

export interface AtmLocation {
  id: string;
  nama: string;
  plan_no: string;
  koordinat: [number, number]; // [Latitude, Longitude]
  alamat: string;
  bank: string;
  is_lewat_tol: boolean;
  is_zona_ganjil_genap: boolean;
}

export interface CabangData {
  id: string;
  namaCabang: string;
  koordinatPusat: [number, number];
  atms: AtmLocation[];
}

export const MASTER_CABANG_DATA: Record<string, CabangData> = {
  "JAKARTA": {
    id: "JKT",
    namaCabang: "PT. Advantage SCM Pusat (Jakarta)",
    koordinatPusat: [-6.1754, 106.8272],
    atms: [
      { id: "JKT-01", nama: "ATM BCA KCU Sudirman", plan_no: "PL-JKT-001", koordinat: [-6.2115, 106.8166], alamat: "Jl. Jend. Sudirman", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: true },
      { id: "JKT-02", nama: "ATM Mandiri Plaza Mandiri", plan_no: "PL-JKT-002", koordinat: [-6.2250, 106.8225], alamat: "Jl. Gatot Subroto", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: true },
      { id: "JKT-03", nama: "ATM BNI KC Menteng", plan_no: "PL-JKT-003", koordinat: [-6.1853, 106.8322], alamat: "Jl. HOS Cokroaminoto", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-04", nama: "ATM BRI KCP Cideng", plan_no: "PL-JKT-004", koordinat: [-6.1732, 106.8100], alamat: "Jl. Cideng Barat", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-05", nama: "ATM CIMB Niaga Hayam Wuruk", plan_no: "PL-JKT-005", koordinat: [-6.1622, 106.8228], alamat: "Jl. Hayam Wuruk", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: true },
      { id: "JKT-06", nama: "ATM Permata Senayan City", plan_no: "PL-JKT-006", koordinat: [-6.2268, 106.7992], alamat: "Jl. Asia Afrika", bank: "Permata", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "JKT-07", nama: "ATM Mandiri Slipi Jaya", plan_no: "PL-JKT-007", koordinat: [-6.1865, 106.7975], alamat: "Jl. Letjen S. Parman", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: true },
      { id: "JKT-08", nama: "ATM BCA Grogol Petamburan", plan_no: "PL-JKT-008", koordinat: [-6.1668, 106.7865], alamat: "Jl. Daan Mogot", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-09", nama: "ATM BNI Tomang Raya", plan_no: "PL-JKT-009", koordinat: [-6.1775, 106.7950], alamat: "Jl. Tomang Raya", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-10", nama: "ATM Danamon Roxy Square", plan_no: "PL-JKT-010", koordinat: [-6.1685, 106.7970], alamat: "Jl. Kyai Tapa", bank: "Danamon", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-11", nama: "ATM BCA Tanah Abang", plan_no: "PL-JKT-011", koordinat: [-6.1870, 106.8150], alamat: "Jl. K.H. Mas Mansyur", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: true },
      { id: "JKT-12", nama: "ATM Mandiri Harmoni", plan_no: "PL-JKT-012", koordinat: [-6.1635, 106.8205], alamat: "Jl. Gajah Mada", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: true },
      { id: "JKT-13", nama: "ATM BRI Kota Tua", plan_no: "PL-JKT-013", koordinat: [-6.1352, 106.8133], alamat: "Jl. Lada, Taman Fatahillah", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-14", nama: "ATM BNI Mangga Dua", plan_no: "PL-JKT-014", koordinat: [-6.1385, 106.8280], alamat: "Jl. Mangga Dua Raya", bank: "BNI", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "JKT-15", nama: "ATM CIMB Niaga Kelapa Gading", plan_no: "PL-JKT-015", koordinat: [-6.1600, 106.9050], alamat: "Jl. Boulevard Kelapa Gading", bank: "CIMB", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "JKT-16", nama: "ATM BCA Sunter Mall", plan_no: "PL-JKT-016", koordinat: [-6.1380, 106.8650], alamat: "Jl. Danau Sunter Utara", bank: "BCA", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "JKT-17", nama: "ATM Mandiri Cempaka Putih", plan_no: "PL-JKT-017", koordinat: [-6.1780, 106.8655], alamat: "Jl. Letjen Suprapto", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "JKT-18", nama: "ATM BNI Salemba", plan_no: "PL-JKT-018", koordinat: [-6.1945, 106.8520], alamat: "Jl. Salemba Raya", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: true }
    ]
  },
  "SEMARANG": {
    id: "SMG",
    namaCabang: "PT. Advantage SCM Semarang",
    koordinatPusat: [-6.9825, 110.4229],
    atms: [
      { id: "SMG-01", nama: "ATM BCA KCU Pemuda", plan_no: "PL-SMG-001", koordinat: [-6.9820, 110.4132], alamat: "Jl. Pemuda No.90", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-02", nama: "ATM Mandiri Simpang Lima", plan_no: "PL-SMG-002", koordinat: [-6.9925, 110.4230], alamat: "Kawasan Simpang Lima", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-03", nama: "ATM BNI Pandanaran", plan_no: "PL-SMG-003", koordinat: [-6.9890, 110.4135], alamat: "Jl. Pandanaran", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-04", nama: "ATM BRI Gajah Mada Smg", plan_no: "PL-SMG-004", koordinat: [-6.9840, 110.4265], alamat: "Jl. Gajah Mada", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-05", nama: "ATM CIMB Niaga Imam Bonjol", plan_no: "PL-SMG-005", koordinat: [-6.9745, 110.4150], alamat: "Jl. Imam Bonjol", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-06", nama: "ATM Permata Tugu Muda", plan_no: "PL-SMG-006", koordinat: [-6.9850, 110.4080], alamat: "Jl. Mgr Sugiyopranoto", bank: "Permata", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-07", nama: "ATM Mandiri Kalibanteng", plan_no: "PL-SMG-007", koordinat: [-6.9790, 110.3880], alamat: "Jl. Siliwangi Kalibanteng", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-08", nama: "ATM BCA Bandara Ahmad Yani", plan_no: "PL-SMG-008", koordinat: [-6.9690, 110.3785], alamat: "Area Bandara YIA/Ahmad Yani", bank: "BCA", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-09", nama: "ATM BNI Krapyak", plan_no: "PL-SMG-009", koordinat: [-6.9760, 110.3720], alamat: "Jl. Siliwangi Krapyak", bank: "BNI", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-10", nama: "ATM Danamon Jatingaleh", plan_no: "PL-SMG-010", koordinat: [-7.0120, 110.4150], alamat: "Jl. Teuku Umar Jatingaleh", bank: "Danamon", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-11", nama: "ATM BCA Banyumanik", plan_no: "PL-SMG-011", koordinat: [-7.0425, 110.4280], alamat: "Jl. Perintis Kemerdekaan", bank: "BCA", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-12", nama: "ATM Mandiri Srondol", plan_no: "PL-SMG-012", koordinat: [-7.0550, 110.4310], alamat: "Jl. Setiabudi Srondol", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-13", nama: "ATM BRI Undip Tembalang", plan_no: "PL-SMG-013", koordinat: [-7.0535, 110.4420], alamat: "Jl. Prof. Soedarto Tembalang", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-14", nama: "ATM BNI Ngesrep", plan_no: "PL-SMG-014", koordinat: [-7.0320, 110.4250], alamat: "Jl. Ngesrep Timur V", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-15", nama: "ATM CIMB Niaga Majapahit", plan_no: "PL-SMG-015", koordinat: [-6.9950, 110.4500], alamat: "Jl. Brigjen Sudiarto Majapahit", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-16", nama: "ATM BCA Pedurungan", plan_no: "PL-SMG-016", koordinat: [-6.9900, 110.4680], alamat: "Jl. Wolter Monginsidi", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-17", nama: "ATM Mandiri Tlogosari", plan_no: "PL-SMG-017", koordinat: [-6.9780, 110.4580], alamat: "Jl. Tlogosari Raya", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-18", nama: "ATM Permata Kaligawe", plan_no: "PL-SMG-018", koordinat: [-6.9650, 110.4450], alamat: "Jl. Kaligawe Raya", bank: "Permata", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "SMG-19", nama: "ATM BNI Pelabuhan Tanjung Mas", plan_no: "PL-SMG-019", koordinat: [-6.9520, 110.4280], alamat: "Kawasan Pelabuhan Tanjung Mas", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "SMG-20", nama: "ATM BCA Kota Lama", plan_no: "PL-SMG-020", koordinat: [-6.9680, 110.4285], alamat: "Jl. Letjen Suprapto Kota Lama", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false }
    ]
  },
  "BANDUNG": {
    id: "BDG",
    namaCabang: "PT. Advantage SCM Bandung",
    koordinatPusat: [-6.9175, 107.6191],
    atms: [
      { id: "BDG-01", nama: "ATM BCA KCU Asia Afrika", plan_no: "PL-BDG-001", koordinat: [-6.9220, 107.6105], alamat: "Jl. Asia Afrika", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-02", nama: "ATM Mandiri Merdeka", plan_no: "PL-BDG-002", koordinat: [-6.9145, 107.6110], alamat: "Jl. Merdeka", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-03", nama: "ATM BNI Riau", plan_no: "PL-BDG-003", koordinat: [-6.9100, 107.6200], alamat: "Jl. L.L.R.E Martadinata (Riau)", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-04", nama: "ATM BRI Dago", plan_no: "PL-BDG-004", koordinat: [-6.9020, 107.6180], alamat: "Jl. Ir. H. Juanda (Dago)", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-05", nama: "ATM CIMB Niaga Cihampelas", plan_no: "PL-BDG-005", koordinat: [-6.8970, 107.6070], alamat: "Jl. Cihampelas Walk", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-06", nama: "ATM Permata Pasteur", plan_no: "PL-BDG-006", koordinat: [-6.8935, 107.5750], alamat: "Jl. Dr. Djunjunan (Pasteur)", bank: "Permata", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "BDG-07", nama: "ATM BCA Paris Van Java", plan_no: "PL-BDG-007", koordinat: [-6.8900, 107.5970], alamat: "Jl. Sukajadi", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-08", nama: "ATM Mandiri Setiabudi", plan_no: "PL-BDG-008", koordinat: [-6.8750, 107.5950], alamat: "Jl. Dr. Setiabudi", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-09", nama: "ATM BNI Buah Batu", plan_no: "PL-BDG-009", koordinat: [-6.9450, 107.6320], alamat: "Jl. Buah Batu Raya", bank: "BNI", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "BDG-10", nama: "ATM Danamon Soekarno Hatta", plan_no: "PL-BDG-010", koordinat: [-6.9480, 107.6500], alamat: "Jl. Soekarno Hatta", bank: "Danamon", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "BDG-11", nama: "ATM BCA Trans Studio Mall", plan_no: "PL-BDG-011", koordinat: [-6.9250, 107.6360], alamat: "Jl. Gatot Subroto TSM", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-12", nama: "ATM Mandiri Kiaracondong", plan_no: "PL-BDG-012", koordinat: [-6.9200, 107.6450], alamat: "Jl. Kiaracondong", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-13", nama: "ATM BRI Antapani", plan_no: "PL-BDG-013", koordinat: [-6.9100, 107.6550], alamat: "Jl. Terusan Jakarta Antapani", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-14", nama: "ATM BNI Ujung Berung", plan_no: "PL-BDG-014", koordinat: [-6.9120, 107.6850], alamat: "Jl. A.H. Nasution", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-15", nama: "ATM CIMB Niaga Festival Citylink", plan_no: "PL-BDG-015", koordinat: [-6.9380, 107.5920], alamat: "Jl. Peta", bank: "CIMB", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "BDG-16", nama: "ATM BCA Cibaduyut", plan_no: "PL-BDG-016", koordinat: [-6.9480, 107.5950], alamat: "Jl. Cibaduyut Raya", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-17", nama: "ATM Mandiri Tol Pasteur", plan_no: "PL-BDG-017", koordinat: [-6.8890, 107.5700], alamat: "Rest Area Tol Pasteur KM 19", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "BDG-18", nama: "ATM Permata Tubagus Ismail", plan_no: "PL-BDG-018", koordinat: [-6.8880, 107.6150], alamat: "Jl. Tubagus Ismail", bank: "Permata", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-19", nama: "ATM BNI ITB Ganesha", plan_no: "PL-BDG-019", koordinat: [-6.8930, 107.6100], alamat: "Jl. Ganesha", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "BDG-20", nama: "ATM BCA Cibeunying", plan_no: "PL-BDG-020", koordinat: [-6.9050, 107.6250], alamat: "Jl. Pahlawan Cibeunying", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false }
    ]
  },
  "MEDAN": {
    id: "MDN",
    namaCabang: "PT. Advantage SCM Medan",
    koordinatPusat: [3.5952, 98.6722],
    atms: [
      { id: "MDN-01", nama: "ATM BCA KCU Kesawan", plan_no: "PL-MDN-001", koordinat: [3.5930, 98.6780], alamat: "Jl. Jend. Ahmad Yani (Kesawan)", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-02", nama: "ATM Mandiri Lapangan Merdeka", plan_no: "PL-MDN-002", koordinat: [3.5915, 98.6750], alamat: "Jl. Pulau Pinang", bank: "Mandiri", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-03", nama: "ATM BNI Diponegoro", plan_no: "PL-MDN-003", koordinat: [3.5820, 98.6690], alamat: "Jl. Diponegoro", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-04", nama: "ATM BRI Gatot Subroto Medan", plan_no: "PL-MDN-004", koordinat: [3.5980, 98.6550], alamat: "Jl. Gatot Subroto", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-05", nama: "ATM CIMB Niaga Sun Plaza", plan_no: "PL-MDN-005", koordinat: [3.5850, 98.6650], alamat: "Jl. Zainul Arifin", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-06", nama: "ATM Permata Medan Mall", plan_no: "PL-MDN-006", koordinat: [3.5890, 98.6820], alamat: "Jl. MT Haryono", bank: "Permata", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-07", nama: "ATM Mandiri Ring Road", plan_no: "PL-MDN-007", koordinat: [3.5650, 98.6320], alamat: "Jl. Gagak Hitam / Ring Road", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "MDN-08", nama: "ATM BCA Setiabudi Medan", plan_no: "PL-MDN-008", koordinat: [3.5680, 98.6420], alamat: "Jl. Dr. Mansyur Setiabudi", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-09", nama: "ATM BNI USU Padang Bulan", plan_no: "PL-MDN-009", koordinat: [3.5600, 98.6520], alamat: "Jl. Jamin Ginting Padang Bulan", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-10", nama: "ATM Danamon Iskandar Muda", plan_no: "PL-MDN-010", koordinat: [3.5750, 98.6600], alamat: "Jl. K.H. Zainul Arifin / Iskandar Muda", bank: "Danamon", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-11", nama: "ATM BCA Asia Mega Mas", plan_no: "PL-MDN-011", koordinat: [3.5780, 98.7020], alamat: "Komplek Asia Mega Mas", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-12", nama: "ATM Mandiri Cemara Asri", plan_no: "PL-MDN-012", koordinat: [3.6150, 98.7150], alamat: "Komplek Perumahan Cemara Asri", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "MDN-13", nama: "ATM BRI Pancing", plan_no: "PL-MDN-013", koordinat: [3.5950, 98.7200], alamat: "Jl. Willem Iskandar / Pancing", bank: "BRI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-14", nama: "ATM BNI Menteng Medan", plan_no: "PL-MDN-014", koordinat: [3.5620, 98.7050], alamat: "Jl. Menteng Raya", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-15", nama: "ATM CIMB Niaga Delipark Mall", plan_no: "PL-MDN-015", koordinat: [3.5900, 98.6710], alamat: "Jl. Putri Hijau", bank: "CIMB", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-16", nama: "ATM BCA Krakatau", plan_no: "PL-MDN-016", koordinat: [3.6050, 98.6850], alamat: "Jl. Gunung Krakatau", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-17", nama: "ATM Mandiri Tol Belmera", plan_no: "PL-MDN-017", koordinat: [3.6200, 98.6950], alamat: "Kawasan Akses Tol Belmera", bank: "Mandiri", is_lewat_tol: true, is_zona_ganjil_genap: false },
      { id: "MDN-18", nama: "ATM Permata HM Yamin", plan_no: "PL-MDN-018", koordinat: [3.6010, 98.6900], alamat: "Jl. Prof. H. M. Yamin", bank: "Permata", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-19", nama: "ATM BNI Krakatau Ujung", plan_no: "PL-MDN-019", koordinat: [3.6120, 98.6950], alamat: "Jl. Bilal / Krakatau", bank: "BNI", is_lewat_tol: false, is_zona_ganjil_genap: false },
      { id: "MDN-20", nama: "ATM BCA Plaza Medan Fair", plan_no: "PL-MDN-020", koordinat: [3.5880, 98.6580], alamat: "Jl. Jend. Gatot Subroto", bank: "BCA", is_lewat_tol: false, is_zona_ganjil_genap: false }
    ]
  }
};

export function getAtmsForCabang(cabangKey: string): ClientATM[] {
  const cabang = MASTER_CABANG_DATA[cabangKey] || MASTER_CABANG_DATA["JAKARTA"];
  return cabang.atms.map((atm) => ({
    plan_no: atm.plan_no,
    wsid: atm.id,
    nama_client: `${atm.bank} - ${atm.nama}`,
    alamat: atm.alamat,
    // Dikembalikan ke format string "lat, lng" agar aman bagi komponen yang membaca string koordinat
    koordinat: `${atm.koordinat[0]}, ${atm.koordinat[1]}`, 
    jam_operasional: "08:00 - 22:00",
    kebutuhan_kaset: 24,
    status_atm: "RS",
    tipe_trip: "H",
    is_no_bag: 0,
    cabang: cabangKey,
    siklus: "Pagi",
    is_lewat_tol: atm.is_lewat_tol,
    is_zona_ganjil_genap: atm.is_zona_ganjil_genap
  }));
}

export const BRANCHES = Object.keys(MASTER_CABANG_DATA);

export const CYCLES = ['Pagi', 'Siang', 'Middle', 'Ad-hoc'];

export const ROUTE_PREFERENCES = [
  'Ganjil/Genap',
  'Hindari Jalan Tol',
  'Hindari Jalan Kecil'
];

export const DUMMY_CLIENT_ATMS: ClientATM[] = getAtmsForCabang("JAKARTA");

export const FLEET_VEHICLES: VehicleOption[] = [
  { plat_nomor: "B1065PIE", jenis_mobil: "Isuzu Panther Cash Van", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B1066PIE", jenis_mobil: "Isuzu Panther Cash Van", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B124FLI", jenis_mobil: "Toyota Hilux Armored", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B2060BFE", jenis_mobil: "Isuzu Traga Armor", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B1890SJK", jenis_mobil: "Daihatsu Gran Max Van", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B2910TXZ", jenis_mobil: "Isuzu Panther Cash Van", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B3012KLP", jenis_mobil: "Toyota Hilux Armored", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B4421MNO", jenis_mobil: "Mitsubishi L300 Armored", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B8819QRS", jenis_mobil: "Isuzu Traga Armor", kapasitas_maksimal: 1200, status: "Tersedia" },
  { plat_nomor: "B9901TUV", jenis_mobil: "Isuzu Panther Cash Van", kapasitas_maksimal: 1200, status: "Tersedia" }
];

export const STAFF_OFFICERS = [
  { custody1: { nama: "ARI YANTO DWI PRASETYO", nik: "8202151644" }, custody2: { nama: "JERI DWI SANTOSO", nik: "8200201660" }, pengawal: { nama: "NANA RUSLANA", nik: "8210389093" } },
  { custody1: { nama: "BUDI SANTOSO", nik: "8202151111" }, custody2: { nama: "AGUS PRABOWO", nik: "8200202222" }, pengawal: { nama: "DEDI KURNIAWAN", nik: "8210383333" } },
  { custody1: { nama: "HENDRA SUCIPTO", nik: "8202154444" }, custody2: { nama: "BAMBANG HERMANTO", nik: "8200205555" }, pengawal: { nama: "RUDI SETIAWAN", nik: "8210386666" } },
  { custody1: { nama: "EKO PRASETYO", nik: "8202157777" }, custody2: { nama: "WAHYU NUGROHO", nik: "8200208888" }, pengawal: { nama: "FAJAR HIDAYAT", nik: "8210389999" } },
  { custody1: { nama: "ANDI WIJAYA", nik: "8202151234" }, custody2: { nama: "TEGUH FIRMANSYAH", nik: "8200205678" }, pengawal: { nama: "HERU SUBAGYO", nik: "8210389012" } }
];
