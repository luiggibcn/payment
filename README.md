# 🚀 project X Platform

[![GitHub stars](https://img.shields.io/github/stars/luiggibcn/payment?style=for-the-badge)](https://github.com/luiggibcn/payment/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/luiggibcn/payment?style=for-the-badge)](https://github.com/luiggibcn/payment/network)
[![GitHub issues](https://img.shields.io/github/issues/luiggibcn/payment?style=for-the-badge)](https://github.com/luiggibcn/payment/issues)

**A robust monorepo solution for building scalable payment applications.**

## 📖 Overview

This repository hosts a comprehensive payment platform, structured as a monorepo to promote modularity, reusability, and efficient development across different application parts. It is designed to manage various aspects of payment processing, from user interfaces to core business logic, all within a unified codebase. The monorepo architecture, powered by pnpm workspaces, allows for clear separation of concerns while maintaining shared components and utilities, ensuring a cohesive and scalable system.

## ✨ Features

- **Modular Monorepo Architecture:** Organized into `apps` for individual applications and `packages` for reusable modules and utilities.
- **Payment Processing Foundation:** Core structure designed to support various payment functionalities.
- **TypeScript Support:** Ensures type safety, improves code quality, and enhances developer experience across the entire codebase.
- **Scalable Development:** Facilitates the development of multiple interconnected applications and libraries from a single repository.
- **Efficient Dependency Management:** Leverages pnpm for fast, space-efficient, and deterministic dependency installation.
- **Vercel Deployment Ready:** Optimized for seamless deployment to Vercel for frontend applications.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) v22 (LTS recommended) — check with `node -v`
- [pnpm](https://pnpm.io/installation) v9 — this project uses `pnpm@9.0.0` as defined in `package.json`

> ℹ️ This project uses **pnpm workspaces**. Do **not** use `npm` or `yarn` — it will not work correctly.

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/luiggibcn/payment.git
    cd payment
    ```

2. **Enable pnpm via Corepack** *(recommended — no global install needed)*
    ```bash
    corepack enable
    ```
    Or install it globally if you prefer:
    ```bash
    npm install -g pnpm@9
    ```

3. **Install dependencies**
    ```bash
    pnpm install
    ```

4. **Environment setup**

    Each app needs its own `.env.local` file. Copy the examples and fill in your values:

    ```bash
    cp apps/web/.env.example apps/web/.env.local
    ```

    > ⚠️ Use `.env.local` for local development — it is git-ignored. Never commit real secrets.
    > ⚠️ Use `APP_NODE_ENV=local` in aapps/web/.env for local development toy avoid CORS in localhost

5. **Start development servers**

    Run both `web` and `api` simultaneously from the root:
    ```bash
    pnpm dev
    ```
    Or individually:
    ```bash
    pnpm --filter web dev   # Vue frontend → http://localhost:5173
    pnpm --filter api dev   # Nuxt API     → http://localhost:3001
    ```

## 📁 Project Structure

```
payment/
├── apps/
│   ├── web/               # Vue 3 + Vite — Frontend
│   │   ├── src/
│   │   ├── .env.example   # Copy to .env.local
│   │   └── package.json
│   └── api/               # Nuxt 3 — Backend API
│       ├── server/
│       ├── .env.example   # Copy to .env.local
│       └── package.json
├── packages/
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared constants and config
├── package.json           # Root scripts and monorepo config
├── pnpm-workspace.yaml    # Workspace definitions
└── pnpm-lock.yaml         # Lockfile — do not modify manually
```

## ⚙️ Environment Variables

### `apps/web/.env.local`

| Variable                    | Description                        | Required |
|-----------------------------|------------------------------------|----------|
| `VITE_API_URL`              | URL of the API (e.g. `http://localhost:3001`) | ✅ |
| `VITE_SUPABASE_URL`         | Supabase project URL               | ✅ |
| `VITE_SUPABASE_ANON_KEY`    | Supabase public anon key           | ✅ |

### `apps/api/.env.local`

| Variable                    | Description                        | Required |
|-----------------------------|------------------------------------|----------|
| `SUPABASE_URL`              | Supabase project URL               | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**never expose this on the frontend**) | ✅ |
| `WEB_URL`                   | Frontend URL for CORS (e.g. `http://localhost:5173`) | ✅ |

> 🔑 Get your Supabase keys from: **Supabase Dashboard → Project → Settings → API**

## 🔧 Development

### Available Scripts

Run from the **root** of the monorepo:

| Command                        | Description                                      |
|--------------------------------|--------------------------------------------------|
| `pnpm dev`                     | Starts both `web` (5173) and `api` (3001)        |
| `pnpm --filter web dev`        | Starts only the frontend                         |
| `pnpm --filter api dev`        | Starts only the API                              |
| `pnpm --filter web test run`   | Runs frontend unit tests (single run)            |
| `pnpm --filter web test`       | Runs frontend unit tests in watch mode           |
| `pnpm --filter web build`      | Production build for frontend                    |
| `pnpm --filter api build`      | Production build for API                         |

### Add a dependency to a specific app

```bash
pnpm add <package> --filter web   # add to frontend
pnpm add <package> --filter api   # add to backend
pnpm add -D <package> --filter web # add as devDependency
```

## 🧪 Testing

```bash
# Run tests for the frontend (watch mode)
pnpm --filter web test

# Single run + coverage
pnpm --filter web test run --coverage
```

## 🚀 Deployment

The project is deployed automatically via **GitHub Actions** on push to `main`:

- `apps/web` → Vercel (triggered after tests pass)
- `apps/api` → Vercel (triggered after tests pass)

For manual deploy, trigger the Vercel deploy hooks or push to `main`.

## 📄 License

This project is currently without an explicit license file.

## 🙏 Acknowledgments

- Built with [Vue 3](https://vuejs.org/) + [Nuxt 3](https://nuxt.com/)
- Monorepo managed with [pnpm](https://pnpm.io/)
- Database & Auth by [Supabase](https://supabase.com/)
- Deployed with [Vercel](https://vercel.com/)

## 📞 Support & Contact

- 🐛 Issues: [GitHub Issues](https://github.com/luiggibcn/payment/issues)

---

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [luiggibcn](https://github.com/luiggibcn)
