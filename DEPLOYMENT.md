# Deployment Guide

Stack:
- **Frontend** → Vercel
- **Backend** → Render
- **PostgreSQL** → Neon
- **Redis** → Upstash

---

## 1. PostgreSQL on Neon

1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new **Project** (e.g. `email-scheduler`).
3. In the project dashboard, click **Connection Details**.
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this as `DATABASE_URL` — you will need it in both Render and your local `.env`.

---

## 2. Redis on Upstash

1. Go to [upstash.com](https://upstash.com) and create a free account.
2. Click **Create Database** → choose **Redis** → region closest to your Render region.
3. After creation, go to **Details** tab.
4. Copy the **Redis URL** — it looks like:
   ```
   rediss://default:password@us1-xxx.upstash.io:6380
   ```
5. Save this as `REDIS_URL`.

> Upstash Redis uses TLS (`rediss://`). BullMQ and IORedis support this natively.

---

## 3. Ethereal Email Credentials

Ethereal is a fake SMTP service — emails are never actually delivered but you can preview them.

1. Go to [ethereal.email](https://ethereal.email).
2. Click **Create Ethereal Account**.
3. Copy the generated **Username** and **Password**.
4. Save as `ETHEREAL_USER` and `ETHEREAL_PASS`.

---

## 4. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services → Credentials**.
4. Click **Create Credentials → OAuth 2.0 Client IDs**.
5. Application type: **Web application**.
6. Add Authorized redirect URIs:
   - Local: `http://localhost:4000/api/auth/google/callback`
   - Production: `https://your-backend.onrender.com/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret**.
8. Save as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 5. Deploy Backend to Render

### 5a. Push your code to GitHub

```bash
git add .
git commit -m "feat: initial email scheduler"
git push origin main
```

### 5b. Create Render Web Service

1. Go to [render.com](https://render.com) and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Name**: `email-scheduler-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Instance Type**: Free

### 5c. Set Environment Variables in Render

In the Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | your Neon connection string |
| `REDIS_URL` | your Upstash Redis URL |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://your-backend.onrender.com/api/auth/google/callback` |
| `ETHEREAL_USER` | from ethereal.email |
| `ETHEREAL_PASS` | from ethereal.email |
| `SESSION_SECRET` | any random 32+ char string |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `MAX_EMAILS_PER_HOUR` | `10` |
| `WORKER_CONCURRENCY` | `2` |
| `EMAIL_DELAY_MS` | `2000` |
| `PORT` | `4000` |

### 5d. Deploy

Click **Deploy**. Render will build and start the service.

After deploy, test the health endpoint:
```
GET https://your-backend.onrender.com/api/health
```
Expected response:
```json
{ "status": "healthy", "checks": { "postgres": "ok", "redis": "ok" } }
```

---

## 6. Deploy Frontend to Vercel

### 6a. Install Vercel CLI (optional)

```bash
npm install -g vercel
```

### 6b. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import your GitHub repo.
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 6c. Set Environment Variables in Vercel

In **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

### 6d. Deploy

Click **Deploy**. Vercel builds and publishes automatically.

Your app will be live at `https://your-app.vercel.app`.

### 6e. Update Google OAuth Redirect URI

Go back to Google Cloud Console → Credentials → your OAuth client.
Add the Vercel domain to **Authorized JavaScript origins**:
```
https://your-app.vercel.app
```

---

## 7. Post-Deploy Checklist

- [ ] `GET /api/health` returns `{ status: "healthy" }`
- [ ] Google OAuth login redirects correctly
- [ ] Session cookie is set after login
- [ ] Compose modal schedules emails (check BullMQ job in Redis)
- [ ] Scheduled tab shows emails with status `scheduled`
- [ ] After delay, status changes to `sent`
- [ ] Ethereal preview URL appears in Render logs

---

## 8. Upstash TLS Note

Upstash Redis requires TLS. Make sure your `REDIS_URL` starts with `rediss://` (double `s`).
IORedis handles TLS automatically when the URL scheme is `rediss://`.

If you see Redis connection errors on Render, add this to `backend/src/config/redis.ts`:

```ts
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
});
```

---

## 9. Render Free Tier Note

Render free tier **spins down after 15 minutes of inactivity**. The first request after sleep takes ~30s to cold start. To avoid this in production, upgrade to the Starter plan ($7/month) or use a cron ping service like [cron-job.org](https://cron-job.org) to ping `/api/health` every 10 minutes.
