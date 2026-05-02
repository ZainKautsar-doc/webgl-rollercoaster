# 🧠 PROJECT CONTEXT

## 1. Informasi Umum

- **Nama project:** `webglgrafkom`
- **Deskripsi project:** Project ini adalah aplikasi web interaktif berbasis React dan WebGL untuk mensimulasikan perjalanan roller coaster 3D. Aplikasi menampilkan lintasan coaster tertutup berbasis spline, kereta yang bergerak di atas lintasan, perhitungan fisika sederhana, beberapa mode kamera, serta panel HUD untuk kontrol dan monitoring data simulasi secara real-time.
- **Domain project:** Computer graphics / WebGL / simulasi visual / interactive 3D experience.
- **Tujuan utama:** Menyediakan laboratorium visual untuk mengeksplorasi hubungan antara geometri lintasan, pergerakan kereta, sudut kamera, dan metrik fisika seperti kecepatan, elevasi, kemiringan, dan G-force. Secara praktis, project ini menyelesaikan kebutuhan untuk memvisualisasikan simulasi roller coaster langsung di browser tanpa backend.
- **Target user:** Kemungkinan besar mahasiswa, dosen, atau pembelajar grafika komputer yang ingin mendemonstrasikan Three.js, spline path, kamera dinamis, dan simulasi gerak. Ini adalah **asumsi** berdasarkan nama repo, isi aplikasi, dan tidak adanya fitur bisnis/komersial.
- **Fitur utama:**
  - Aplikasi menyediakan **3 preset lintasan** (`Beginner Loop`, `Corkscrew Extreme`, `Hypercoaster`) dengan karakteristik yang berbeda. Masing-masing preset memiliki titik kontrol, warna, batas kecepatan awal, friksi, rolling resistance, dan kekuatan booster sendiri.
  - Simulasi menjalankan **kereta roller coaster 3D** yang bergerak di atas lintasan tertutup. Posisi kereta dihitung dari jarak tempuh di atas spline, bukan dari rigid-body bebas di dunia 3D.
  - Sistem kamera mendukung **first person**, **third person**, dan **free camera**. Dua mode pertama mengikuti kereta, sedangkan free camera sepenuhnya lepas dari kereta dan dapat digerakkan manual dengan keyboard dan mouse.
  - HUD menampilkan **kontrol interaktif** seperti play/pause, reset simulasi, pemilihan lintasan, batas kecepatan, kecepatan free camera, sensitivitas mouse, serta petunjuk kontrol kamera bebas.
  - Panel informasi menampilkan **telemetri real-time** seperti kecepatan, ketinggian, G-force, jarak tempuh, waktu simulasi, gradien lintasan, progres loop, status booster, FPS, panjang lintasan, dan jumlah spline sample.
  - Lintasan divisualisasikan sebagai **dual rails** lengkap dengan sleepers/ties, clamps, side guards, center spine, dan support structure agar tampil lebih realistis dibanding tabung tunggal sederhana.
  - Terrain lingkungan diukir dengan aturan clearance agar lintasan **tidak menembus tanah**. Free camera juga dipaksa menjaga jarak minimum terhadap permukaan tanah.
  - Aplikasi memvalidasi **continuity** lintasan tertutup dengan memeriksa gap posisi dan alignment tangent di titik sambungan loop.

## 2. Teknologi yang Digunakan

- **Bahasa pemrograman:**
  - JavaScript modern berbasis ES Modules.
  - CSS untuk styling antarmuka.

- **Framework utama dan perannya:**
  - **React 18**: membangun UI aplikasi, menyusun layout, dan menghubungkan panel kontrol/HUD dengan state simulasi.
  - **Vite**: development server dan bundler untuk build production.
  - **Three.js**: engine rendering 3D utama untuk scene, camera, geometry, material, lighting, fog, shader sky, dan renderer WebGL.

- **Library / package penting + fungsi masing-masing:**
  - **`zustand`**: state management global untuk status simulasi seperti play/pause, mode kamera, track aktif, speed cap, metrics, FPS, dan trigger reset scene.
  - **`gsap`**: animasi masuk untuk elemen UI saat aplikasi pertama kali dirender.
  - **`cannon-es`**: dipakai sangat terbatas sebagai sumber world gravity dalam `PhysicsEngine`. Project ini tidak menjalankan simulasi rigid body penuh; library ini lebih berperan sebagai utilitas fisika dasar daripada physics stack lengkap.
  - **`three`**: paket inti grafika 3D, termasuk `CatmullRomCurve3`, `TubeGeometry`, `InstancedMesh`, `PerspectiveCamera`, `ShaderMaterial`, dan utilitas matematika vektor.

- **Design system / UI framework:**
  - Tidak ada UI framework eksternal seperti Material UI, Tailwind, atau Chakra.
  - UI dibangun dengan **CSS kustom penuh** di `src/App.css`.
  - Gaya visual menggunakan dashboard gelap dengan efek glassmorphism ringan, aksen cyan-oranye, layout grid responsif, dan typography campuran sans-serif + serif untuk heading.

- **Tools tambahan:**
  - Tidak ada ORM, database, backend API client, atau authentication provider.
  - Tidak ada React Router.
  - Tidak ada form library khusus.
  - Tidak ada test framework yang terkonfigurasi pada `package.json`.

## 3. Arsitektur & Alur Sistem

- **Arsitektur yang digunakan:**
  - Arsitektur project ini paling tepat disebut **frontend-only modular architecture** dengan pemisahan tanggung jawab berdasarkan domain:
    - `components` untuk UI dan mounting scene.
    - `scenes` untuk setup primitive Three.js.
    - `objects` untuk konstruksi objek 3D tingkat domain.
    - `utils` untuk logika geometri, kamera, fisika, konstanta, dan formatting.
    - `store` untuk state global aplikasi.
  - Ini bukan MVC formal dan bukan Clean Architecture penuh, tetapi sudah menerapkan pemisahan concern yang cukup jelas antara presentasi, state, dan engine simulasi.

- **Alur data end-to-end:**
  1. User membuka aplikasi web.
  2. `src/main.jsx` merender `App`.
  3. `App` menyusun dashboard UI: panel kontrol, kanvas 3D, panel info, dan panel statistik.
  4. `Canvas` membuat elemen DOM tempat `WebGLRenderer` ditempel, lalu `Scene` menginisialisasi seluruh sistem 3D.
  5. `Scene` membaca state dari Zustand, memilih preset track aktif, lalu mem-build `trackData` dari control points dengan `TrackGenerator`.
  6. `Scene` memvalidasi continuity loop, membuat environment, mesh lintasan, support structure, dan kereta.
  7. `Scene` membuat `CameraController`, `FreeCameraController`, dan `PhysicsEngine`.
  8. Loop animasi `requestAnimationFrame` berjalan terus:
     - membaca state terbaru dari store,
     - meng-update fisika jika simulasi sedang play,
     - memilih mode kamera yang aktif,
     - meng-update posisi kereta dan/atau kamera,
     - menghitung FPS,
     - mengirim metrik baru ke store,
     - merender frame dengan Three.js.
  9. Komponen UI (`Controls`, `InfoPanel`, `Stats`) berlangganan state Zustand dan otomatis rerender saat state relevan berubah.

- **Bagaimana state management bekerja:**
  - State global disimpan di `src/store/simulationStore.js` menggunakan Zustand.
  - Store memegang:
    - status simulasi (`isPlaying`, `status`, `simulationKey`)
    - konfigurasi tampilan (`viewMode`)
    - konfigurasi free camera (`freeCameraSpeed`, `freeCameraMouseSensitivity`, `freeCameraSprintEnabled`)
    - preset lintasan aktif (`selectedTrackId`)
    - metrik runtime (`metrics`, `fps`, `trackLength`, `sampleCount`)
    - speed cap (`speedLimitKmh`)
  - `simulationKey` dipakai sebagai pemicu rebuild scene. Saat track diganti atau simulasi di-reset, nilainya dinaikkan agar efek React di `Scene` dijalankan ulang.

- **Bagaimana API handling bekerja:**
  - Tidak ada HTTP API eksternal maupun internal.
  - “API” di project ini bersifat internal antar-modul JavaScript, misalnya `buildTrackData`, `validateTrackContinuity`, `createEnvironment`, dan `physicsEngine.update()`.

- **Bagaimana authentication bekerja:**
  - Tidak ada sistem authentication, session, token, atau role-based access.

- **Bagaimana simulasi fisika bekerja:**
  - Kereta tidak bergerak bebas di dunia fisika. Ia “dikunci” ke lintasan tertutup.
  - Engine menghitung gradien lintasan dari tangent spline, lalu menggabungkan:
    - pengaruh gravitasi terhadap tanjakan/turunan,
    - momentum assist berbasis perubahan ketinggian,
    - friction dan rolling resistance,
    - booster saat tanjakan curam dan kecepatan terlalu rendah.
  - Hasilnya adalah kecepatan baru, jarak tempuh baru, dan estimasi G-force.

- **Bagaimana kamera bekerja:**
  - **First person:** kamera diletakkan sedikit di atas rel/kereta dan menghadap ke depan lintasan.
  - **Third person:** kamera mengikuti dari belakang dan sedikit di samping/atas kereta.
  - **Free camera:** kamera bebas dengan kontrol `W/A/S/D`, `Q/E`, `Shift`, drag kanan mouse, dan scroll wheel; kamera tidak lagi mengikuti kereta tetapi kereta tetap bergerak di scene.

## 4. Struktur Folder & Penjelasan Detail

> Tree di bawah fokus pada file source yang penting. Folder hasil build dan dependency (`dist`, `node_modules`) tidak dijelaskan detail karena bersifat generated/external.

```text
webglgrafkom/
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
├─ vite.config.js
├─ PROJECT_CONTEXT.md
├─ dist/
├─ node_modules/
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ App.css
   ├─ components/
   │  ├─ Canvas.jsx
   │  ├─ Scene.jsx
   │  └─ UI/
   │     ├─ Controls.jsx
   │     ├─ InfoPanel.jsx
   │     └─ Stats.jsx
   ├─ objects/
   │  ├─ Environment.js
   │  ├─ RollerCoasterTrack.js
   │  ├─ Support.js
   │  ├─ TrainCar.js
   │  └─ TrainComposition.js
   ├─ scenes/
   │  ├─ setupCamera.js
   │  ├─ setupLights.js
   │  ├─ setupRenderer.js
   │  └─ setupScene.js
   ├─ store/
   │  └─ simulationStore.js
   └─ utils/
      ├─ CameraController.js
      ├─ Constants.js
      ├─ FreeCameraController.js
      ├─ MathUtils.js
      ├─ PhysicsEngine.js
      ├─ TrackGenerator.js
      └─ TrackValidator.js
```

- **Penjelasan setiap folder:**
  - **`src/`**: seluruh source code aplikasi frontend.
  - **`src/components/`**: komponen React untuk UI dan integrasi scene 3D ke DOM.
  - **`src/components/UI/`**: komponen presentasional HUD dan panel interaksi user.
  - **`src/objects/`**: builder objek Three.js tingkat domain, misalnya lintasan, support, environment, dan kereta.
  - **`src/scenes/`**: fungsi setup primitif untuk scene, renderer, lights, dan camera.
  - **`src/store/`**: state global berbasis Zustand.
  - **`src/utils/`**: utilitas lintasan, fisika, kamera, matematika, dan konstanta.
  - **`dist/`**: output build production Vite.
  - **`node_modules/`**: dependency yang diinstal via npm.

- **Penjelasan file-file penting:**
  - **`index.html`**: template HTML utama Vite yang menyediakan elemen root untuk React.
  - **`package.json`**: mendefinisikan metadata project, dependency, dan script `dev`, `build`, `preview`.
  - **`vite.config.js`**: konfigurasi Vite; mengaktifkan plugin React, membagi bundle manual chunks, dan mengizinkan dev server diakses via host.
  - **`src/main.jsx`**: entry point React; me-mount `App` ke DOM dan mengimpor CSS global.
  - **`src/App.jsx`**: shell layout utama aplikasi dan animasi awal GSAP untuk blok UI.
  - **`src/App.css`**: satu file stylesheet utama untuk seluruh layout dashboard, card HUD, panel canvas, status chip, metric tiles, dan responsive behavior.
  - **`src/components/Canvas.jsx`**: menyediakan elemen DOM yang akan diisi `WebGLRenderer`, lalu merender `Scene`.
  - **`src/components/Scene.jsx`**: file paling sentral. Bertanggung jawab menginisialisasi renderer/scene/camera/lights, membangun track dan environment, membuat kereta dan controller, menjalankan animation loop, sinkronisasi store, handle resize, serta cleanup resource Three.js.
  - **`src/components/UI/Controls.jsx`**: panel kontrol interaktif untuk mengganti preset track, mengatur speed cap, mengganti mode kamera, mengatur free camera, pause/play, dan reset simulasi.
  - **`src/components/UI/InfoPanel.jsx`**: menampilkan data ride real-time dalam bentuk metric tiles dan progress loop.
  - **`src/components/UI/Stats.jsx`**: menampilkan statistik rendering seperti FPS, panjang lintasan, jumlah sample spline, mode kamera, dan status scene.
  - **`src/objects/RollerCoasterTrack.js`**: membangun mesh lintasan lengkap dengan dua rel utama, dua guard rail, center spine, ties, dan clamps menggunakan `TubeGeometry` dan `InstancedMesh`.
  - **`src/objects/Support.js`**: membangun pilar dan diagonal brace untuk struktur support lintasan dari permukaan tanah.
  - **`src/objects/Environment.js`**: membangun sky dome shader, terrain mesh dengan height sampler, dan skyline dekoratif; juga menyimpan fungsi `getHeightAt` pada `userData`.
  - **`src/objects/TrainCar.js`**: mendefinisikan bentuk 1 gerbong roller coaster dari primitive geometry Three.js.
  - **`src/objects/TrainComposition.js`**: menyusun beberapa `TrainCar` menjadi satu rangkaian kereta dan meng-update posisinya berdasarkan sample lintasan.
  - **`src/scenes/setupScene.js`**: membuat scene Three.js dengan background dan fog.
  - **`src/scenes/setupCamera.js`**: membuat `PerspectiveCamera`.
  - **`src/scenes/setupLights.js`**: membuat ambient, directional, point, dan rim light berikut target matahari.
  - **`src/scenes/setupRenderer.js`**: membuat `WebGLRenderer`, mengaktifkan shadow map, tone mapping, color space, lalu menempelkan canvas ke container DOM.
  - **`src/store/simulationStore.js`**: definisi state global dan action updater.
  - **`src/utils/Constants.js`**: konstanta global dan definisi preset lintasan beserta control points.
  - **`src/utils/TrackGenerator.js`**: inti pembentukan spline loop tertutup, sample Frenet frame, perhitungan curvature, dan helper lookup posisi/tangent/normal berdasarkan jarak.
  - **`src/utils/TrackValidator.js`**: memeriksa apakah seam awal-akhir lintasan cukup rapat dan tangent-nya cukup selaras.
  - **`src/utils/PhysicsEngine.js`**: engine simulasi kecepatan, percepatan, momentum, friction, booster, dan G-force.
  - **`src/utils/CameraController.js`**: logika kamera first-person dan third-person yang mengikuti lintasan/kereta.
  - **`src/utils/FreeCameraController.js`**: logika free camera lengkap dengan input keyboard/mouse dan penjagaan clearance terhadap terrain.
  - **`src/utils/MathUtils.js`**: helper matematika umum dan formatter angka/waktu/jarak.

- **Pola struktur yang digunakan:**
  - Struktur project cenderung **domain-modular**, bukan feature-based penuh dan bukan layered backend-style.
  - File utilitas teknis dipisahkan dari objek visual.
  - Komponen React tetap tipis; logika berat dipindahkan ke class/helper di `utils` dan `objects`.

## 5. Konvensi & Gaya Coding

- **Gaya coding yang digunakan:**
  - Pendekatan modular, cukup dekat dengan prinsip **single responsibility**.
  - Logika render Three.js, fisika, kamera, dan pembentukan objek dipisahkan ke modul berbeda.
  - Ada usaha menjaga **readability** dengan nama fungsi yang eksplisit seperti `createEnvironment`, `setupLights`, `buildTrackData`, `validateTrackContinuity`, `resetSimulation`.
  - Konsep **DRY** diterapkan secukupnya, misalnya helper matematika dan helper penempatan geometri diulang lewat fungsi utilitas.

- **Naming convention:**
  - **Komponen React dan class:** PascalCase (`Scene`, `Controls`, `PhysicsEngine`, `TrainComposition`).
  - **Fungsi dan variabel:** camelCase (`setupRenderer`, `selectedTrackId`, `freeCameraMouseSensitivity`).
  - **Konstanta global:** UPPER_SNAKE_CASE (`GRAVITY`, `TRACK_SAMPLE_COUNT`, `PREDEFINED_TRACKS`).
  - **Nama file:** campuran PascalCase untuk komponen/class dan camelCase untuk setup/store/util sederhana, namun konsisten dengan isi file.

- **Struktur penulisan code:**
  - UI React dipisahkan dari logika engine.
  - Setup scene dirakit dari fungsi-fungsi kecil (`setupScene`, `setupCamera`, `setupLights`, `setupRenderer`) lalu diorkestrasi oleh `Scene.jsx`.
  - Objek 3D kompleks dibuat lewat builder/factory atau class tersendiri, bukan ditulis inline di komponen React.
  - Simulasi per-frame terkonsentrasi di satu animation loop dalam `Scene.jsx`.

- **Cara handle error:**
  - Project ini hampir tidak memiliki sistem error handling formal seperti boundary, try/catch besar, atau logging service.
  - Penanganan defensif dilakukan lewat:
    - fallback preset lintasan default jika ID tidak ditemukan,
    - clamp nilai numerik,
    - pengecekan `mountRef`,
    - pembatasan pitch/speed free camera,
    - fallback frame/up vector jika orientasi spline ekstrem.
  - Ini berarti error runtime dari WebGL/device/browser tertentu masih berpotensi muncul tanpa fallback UX khusus.

- **Cara reusable code dibuat:**
  - Reuse terutama dilakukan lewat:
    - helper matematika di `MathUtils.js`,
    - konstanta global di `Constants.js`,
    - builder scene di folder `scenes`,
    - builder objek di folder `objects`,
    - controller reusable untuk kamera dan fisika di folder `utils`.
  - `InstancedMesh` dipakai untuk objek berulang seperti ties, clamps, pillars, dan braces agar pembuatan objek berulang tetap efisien.

## 6. Cara Menjalankan Project

- **Prasyarat:**
  - Node.js dan npm terinstal.
  - Browser modern dengan dukungan WebGL.

- **Langkah install:**
  1. Masuk ke folder project.
  2. Install dependency:

```bash
npm install
```

- **Cara menjalankan development mode:**

```bash
npm run dev
```

  - Vite akan menjalankan dev server.
  - Konfigurasi `server.host = true` berarti server dapat diakses dari jaringan lokal, bukan hanya `localhost`.

- **Cara build production:**

```bash
npm run build
```

  - Hasil build akan masuk ke folder `dist/`.

- **Cara preview build production secara lokal:**

```bash
npm run preview
```

- **Environment variables:**
  - Tidak ditemukan file `.env` maupun kebutuhan variabel environment khusus.
  - Jadi saat ini project dapat dijalankan tanpa konfigurasi environment tambahan.

- **Perintah penting:**
  - `npm run dev` untuk development server.
  - `npm run build` untuk build production.
  - `npm run preview` untuk preview hasil build.

## 7. Insight Teknis Tambahan

- **Keputusan teknis penting:**
  - Project memakai **Three.js langsung**, bukan `react-three-fiber`. Keuntungannya adalah kontrol penuh atas lifecycle scene dan animation loop, walaupun konsekuensinya integrasi dengan React menjadi lebih manual.
  - State UI dipusatkan di **Zustand** karena kebutuhan state cukup global tetapi tidak kompleks enough untuk Redux.
  - Lintasan menggunakan **Catmull-Rom spline tertutup** dengan sampling Frenet frames. Ini cocok untuk jalur coaster karena memudahkan perolehan posisi, tangent, normal, binormal, serta curvature di sepanjang lintasan.
  - Mesh berulang menggunakan **InstancedMesh** agar jumlah draw call lebih efisien.
  - Environment terrain menggunakan **height sampler berbasis fungsi** yang ikut mempertimbangkan posisi track, sehingga lintasan memiliki clearance dari tanah tanpa perlu sistem terrain sculpting kompleks.
  - Build Vite memecah bundle menjadi chunk manual (`react-core`, `three-core`, `state-and-motion`) untuk potensi caching dan distribusi bundle yang lebih rapi.

- **Potensi improvement:**
  - Menambahkan **loading/error state** yang lebih formal untuk kegagalan inisialisasi WebGL.
  - Menambahkan **test coverage** minimal untuk utilitas penting seperti `TrackGenerator`, `TrackValidator`, dan `PhysicsEngine`.
  - Mengurangi kerja render saat tab tidak aktif atau saat simulasi pause dengan strategi throttling/pause loop yang lebih agresif.
  - Menambahkan **GUI untuk edit control points** secara real-time agar aplikasi lebih cocok sebagai laboratorium desain track.
  - Menambahkan **serialization/import-export track** supaya preset tidak hardcoded di `Constants.js`.
  - Menambahkan **camera collision / obstacle awareness** untuk free camera agar tidak masuk ke dalam objek 3D lain selain terrain.
  - Menambahkan **profiling dan adaptive quality** untuk device low-end.

- **Known limitation / technical debt:**
  - Tidak ada backend, persistence, atau penyimpanan konfigurasi user.
  - Semua preset track masih **hardcoded**.
  - Simulasi fisika bersifat **aproksimasi**, bukan model coaster engineering yang benar-benar akurat.
  - `cannon-es` belum dimanfaatkan sepenuhnya; dependensi ini terasa lebih berat dari pemakaian aktualnya.
  - Tidak ada sistem test, linting, atau formatting rule yang tampak di root project.
  - Tidak ada accessibility treatment khusus untuk interaksi 3D selain label dasar pada canvas.
  - Cleanup resource Three.js sudah ada, tetapi scene lifecycle tetap cukup manual dan sensitif jika nanti kompleksitas aplikasi meningkat.
  - Properti `freeCameraSprintEnabled` ada di store tetapi pada implementasi saat ini tidak terlihat dipakai sebagai gate logic sprint; ini berpotensi menjadi state sisa atau fitur setengah jadi.

- **Asumsi yang perlu dicatat:**
  - Project ini kemungkinan dibuat untuk tugas/demonstrasi grafika komputer, bukan produk production-grade. Ini adalah asumsi berdasarkan struktur, nama repo, dan sifat aplikasinya.
  - Istilah “reset camera” pada tombol UI sebenarnya mereset keseluruhan simulasi scene melalui `simulationKey`, bukan hanya posisi kamera.

## 8. Ringkasan untuk AI

- Project ini adalah aplikasi web frontend-only untuk simulasi roller coaster 3D berbasis WebGL, lengkap dengan kontrol kamera, HUD metrik, dan beberapa preset lintasan.
- Stack utamanya adalah React 18, Vite, Three.js, Zustand, GSAP, dan sedikit penggunaan `cannon-es` untuk utilitas gravitasi pada engine fisika kustom.
- Pusat orkestrasi runtime ada di `src/components/Scene.jsx`; file ini merakit scene, track, environment, kereta, controller kamera, physics engine, animation loop, sinkronisasi state, dan cleanup.
- Struktur source dipisah cukup rapi: `components` untuk UI/scene mount, `objects` untuk mesh domain 3D, `scenes` untuk setup primitive Three.js, `utils` untuk logika teknis, dan `store` untuk state global.
- Tidak ada backend, API, database, auth, routing, maupun persistence. Semua data preset track dan konfigurasi inti bersifat hardcoded di frontend.
- Sebelum membantu project ini, AI lain perlu tahu bahwa logika utamanya bukan di React UI, melainkan pada modul `TrackGenerator`, `PhysicsEngine`, `CameraController`, `FreeCameraController`, dan builder objek Three.js.
