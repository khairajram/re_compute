# 🚀 Re-Compute

A distributed compute platform that allows users to rent remote machines (laptops/PCs) and run workloads securely via a web interface.

> 💡 Think of it as a lightweight version of cloud computing — powered by real user machines.

---

## 🧠 Overview

Re-Compute enables:

- 🖥️ **Hosts** to share their machine resources (CPU, RAM, storage)
- 👨‍💻 **Users** to rent and execute code remotely
- 🔌 **Real-time communication** via WebSockets
- ⚙️ **Containerized execution** using Docker

---

## 🏗️ Monorepo Structure

```
Re_compute/
│
├── apps/
│   ├── app_frontend/     # Next.js frontend
│   ├── backend/          # REST API (Express)
│   └── websocket/        # WebSocket server
│
├── packages/
│   ├── db/               # Prisma DB client (shared)
│   ├── ui/               # Shared UI components
│   ├── typescript-config/# Shared TS config
│   └── eslint-config/    # Shared lint rules
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## ⚙️ Tech Stack

### 🧩 Core
- Node.js
- TypeScript
- pnpm (workspace)
- Turborepo

### 🌐 Frontend
- Next.js
- React

### 🔧 Backend
- Express.js
- WebSocket (`ws` / `socket.io`)

### 🗄️ Database
- PostgreSQL
- Prisma ORM

### 🐳 Infrastructure
- Docker (for isolated compute environments)

---

## 🚀 Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/khairajram/re_compute
cd re_compute
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Setup environment variables

Create `.env` inside `packages/db`:

```env
DATABASE_URL=your_database_url
```

### 4️⃣ Setup database

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:migrate
```

### 5️⃣ Run the project

```bash
pnpm dev
```

---

## 🔁 What `pnpm dev` Does

Runs all services using Turborepo:

- 🧠 DB watcher (`tsc --watch`)
- 🌐 Frontend (`next dev`)
- 🔧 Backend (Node/tsx)
- ⚡ WebSocket server

---

## 🧩 Core Architecture

```
Frontend → Backend API → Database
        ↘
         → WebSocket Server → Host Machines
```

---

## 🔌 System Flow

1. User logs in
2. Selects a host machine
3. Starts a compute session
4. Commands sent via WebSocket
5. Host executes inside Docker container
6. Output streamed back in real-time

---

## 📦 Shared DB Package

Located at:

```
packages/db
```

Usage:

```ts
import { prisma } from "@repo/db";
```

---

## 🔐 Prisma Setup

Uses a singleton pattern to prevent multiple DB connections:

```ts
export const prisma = globalThis.prisma ?? new PrismaClient();
```

---

## 📌 Scripts

### Root

```bash
pnpm dev        # Run all services
pnpm build      # Build all packages
```

### DB Package

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

---

## ⚠️ Important Notes

- Use **Node.js 20** (LTS)
- Avoid spaces in project folder path
- Always import DB from `@repo/db`
- Do **NOT** create multiple Prisma instances

---

## 🚀 Future Improvements

- 💳 Payment integration
- 📊 Resource monitoring dashboard
- 🔒 Secure sandbox execution
- 📡 Job scheduling system
- 🌍 Multi-region support

---

## 🤝 Contributing

Contributions are welcome!

```
fork → clone → branch → PR 🚀
```

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built with ❤️ by Khairaj