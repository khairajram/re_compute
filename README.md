# 🚀 codeFlow

A premium, secure, and distributed compute platform that allows users to rent remote machines and run workloads in real-time through a feature-rich browser-based Cloud IDE.

> 💡 **Distributed Compute & Cloud IDE** — Powered by real user machines, isolated dynamically with Docker and sandboxed Linux permissions, and controlled via standard WebSockets.

---

## 🎨 Premium Features

### 🖥️ High-Fidelity Cloud IDE
* **Draggable Resizable splits**: Adjust the layout dimensions dynamically by dragging the borders of the left file explorer or the bottom terminal.
* **Panel Toggles**: Minimize the file explorer sidebar or collapse/expand the terminal panel with single-click header buttons to maximize screen real estate.
* **Monaco Editor Enhancements**: 
  * Support for C++, Python, Rust, Go, Java, TypeScript, SQL, YAML, and HTML/CSS.
  * Custom **C++ Autocomplete Provider** loaded client-side with native keyword and snippet suggestion templates (e.g. typing `#in` suggests library inclusions, `main` expands standard boilerplate, `cout` generates console output logic).
* **Theme Changer**: Select your workspace theme dynamically (`Dark Theme`, `Light Theme`, `High Contrast`) directly inside the editor tab.
* **Authenticated Greeting**: Dashboard fetches and displays your authenticated profile name dynamically.

### 🔒 Docker & PTY Linux Sandboxing
* **Traversal Prevention**: The `/app/jobs` directory is protected with traversal-only (`711`) permissions, and individual session directories `/app/jobs/<sessionId>` are restricted with owner-only read-write-execute (`700`) permissions.
* **Non-Privileged Process Spawning**: The host-agent creates restricted Unix users (e.g., `usr_eee39f5b45`) inside the container and maps all `node-pty` terminal shell PTYs to their specific `uid` and `gid`.
* **Sync Permissions**: Host-agent automatically runs recursive permission syncing when files are written or directories are created, maintaining seamless synchronization between the file tree UI and the shell.

### 📡 Real-time Multi-Client Syncing
* The WebSocket backend utilizes group routing to broadcast PTY streams and file structure update notifications to **all active client tabs** connected to the same session, preventing message dropouts across multiple open browser tabs.

---

## 🏗️ Monorepo Structure

```
codeFlow/
│
├── apps/
│   ├── app_frontend/     # Next.js 14 Web UI & Cloud IDE
│   ├── backend/          # REST API Backend (Express, JWT Auth)
│   ├── ws-backend/       # WebSocket Routing Server
│   └── host-agent/       # Containerized Node-PTY Host Daemon (Docker)
│
├── packages/
│   ├── db/               # Shared Prisma ORM client wrapper (PostgreSQL)
│   ├── ui/               # Shared UI component library
│   ├── typescript-config/# Shared TS configurations
│   └── eslint-config/    # Shared linting rule configurations
│
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions Continuous Deployment to EC2
│
├── turbo.json            # Monorepo task runner configuration
├── pnpm-workspace.yaml   # Workspace definitions
└── package.json
```

---

## 🔌 Core Architecture

```
Client Browser (Cloud IDE) ──[HTTP]──> Next.js Frontend ──[API]──> Express REST API ──> Prisma / DB
      │
      └──────────────────────[WebSockets]──> WS Router ──> Host Agent (Docker Daemon) ──> Sandboxed PTY Shells
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/khairajram/re_compute.git codeflow
cd codeflow
```

### 2️⃣ Install Dependencies
```bash
pnpm install
```

### 3️⃣ Configure Environment Variables
Create env variables for your local workspace applications:

#### Backend (`apps/backend/.env`):
```env
PORT=4000
DATABASE_URL="postgresql://admin:secret@localhost:5432/mydb?schema=public"
JWT_SECRET="your-super-secure-secret-key"
JWT_EXPIRES_IN="20d"
FRONTEND_URL="http://localhost:3000"

# Optional (Will fall back to local auth if missing)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

#### Frontend (`apps/app_frontend/.env`):
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:8080"
```

### 4️⃣ Database Migration & Seed
Make sure PostgreSQL is running locally.
```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

### 5️⃣ Run Development Servers
Start all servers concurrently (Next.js, REST API, WebSocket) in development mode:
```bash
pnpm dev
```

---

## 🐋 Running the Host Agent

The host-agent runs on the machine supplying compute resources. It requires Docker and is executed in a container:

```bash
# Build the host daemon image
docker build -t host-agent ./apps/host-agent

# Run the container (Requires access to host docker socket for sibling orchestration)
docker run -d \
  --name my-agent \
  -e WS_SERVER_URL="ws://localhost:8080" \
  -e MACHINE_ID="your-registered-machine-uuid" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  host-agent
```

---

## 🚀 Continuous Deployment (CI/CD)

The project includes an auto-deployment action configured in [deploy.yml](.github/workflows/deploy.yml).

On push to the `main` branch, the workflow:
1. Logs into the EC2 instance via SSH.
2. Synchronizes with `origin/main`.
3. Runs `pnpm install`, `Prisma client generation`, and `pnpm build`.
4. Gracefully restarts the services using **PM2** (`pm2 restart all`).

To enable: Add `EC2_HOST`, `EC2_USERNAME`, and `EC2_SSH_KEY` (.pem private key) as secrets under your GitHub repository **Settings ➡️ Secrets and variables ➡️ Actions**.

---

## 📄 License

This project is licensed under the MIT License.
