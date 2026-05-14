# 🧠 PROJECT CONTEXT

## 1. Informasi Umum
- **Nama Project**: WebGL Roller Coaster Simulation (Roller Coaster Camera Lab)
- **Deskripsi Project**: Aplikasi ini adalah simulasi 3D interaktif berbasis Web yang memungkinkan pengguna untuk merasakan pengalaman menaiki roller coaster melalui berbagai sudut pandang kamera. Project ini menggabungkan teknik rendering grafis tingkat lanjut dengan simulasi fisika sederhana untuk menciptakan visualisasi pergerakan objek di atas lintasan (spline-based motion).
- **Tujuan Utama**: Menyediakan alat eksperimen untuk visualisasi pergerakan kamera 3D, pengujian jalur spline, serta monitoring data teknis (kecepatan, G-Force, gradien) secara real-time dalam lingkungan WebGL.
- **Target User**: Developer grafis, mahasiswa grafika komputer, dan peminat simulasi 3D.
- **Fitur Utama**:
    - **Simulasi Fisika Dinamis**: Menghitung kecepatan berdasarkan gravitasi, gesekan (friction), dan hambatan gulir (rolling resistance). Terdapat fitur "Booster" otomatis pada tanjakan curam agar kereta tidak berhenti.
    - **Sistem Kamera Multi-Mode**: 
        - **First Person**: Kamera di kursi depan untuk sensasi nyata.
        - **Third Person (Chase)**: Kamera mengikuti kereta dari belakang.
        - **Free Camera**: Mode bebas yang memungkinkan navigasi mandiri menggunakan WASD dan mouse.
    - **Visualisasi Lintasan Realistis**: Menggunakan geometri rel ganda (dual rails), bantalan kayu/besi (sleepers), dan pelindung samping (side guards).
    - **HUD (Heads-Up Display)**: Panel instrumen real-time yang menampilkan kecepatan (km/h), ketinggian, G-Force, gradien lintasan, dan performa (FPS).
    - **Library Jalur Terintegrasi**: Berbagai pilihan desain track (Classic, Omega, Mountain, dll.) dengan karakteristik teknis unik.

## 2. Teknologi yang Digunakan
- **Bahasa Pemrograman**: JavaScript (ES6+).
- **Framework Utama**: **React 18**, digunakan untuk membangun UI/HUD dan mengelola siklus hidup (lifecycle) dari komponen-komponen Three.js.
- **Library / Packages Penting**:
    - **Three.js**: Engine utama untuk rendering grafik 3D WebGL.
    - **Zustand**: State management ringan untuk sinkronisasi data antara simulasi 3D dan komponen UI React.
    - **GSAP (GreenSock)**: Digunakan untuk animasi transisi UI yang halus dan efek visual pada dashboard.
    - **Cannon-es**: Engine fisika yang tersedia sebagai dependensi untuk potensi pengembangan simulasi rigid body (saat ini logika gerak utama menggunakan perhitungan kustom).
- **Vite**: Build tool modern untuk pengembangan yang cepat dan efisien.
- **Design System**: Custom Vanilla CSS dengan estetika modern (glassmorphism dan dashboard futuristik).

## 3. Arsitektur & Alur Sistem
- **Arsitektur**: Menggunakan pola **Component-Based Architecture** di React dengan pemisahan tegas antara logika simulasi (Utils), representasi objek 3D (Objects), dan antarmuka pengguna (UI).
- **Alur Data End-to-End**:
    1. **Initialization**: `Scene.jsx` menyiapkan WebGL Renderer, Scene, dan Camera.
    2. **Configuration**: Data titik koordinat lintasan diproses oleh `TrackGenerator` menjadi kurva spline Three.js.
    3. **Simulation Loop**: `PhysicsEngine` menghitung posisi baru berdasarkan `deltaTime` dan gaya gravitasi.
    4. **Update**: Posisi kereta dan kamera diperbarui di dalam `requestAnimationFrame`.
    5. **Synchronization**: Metrik teknis dikirim ke **Zustand Store**.
    6. **Reactivity**: UI React (Stats & InfoPanel) mendeteksi perubahan di store dan memperbarui tampilan HUD secara instan.
- **State Management**: Zustand menangani status global seperti `isPlaying`, `viewMode`, `selectedTrackId`, dan data performa.

## 4. Struktur Folder & Penjelasan Detail
```text
/src
├── /components         # Komponen UI dan Wrapper 3D
│   ├── /UI             # Elemen dashboard (Controls, Stats, InfoPanel)
│   ├── Canvas.jsx      # Kontainer utama untuk renderer WebGL
│   └── Scene.jsx       # Jantung aplikasi: tempat inisialisasi dan loop simulasi
├── /objects            # Definisi objek 3D (Geometri & Material)
│   ├── RollerCoasterTrack.js  # Logika pembuatan rel dan bantalan
│   ├── TrainComposition.js    # Pengaturan rangkaian kereta
│   ├── Support.js             # Struktur penyangga otomatis (tiang rel)
│   └── Environment.js         # Langit, tanah, dan pencahayaan lingkungan
├── /scenes             # Skrip setup standar Three.js
│   ├── setupCamera.js
│   ├── setupLights.js
│   └── setupRenderer.js
├── /store              # State management (Zustand)
│   └── simulationStore.js
├── /utils              # Logika matematika dan utilitas teknis
│   ├── PhysicsEngine.js       # Otak perhitungan gerak & G-Force
│   ├── TrackGenerator.js      # Konversi koordinat ke kurva spline
│   ├── CameraController.js    # Manajemen transisi kamera mengikuti kereta
│   └── MathUtils.js           # Fungsi pembantu kalkulasi (kmh to ms, dll)
└── App.jsx             # Entry point aplikasi (Layouting UI)
```

## 5. Konvensi & Gaya Coding
- **Modularitas**: Setiap objek 3D didefinisikan dalam file terpisah untuk memudahkan perawatan.
- **Clean Disposal**: Implementasi fungsi `disposeSceneBranch` untuk membersihkan memori (geometri & material) setiap kali track diganti, mencegah memory leak.
- **Naming Convention**:
    - **PascalCase**: Untuk komponen React dan Class (misal: `PhysicsEngine`).
    - **camelCase**: Untuk variabel, fungsi, dan instance objek.
    - **UPPER_SNAKE_CASE**: Untuk konstanta di `Constants.js`.
- **Separation of Concerns**: Logika perhitungan fisika murni berada di `utils`, terpisah dari logika rendering di `objects`.

## 6. Cara Menjalankan Project
- **Prasyarat**: Pastikan Node.js sudah terinstal.
- **Langkah-langkah**:
    1. Clone repository.
    2. Jalankan perintah `npm install` untuk menginstal dependensi.
    3. Jalankan `npm run dev` untuk memulai development server.
    4. Buka browser di alamat `http://localhost:5173`.
- **Produksi**: Gunakan `npm run build` untuk menghasilkan bundle siap deploy di folder `/dist`.

## 7. Insight Teknis Tambahan
- **Keputusan Teknis**: Penggunaan `CatmullRomCurve3` dipilih karena kemampuannya menghasilkan lintasan yang sangat halus dari sedikit titik kontrol.
- **Potensi Improvement**: 
    - Penambahan sistem partikel untuk efek angin atau debu.
    - Integrasi audio spasial yang berubah frekuensinya berdasarkan kecepatan (Doppler effect).
- **Known Limitation**: Simulasi saat ini dibatasi pada pergerakan satu arah di sepanjang spline (1D pathing), sehingga interaksi tumbukan bebas antar kereta belum diimplementasikan secara penuh.

## 8. Ringkasan untuk AI
Project ini adalah **simulasi roller coaster 3D** yang dibangun dengan **Three.js** dan **React**. Hal-hal krusial yang perlu dipahami AI:
1. **Pusat Logika**: Segala perhitungan pergerakan ada di `PhysicsEngine.js` dan loop utama di `Scene.jsx`.
2. **Data Flow**: Menggunakan **Zustand** untuk menjembatani dunia 3D (imperative) dan UI React (declarative).
3. **Struktur Objek**: Objek 3D dibangun secara prosedural di dalam folder `src/objects`.
4. **Kamera**: Ada logika transisi yang kompleks di `CameraController.js` untuk menjaga kehalusan pergerakan saat berganti mode pandang.
