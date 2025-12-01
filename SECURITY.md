# Security Guidelines

## File-file yang TIDAK BOLEH di-commit ke Git

### 1. File Environment Variables (.env)
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env*.local`

**Alasan:** File ini berisi API keys, database credentials, dan informasi sensitif lainnya.

### 2. File Konfigurasi Firebase
- `firebase.json` (jika berisi credentials)
- `.firebaserc` (jika berisi project info sensitif)
- File di folder `.firebase/`

**Alasan:** Berisi konfigurasi dan credentials Firebase.

### 3. File Credentials & Keys
- `*.key`
- `*.pem`
- `*.p12`
- `*.pfx`
- `*.crt`
- `*.cer`
- `secrets.json`
- `credentials.json`
- `.secrets`
- `.secret`

**Alasan:** File-file ini berisi private keys dan credentials yang sangat sensitif.

### 4. File Log & Cache
- `*.log`
- `npm-debug.log*`
- `yarn-debug.log*`
- `.cache/`
- `node_modules/`

**Alasan:** Dapat berisi informasi sensitif dari error logs.

### 5. File Build & Dependencies
- `/build`
- `/node_modules`
- `/dist`

**Alasan:** File build dapat berisi informasi sensitif, dan node_modules terlalu besar.

### 6. File IDE & OS
- `.vscode/`
- `.idea/`
- `.DS_Store`
- `Thumbs.db`

**Alasan:** Dapat berisi konfigurasi lokal yang tidak perlu di-share.

## Best Practices

1. **Gunakan Environment Variables**
   - Simpan semua API keys dan credentials di file `.env`
   - Jangan hardcode credentials di source code
   - Gunakan `.env.example` sebagai template

2. **Review sebelum commit**
   - Selalu cek `git status` sebelum commit
   - Jangan commit file yang berisi informasi sensitif
   - Gunakan `git diff` untuk melihat perubahan

3. **Jika sudah ter-commit secara tidak sengaja:**
   - Segera hapus dari Git history
   - Rotate/ubah semua credentials yang ter-expose
   - Gunakan `git filter-branch` atau `BFG Repo-Cleaner`

## Cara Menggunakan Environment Variables

1. Buat file `.env` di root project
2. Copy dari `.env.example` dan isi dengan nilai sebenarnya
3. File `.env` sudah di-ignore oleh `.gitignore`
4. Akses di code dengan `process.env.REACT_APP_*`

