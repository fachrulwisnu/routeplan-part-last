# Route Plan AI — PT. Advantage Supply Chain Management (SCM)

**Versi Dokumen FSD:** 1.6.2  
**Klasifikasi:** Rahasia / Internal Enterprise  
**Pemilik Sistem:** Sentral Planner ROC - COS (Cash Operations)  
**Area Bisnis:** COS and Cash Operations Logistics  

---

## 📌 Overview Application

**Route Plan AI** adalah sistem kecerdasan buatan tingkat lanjut (*AI-powered Route Planner & Vehicle Routing Problem / VRP Solver*) yang dirancang khusus untuk mengoptimalkan, memvalidasi, dan memvisualisasikan rute *Runsheet* pengisian kas serta pemeliharaan mesin ATM (*ATM Replenishment & Cash Management*) di lingkungan **PT. Advantage SCM**.

Aplikasi ini mengintegrasikan pemrosesan data spasial berbasis elipsoid bumi, kalkulasi optimasi rute berperforma tinggi dari **NVIDIA cuOpt VRP Solver API**, analisis lalu lintas real-time perkotaan Jakarta menggunakan **Dual-Engine AI (NVIDIA Nemotron-3 Ultra 550B & Meta Llama 3.3 70B)**, serta peta interaktif berbasis **Leaflet.js** dan **OSRM Road Geometry Routing Engine**.

---

## 🚀 Blueprint Arsitektur Baru (Lebih Cepat & Efisien)

```
[ Frontend: Klik Generate ] 
       │
       ▼
[ Backend: cuOpt Engine ] ──(Matematika Cepat < 2 detik)──► [ Langsung Render ke Peta Leaflet ]
       │
       └─► (Opsional di Background / Saat Edit) 
               │
               ▼
       [ Dual-Engine AI: Nemotron Ultra 550B ──(Failover)──► Llama 3.3 70B ]
               │
               ├─► Menghasilkan Prediksi Kepadatan Lalu Lintas
               └─► Menganalisis Dampak Switch Trip (Before vs After)
```

---

## 🛠️ Technology Stack & Architecture

### **Frontend Architecture**
- **Framework:** React 19 dengan TypeScript
- **Styling & UI:** Tailwind CSS v4, Lucide React Icons
- **Interactive Maps:** Leaflet.js dengan OpenStreetMap tiles & Pre-fetched OSRM Road Geometry Routing
  - **Instant Pre-fetching:** Seluruh geometri rute jalan raya di-fetch secara paralel di awal untuk memastikan perpindahan filter instan tanpa jeda (*zero latency*).
  - **Anti-Zig-Zag Enforcement:** Menghapus total garis lurus udara (*crow-fly lines*) dan memastikan 100% rute mengikuti jalur aspal jalan raya.
  - **Interactive Route Badges:** Midpoint tooltips menampilkan status lalu lintas, jalur tol, dan zona ganjil-genap.
  - **Conditional Animations:** Animasi garis bergerak (*marching ants / semut berjalan*) aktif secara dinamis saat memilih *Run* spesifik.
  - **Clean View Mode:** Mode "Semua Run" menggunakan transparansi terukur (`opacity: 0.5`) dan menyembunyikan *badges* berlebih agar peta tidak sesak.
- **Switch Trip Before vs After Impact Analysis Modal:** Integrasi analisis dampak perubahan rute real-time dengan indikator badge visual (✨ Direkomendasikan / ⚠️ Tidak Direkomendasikan) serta pop-up konfirmasi perbandingan metrik operasional (Jarak, Macet, ETA, & Peringatan Operasional).
- **Progressive Feedback:** Progress Bar & Step Indicator interaktif pada tombol *Generate Runsheet* untuk memandu visualisasi proses *backend*.

### **Backend & API Architecture**
- **Runtime Environment:** Node.js + Express (Server-side API Layer)
- **Dev & Build Tooling:** `tsx` untuk eksekusi TypeScript dev mode, Vite 6
- **VRP Solver Engine:** **NVIDIA cuOpt VRP Solver API** (`https://optimize.api.nvidia.com/v1/nvidia/cuopt`) dengan konfigurasi dinamis `vehicle_types: [1]` untuk pemetaan matriks biaya yang presisi (< 2 detik).
- **Dual-Engine AI Failover System (Switch Trip & Traffic Impact Analysis):**
  - **Primary Jury:** **NVIDIA Nemotron-3 Ultra 550B** (`nvidia/nemotron-3-ultra-550b-a55b`) via OpenAI SDK Client.
  - **Backup Jury (Failover):** **Meta Llama 3.3 70B Instruct** (`meta/llama-3.3-70b-instruct`) jika Primary Jury mengalami gangguan/timeout.
  - **Deterministic Fallback:** Garansi kalkulasi matematis lokal jika kedua LLM mengalami hambatan jaringan.
- **Geodesic Distance Model:** **Formula Vincenty (WGS-84 Ellipsoid)** untuk konstruksi `cost_matrix_data` dan `travel_time_matrix_data` secara lokal dengan akurasi permukaan elipsoid milimeter.
- **Local Fallback Engine:** Algoritma Spatial Geofencing (Anti-Overlap), Vincenty Distance Matrix, & Sequential Time-Chaining Engine.

---

## 🚀 Key Features & Capabilities

### 1. 📐 Vincenty's Ellipsoid Precision Distance Calculation
Menggantikan kalkulasi aproksimasi bidang datar (Euclidean/Haversine) dengan **Formula Vincenty (WGS-84 Ellipsoid)**. Menghitung jarak geodesic antar koordinat depot dan lokasi ATM dengan akurasi elipsoid bumi tingkat tinggi, menyusun matriks jarak 2D (`cost_matrix_data`) dan waktu tempuh (`travel_time_matrix_data`) untuk solver NVIDIA cuOpt tanpa memicu *Error 400*.

### 2. 🎯 Spatial Clustering & Geofencing (Anti-Overlap)
Mengelompokkan lokasi ATM ke dalam *Run* berdasarkan isolasi wilayah geografis yang ketat. Rute antar *Run* dipisahkan secara sistematis sehingga tidak saling menyilang atau tumpang tindih di peta.

### 3. 🚦 Real-Time AI Traffic Analysis & Delay Prediction
Menganalisis kepadatan lalu lintas arteri & tol Jakarta secara otomatis:
- 🔴 **Macet (`#EF4444`)**: Terjadi pada jam sibuk dengan estimasi delay tambahan (+15 menit). Garis polyline ditampilkan tebal dengan pola peringatan.
- 🟠 **Padat (`#F97316`)**: Terjadi pada jam sibuk siang hari atau rute non-tol (+10 menit delay).
- 🟣 **Lancar (`warna_tema_run`)**: Rute bergerak lancar tanpa hambatan (0 menit delay). Menggunakan palet warna eksklusif Run (Ungu `#9333EA`, Teal `#0D9488`, Pink `#DB2777`, Indigo `#4F46E5`).

### 4. 🛡️ Bulletproof JSON Parser & Fast-Track AI Execution
Menghilangkan kendala *parsing error* dari respon LLM dengan sistem pembersihan otomatis (*markdown backticks cleaner & regex JSON extractor*), serta memangkas waktu tunggu eksekusi AI hingga 5x lipat lebih cepat.

---

## 🔄 End-to-End System Integration Flow

```
┌────────────────────────────────────────────────────────┐
│               Internal Database / UI                   │
│          Ingest Live Master ATM Locations              │
└───────────────────────────┬────────────────────────────┘
                            │ (1) Client Coordinates Payload
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Backend Server                 │
│        Calculate Vincenty Distance Matrix (WGS-84)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ (2) Fast-track VRP Matrix Payload & vehicle_types: [1]
                            ▼
┌────────────────────────────────────────────────────────┐
│              NVIDIA cuOpt VRP Solver API               │
│      High-speed Math VRP Engine (< 2 Detik)            │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ (3) VRP Optimized Route Nodes Sequence
                            ▼
┌────────────────────────────────────────────────────────┐
│             Instant Render to Leaflet Map              │
│       React 19 UI & OSRM Road Geometry Pre-fetching    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ (4) Background / On-Demand Analysis Trigger
                            ▼
┌────────────────────────────────────────────────────────┐
│               DUAL-ENGINE AI SYSTEM                    │
│   Primary Jury: NVIDIA Nemotron-3 Ultra 550B           │
│   Backup Jury:  Meta Llama 3.3 70B Instruct (Failover) │
│                                                        │
│   • Traffic Density & Urban Delay Prediction           │
│   • Switch Trip Impact Analysis (Before vs After)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ (5) Bulletproof JSON Extractor & Sanitizer
                            ▼
┌────────────────────────────────────────────────────────┐
│            Interactive Operations Dashboard            │
│  - Real-time Leaflet Map & Midpoint Traffic Badges     │
│  - Switch Trip Modal with AI Recommendation Badges     │
│  - Before vs After Metrics Comparison Pop-up           │
└────────────────────────────────────────────────────────┘
```

---

## ⚙️ Rules & Constraints Operational (FSD v1.6)

1. **Geofencing/Isolasi Wilayah (Anti-Overlap):** Lokasi ATM dikelompokkan ke dalam *Run* berdasarkan kedekatan wilayah geografis tanpa silang jalur.
2. **Kapasitas Kaset Kendaraan:** Batas maksimal **1.200 kaset** per unit mobil kas (*Armored Cash Van*).
3. **Analisis Lalu Lintas & Prediksi Keterlambatan:** Memperhitungkan jam sibuk, aturan Ganjil/Genap, jalur tol, dan kalkulasi `prediksi_delay_menit`.
4. **Estimasi Waktu Berantai (Sequential Time Chaining):** Kalkulasi jam *Tiba*, *Mulai Transaksi*, *Durasi* (Default 15 menit), hingga *Keluar Lokasi* format `HH:MM`.
5. **Penugasan Personel & Armada Otomatis:** Alokasi tim (*Custody 1*, *Custody 2*, *Pengawal*) dan plat nomor kendaraan dilakukan secara otomatis.

---

## 💻 Cara Menjalankan Aplikasi untuk Developer

### 1. Prerequisites
Pastikan perangkat Anda telah terinstal:
- **Node.js** versi 18.0 atau lebih tinggi (Direkomendasikan v20+ LTS)
- **npm**, **yarn**, atau **pnpm**

### 2. Konfigurasi Environment Variables (`.env`)
Buat file `.env` di root direktori proyek Anda dan masukkan kunci API yang valid:

```env
NVIDIA_API_KEY="nvapi-YOUR_NVIDIA_API_KEY"
CUOPT_API_KEY="nvapi-YOUR_CUOPT_API_KEY"
```

### 3. Instalasi Dependencies
```bash
npm install
```

### 4. Menjalankan Mode Development
```bash
npm run dev
```
Akses aplikasi melalui browser pada alamat: `http://localhost:3000`

### 5. Build & Production Mode
```bash
npm run build
npm start
```

---

## 📄 Struktur Repositori

```
├── server.ts                    # Express Backend (NVIDIA cuOpt, Nemotron, Vincenty Matrix)
├── src/
│   ├── App.tsx                  # Core App Container & Navigation State
│   ├── index.css                # Global CSS, Leaflet Badge Tooltips, & Marching Ants Keyframes
│   ├── types.ts                 # TypeScript Interfaces (FSD Standardized Schema)
│   ├── data/
│   │   └── initialData.ts       # Master Data Cabang, Siklus, Fleet, & Staff Officers
│   ├── utils/
│   │   └── vrpSolver.ts         # Local High-Performance Spatial VRP & Traffic Engine
│   └── components/
│       ├── GenerateView.tsx     # Form Input Parameter, Progress Bar, & Preview Lokasi
│       ├── ResultView.tsx       # Hasil Generate, Operational Summary, & Runsheet Table
│       ├── MapView.tsx          # Komponen Peta Interaktif Leaflet (OSRM Pre-fetch & Badges)
│       ├── PetugasModal.tsx     # Modal Detail Penugasan Custody & Pengawal
│       ├── MobilModal.tsx       # Modal Selection & Change Plat Nomor Kendaraan
│       └── SwitchTripModal.tsx  # Modal Edit & Reorder Urutan Trip (Switch Trip)
├── metadata.json
├── package.json
└── README.md
```

---

## 🛠️ Developer Troubleshooting & Notes

- **Error cuOpt Status 400 (vehicle_types):** Pastikan objek `fleet_data` di backend selalu menyertakan `"vehicle_types": [1]` agar sinkron dengan matriks biaya ber-key `"1"`.
- **Error Nemotron JSON Parsing:** Backend telah dilengkapi *Bulletproof JSON Extractor* yang membersihkan blok markdown secara otomatis. Pastikan model tidak menggunakan penalaran berlebihan dengan menjaga `temperature: 0.0`.
- **Koneksi MileApp:** Seluruh endpoint task dispatcher yang usang telah dibersihkan/dilewati (bypassed) secara otomatis. Sistem murni menggunakan arsitektur VRP Solver cepat berbasis matriks Vincenty dan NVIDIA cuOpt (< 2 detik) serta Dual-Engine AI (Nemotron Ultra 550B & Llama 3.3 70B) untuk Switch Trip Impact Analysis.
