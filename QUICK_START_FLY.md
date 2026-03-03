# Quick Start: Deploy Backend to Fly.io (5 Minutes)

## 🎯 Goal
Get your backend running on Fly.io in 5 minutes.

---

## Step 1: Install Fly CLI (2 minutes)

### Windows (PowerShell):
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### Or Download:
Visit: https://fly.io/docs/hands-on/install-flyctl/

After installation, restart your terminal.

---

## Step 2: Sign Up (1 minute)

```bash
fly auth signup
```

Or visit: https://fly.io/app/sign-up

---

## Step 3: Deploy (2 minutes)

```bash
cd backend
fly launch
```

**When prompted:**
- App name: `student-gateway-backend` (or press Enter for auto-generated)
- Region: Choose closest (e.g., `iad` for US East)
- PostgreSQL: **Type `y` and press Enter** (creates database automatically)
- Redis: **Type `n` and press Enter** (optional, skip for now)

Fly.io will:
- ✅ Create your app
- ✅ Create PostgreSQL database
- ✅ Set up environment variables
- ✅ Deploy your backend

---

## Step 4: Set Additional Secrets

```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Set secrets (replace values)
fly secrets set JWT_SECRET=your-random-secret-key
fly secrets set ENCRYPTION_KEY=<paste-32-char-key-from-above>
fly secrets set FRONTEND_URL=https://minorproject-teal.vercel.app
```

---

## Step 5: Get Your Backend URL

```bash
fly status
```

Your URL will be: `https://student-gateway-backend.fly.dev`

---

## Step 6: Update Vercel

1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://student-gateway-backend.fly.dev`
4. Save
5. Redeploy

---

## ✅ Done!

Your backend is now live! Test it:
- Visit: `https://student-gateway-backend.fly.dev`
- Try registration on your Vercel app

---

## 🐛 Troubleshooting

### "Command not found: fly"
- Restart your terminal after installation
- Or add Fly to PATH manually

### "Database connection failed"
- Check: `fly postgres connect -a <your-postgres-app>`
- Verify DATABASE_* secrets are set

### "App failed to start"
- Check logs: `fly logs`
- Verify all secrets are set correctly

---

## 📚 More Help

- Fly.io Docs: https://fly.io/docs
- Full guide: See `DEPLOYMENT_OPTIONS.md`

Good luck! 🚀
