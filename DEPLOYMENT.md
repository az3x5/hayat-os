# HayatOS Deployment Guide

## Architecture
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Cloudflare Pages   │────▶│   Render Backend    │────▶│  PostgreSQL (Render)│
│   (React Frontend)  │     │   (Express API)     │     │    (Database)       │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Cloudflare R2     │
│   (3GB Audio Files) │
└─────────────────────┘
```

---

## Step 1: Deploy Backend to Render

1. **Push to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/hayatos.git
   git push -u origin main
   ```

2. **Go to [render.com](https://render.com)** → New → Blueprint
3. **Connect your GitHub repo**
4. Render will auto-detect `render.yaml` and create:
   - Web Service (Express API)
   - PostgreSQL Database

5. **Add Environment Variable** in Render Dashboard:
   - `GEMINI_API_KEY` = your Gemini API key

6. **Copy your Render URL** (e.g., `https://hayatos-api.onrender.com`)

---

## Step 2: Deploy Frontend to Cloudflare Pages

1. **Go to [pages.cloudflare.com](https://pages.cloudflare.com)**
2. **Create Project** → Connect to GitHub
3. **Build Settings:**
   | Setting | Value |
   |---------|-------|
   | Framework preset | Vite |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `API_URL` | `https://hayatos-api.onrender.com` |
   | `R2_AUDIO_URL` | (set after Step 3) |

5. **Deploy!**

---

## Step 3: Set Up Cloudflare R2 for Audio

1. **Go to Cloudflare Dashboard** → R2
2. **Create Bucket:** `hayatos-audio`
3. **Enable Public Access:**
   - Settings → Public Access → Allow
   - Copy the public URL (e.g., `https://pub-xxxxx.r2.dev`)

4. **Upload Audio Files:**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   wrangler login
   
   # Upload files (from your audio folder)
   wrangler r2 object put hayatos-audio/quran/001-fatiha.mp3 --file ./audio/001-fatiha.mp3
   ```

   Or use the **R2 Dashboard** to drag-and-drop files.

5. **Update Cloudflare Pages** env variable:
   - `R2_AUDIO_URL` = `https://pub-xxxxx.r2.dev`

---

## Step 4: Update CORS (Important!)

In your Render backend, update `server/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://hayatos.pages.dev',  // Your Cloudflare Pages URL
    'https://your-custom-domain.com'
  ]
}));
```

---

## Folder Structure for R2 Audio

Recommended organization:
```
hayatos-audio/
├── quran/
│   ├── 001-fatiha/
│   │   ├── verse-001.mp3
│   │   └── verse-002.mp3
│   └── 002-baqarah/
├── adhkar/
│   ├── morning.mp3
│   └── evening.mp3
└── nasheeds/
```

---

## Quick Commands

```bash
# Local Development
npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview
```

---

## Estimated Costs (Monthly)

| Service | Free Tier | Overage |
|---------|-----------|---------|
| Cloudflare Pages | Unlimited | - |
| Cloudflare R2 (10GB) | Free | $0.015/GB |
| Render Web Service | 750 hrs/mo | $7/mo |
| Render PostgreSQL | 1GB | $7/mo |

**Total: $0 - $14/month** depending on usage
