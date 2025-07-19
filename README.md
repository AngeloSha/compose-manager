# Compose Manager

A modern web UI to edit and merge multiple Docker Compose files, with live linting and YAML validation. Built using React (frontend) and Go (backend).

<img width="2556" height="1272" alt="image" src="https://github.com/user-attachments/assets/71306cae-588e-436c-9e94-1c74556f46eb" />





## ✨ Features

- Browse, view, and edit multiple Docker Compose files
- Merge selected files with:
  - Deduplicated networks and volumes
  - Auto-renamed services on conflict
- Inline YAML syntax linting
- Dark mode toggle
- Clean and responsive UI

## 📦 Usage

### 1. Build & Run with Docker

```bash
git clone https://github.com/AngeloSha/compose-manager.git
cd compose-manager
docker compose up --build
```


2. Scan Custom Paths (optional)
You can change scan directories by setting the SCAN_DIRS environment variable:
```bash
SCAN_DIRS="/data,/opt,/var" docker compose up --build
```


## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS  
- **Backend**: Go + Gin  
- **Diff Viewer**: `react-diff-viewer`  
- **Editor**: `monaco-editor`
