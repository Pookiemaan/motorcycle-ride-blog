# Motorcycle Ride Blog

Production-ready motorcycle ride blogging platform built with Next.js 14, Prisma, PostgreSQL, Tailwind CSS, custom JWT auth, private S3/R2 storage, and secure admin workflows.

## Included pages

- `/login`
- `/dashboard`
- `/`
- `/rides/[slug]`
- `/about`
- `/gallery`
- `/rss.xml`

## Security model

- Single admin account
- No public registration
- bcrypt password hashing
- HTTP-only cookies
- JWT access + refresh tokens
- 15-minute inactivity timeout
- login rate limiting
- CSRF protection on state-changing routes
- server-side HTML sanitization
- private object storage with signed URLs

## Local setup

```bash
npm install
cp .env.local.example .env.local
docker compose up -d db
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## Storage

Use any S3-compatible backend, including Cloudflare R2.

## Deployment

### Vercel
Set env vars, connect the database, and deploy.

### VPS / Docker
Use the included `Dockerfile`, `docker-compose.yml`, and `nginx.conf`.

## Notes

Video compression and thumbnails are wired for FFmpeg on VPS deployments. For high-volume workloads, move media processing to a queue or Mux.
