# Untuk Cinut, dengan sayang — React

Website ulang tahun personal dengan warna krem dan burgundy, empat foto asli, galeri interaktif, amplop surat, lilin ulang tahun, dan lagu **Happy Birthday To You — Pamungkas** dari MP3 yang diberikan pengguna. Pemutar menggunakan audio lokal; tautan Spotify pilihan awal tetap tersedia.

Dibangun dengan React 19, Vite 8, JavaScript/JSX, dan CSS. Interaksi memakai state dan hooks React. Timer, pemuatan aset, pengamat animasi, dan event listener dibersihkan saat komponen dilepas, termasuk ketika memakai Strict Mode.

## Menjalankan

Gunakan Node.js 22.23 atau lebih baru:

```sh
npm install
npm run dev
```

Buka http://localhost:4173. Untuk build produksi dan preview:

```sh
npm run build
npm run preview
```

Jalankan `npm test` untuk tes komponen, atau `npm run check` untuk tes sekaligus build. Tes menggunakan Vitest, React Testing Library, dan jsdom; tes ini tidak menggantikan pemeriksaan tampilan atau audio di browser asli.

## Struktur dan pengeditan

- `src/App.jsx`: susunan halaman dan state galeri.
- `src/components/Hero.jsx`: ucapan pembuka dan foto bertumpuk.
- `src/components/OpeningEnvelope.jsx` dan `src/lib/preloadWelcome.js`: loading foto/font, animasi amplop terbuka, dan transisi ke halaman.
- `src/components/Memories.jsx` dan `src/data/photos.js`: galeri dan keterangan foto.
- `src/components/LetterSection.jsx` dan `LoveLetter.jsx`: animasi amplop dan isi surat.
- `src/components/WishSection.jsx`: lilin, harapan, dan confetti.
- `src/components/SoundToggle.jsx`: panel musik, Play/Jeda, volume, bisu, dan ulangi intro.
- `src/hooks/useBirthdayPlayer.js`: pemutar HTML audio, autoplay, penanganan error, dan siklus hidup pemutar.
- `src/data/music.js`: lokasi MP3, durasi potongan, dan volume awal.
- `src/components/Reveal.jsx` dan `src/hooks/useReducedMotion.js`: animasi kemunculan dan preferensi gerakan.
- `src/styles.css`: warna, layout responsif, dan animasi CSS.
- `public/assets/`: foto asli, potongan MP3, font, favicon, dan lisensi font.
- `src/test/`: pengujian navigasi foto, surat, lilin, reduced motion, loading amplop, dan kontrol musik dengan mock API media browser.

Saat halaman dibuka, layar amplop menunggu empat foto dan empat font, lalu membuka segel, mengangkat surat, dan memudar ke halaman utama. Progres mengikuti aset yang selesai diproses. Jika sebuah aset gagal atau tidak merespons selama delapan detik, halaman tetap dilanjutkan. Pengaturan reduced motion melewati waktu animasi. Konten halaman belum bisa difokuskan atau diklik selama loading.

Setelah loading amplop selesai dan audio siap, panel musik terbuka dan mencoba memutar **30 detik pertama (0:00–0:30)** dengan volume awal **40%**. File `public/assets/happy-birthday-intro.mp3` berasal dari MP3 yang diberikan pengguna, dipotong menjadi 30 detik dengan fade-out satu detik terakhir. File stereo 44.1 kHz, 192 kbps ini berukuran sekitar 722 KB. File asli di Downloads tidak diubah. Durasi dan dekode potongan telah diperiksa, tetapi pemutaran langsung di browser belum diverifikasi.

Audio dimuat selama animasi pembuka, tanpa iframe, script YouTube, atau koneksi ke pemutar Spotify. `initialVolume` dapat diubah di `src/data/music.js`; jika mengganti potongan MP3, sesuaikan `src` dan `durationSeconds` dengan file penggantinya. Durasi yang tercantum hanya untuk indikator waktu; panjang file audio menentukan kapan pemutaran berakhir.

Volume dapat diatur 0–100%, dinaikkan atau diturunkan 10%, serta dibisukan. **Ulangi awal** memutar ulang potongan tersebut. Pemutar dijeda saat panel ditutup, tab disembunyikan, atau galeri foto menutup halaman. Memunculkannya kembali tidak memutar lagu tanpa klik Play.

Browser dapat memblokir autoplay bersuara. Jika itu terjadi, panel meminta satu klik **Play**; autoplay tidak bisa dijamin. Jika MP3 gagal dimuat, tersedia tombol coba lagi. Kontrol volume memakai properti `HTMLMediaElement.volume`; browser/perangkat yang membatasi pengaturan ini memerlukan tombol volume perangkat. Lihat [pemutaran audio di browser](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) dan [dukungan volume](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume).

Lilin memakai tombol tanpa mikrofon. Galeri mendukung tombol panah, Escape, fokus keyboard, dan penguncian scroll saat dibuka. Tanggal dan umur belum dicantumkan.

Semua font dan foto disimpan lokal. Font Cormorant Garamond, DM Sans, dan Caveat menggunakan SIL Open Font License; teks lisensinya ada di `public/assets/`.

## Hosting

Folder `dist/` dihasilkan ulang oleh `npm run build` dan siap diunggah ke hosting statis. Sajikan melalui HTTP, bukan membuka `index.html` lewat `file://`. Jangan mengedit file di `dist/` karena build berikutnya akan menimpanya.

Identitas Sites tetap tercatat di `.openai/hosting.json`. Pengunggahan source dan foto ke Sites belum dilakukan karena menunggu persetujuan khusus untuk pengiriman foto pribadi.

Dokumentasi: [React dengan build tool](https://react.dev/learn/build-a-react-app-from-scratch) dan [Vite](https://vite.dev/guide/).
