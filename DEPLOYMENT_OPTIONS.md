# Backend Deployment Options - Choose What Works For You

## 🎯 Quick Overview

You have **4 options** to get your backend running. Choose based on your preference:

1. **Fly.io** ⭐ (Recommended - Simplest, Free)
2. **Render** (Easy, Free tier available)
3. **Local + ngrok** (Quick test, no deployment needed)
4. **DigitalOcean App Platform** (Paid but reliable)

---

## 🚀 Option 1: Fly.io (Recommended - Easiest & Free)

### Why Fly.io?
- ✅ **Free tier** (3 shared VMs)
- ✅ **No credit card required**
- ✅ **Simple setup** (5 minutes)
- ✅ **Automatic HTTPS**
- ✅ **Built-in PostgreSQL**

### Step-by-Step:

#### Step 1: Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from: https://fly.io/docs/hands-on/install-flyctl/
```

#### Step 2: Sign Up
```bash
fly auth signup
# Or visit: https://fly.io/app/sign-up
```

#### Step 3: Create App
```bash
cd backend
fly launch
```

When prompted:
- **App name**: `student-gateway-backend` (or any name)
- **Region**: Choose closest to you
- **PostgreSQL**: **Yes** (creates database automatically)
- **Redis**: **No** (optional, can add later)

#### Step 4: Set Environment Variables
```bash
fly secrets set NODE_ENV=production
fly secrets set PORT=3001
fly secrets set JWT_SECRET=your-random-secret-key
fly secrets set ENCRYPTION_KEY=your-32-character-key
fly secrets set FRONTEND_URL=https://minorproject-teal.vercel.app
```

**Generate ENCRYPTION_KEY (32 chars):**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### Step 5: Get Database Connection
```bash
fly postgres connect -a <your-postgres-app-name>
```

Or check in Fly.io dashboard → Your PostgreSQL app → Connection details

Then set:
```bash
fly secrets set DATABASE_HOST=<from-fly>
fly secrets set DATABASE_PORT=5432
fly secrets set DATABASE_USER=<from-fly>
fly secrets set DATABASE_PASSWORD=<from-fly>
fly secrets set DATABASE_NAME=<from-fly>
```

#### Step 6: Deploy
```bash
fly deploy
```

#### Step 7: Get Your URL
```bash
fly status
# Your URL will be: https://student-gateway-backend.fly.dev
```

#### Step 8: Update Vercel
1. Go to Vercel → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL=https://student-gateway-backend.fly.dev`
3. Redeploy

**Done!** 🎉

---

## 🌐 Option 2: Render (Free Tier Available)

### Why Render?
- ✅ **Free tier** (spins down after inactivity)
- ✅ **Easy web interface** (no CLI needed)
- ✅ **Automatic HTTPS**

### Step-by-Step:

#### Step 1: Sign Up
Go to [render.com](https://render.com) and sign up with GitHub

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repo: `01HARSHIT1/minorproject`
3. Configure:
   - **Name**: `student-gateway-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

#### Step 3: Add PostgreSQL
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `student-gateway-db`
3. Click **"Create Database"**
4. Copy connection details

#### Step 4: Set Environment Variables
In Web Service → **Environment** tab:

```
NODE_ENV=production
PORT=3001
DATABASE_HOST=<from-postgres>
DATABASE_PORT=5432
DATABASE_USER=<from-postgres>
DATABASE_PASSWORD=<from-postgres>
DATABASE_NAME=<from-postgres>
JWT_SECRET=<random-string>
ENCRYPTION_KEY=<32-characters>
FRONTEND_URL=https://minorproject-teal.vercel.app
```

#### Step 5: Deploy
Click **"Create Web Service"** and wait (5-10 minutes)

#### Step 6: Get URL
Your URL: `https://student-gateway-backend.onrender.com`

#### Step 7: Update Vercel
Add `NEXT_PUBLIC_API_URL=https://student-gateway-backend.onrender.com`

**Done!** 🎉

---

## 💻 Option 3: Local Backend + ngrok (Quick Test)

### Why This?
- ✅ **No deployment needed**
- ✅ **Works immediately**
- ✅ **Good for testing**
- ⚠️ **Backend must stay running**
- ⚠️ **URL changes each time** (unless paid ngrok)

### Step-by-Step:

#### Step 1: Install ngrok
Download from: [ngrok.com/download](https://ngrok.com/download)

Or with npm:
```bash
npm install -g ngrok
```

#### Step 2: Set Up Local Backend
1. Install PostgreSQL locally (or use Docker):
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

2. Create `.env` in `backend/`:
```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=student_gateway
JWT_SECRET=local-secret-key
ENCRYPTION_KEY=dev-encryption-key-32chars!!!
FRONTEND_URL=https://minorproject-teal.vercel.app
```

3. Run backend:
```bash
cd backend
npm install
npm run start:dev
```

#### Step 3: Start ngrok
```bash
ngrok http 3001
```

You'll get a URL like: `https://abc123.ngrok.io`

#### Step 4: Update Vercel
Add: `NEXT_PUBLIC_API_URL=https://abc123.ngrok.io`

**Note**: URL changes each time you restart ngrok (unless you have paid plan)

**Done!** 🎉

---

## 🐳 Option 4: DigitalOcean App Platform

### Why This?
- ✅ **Reliable**
- ✅ **Good performance**
- ⚠️ **Paid** ($5/month minimum)

### Step-by-Step:

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Create App → Connect GitHub
3. Configure similar to Render
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## 📊 Comparison Table

| Option | Free? | Setup Time | Difficulty | Best For |
|--------|-------|------------|------------|----------|
| **Fly.io** | ✅ Yes | 5 min | ⭐ Easy | Production |
| **Render** | ✅ Yes* | 10 min | ⭐⭐ Medium | Production |
| **ngrok** | ✅ Yes | 2 min | ⭐ Easy | Testing |
| **DigitalOcean** | ❌ No | 15 min | ⭐⭐⭐ Hard | Production |

*Render free tier spins down after inactivity

---

## 🎯 My Recommendation

**For you**: Use **Fly.io** (Option 1)
- Fastest setup
- Free
- No credit card needed
- Production-ready

**For quick testing**: Use **ngrok** (Option 3)
- Works immediately
- No deployment needed
- Good for development

---

## 🆘 Need Help?

1. **Fly.io issues**: Check `fly logs` or Fly.io dashboard
2. **Render issues**: Check Render logs in dashboard
3. **ngrok issues**: Make sure backend is running on port 3001

---

## ✅ After Any Deployment

1. Test backend: Visit your backend URL
2. Update Vercel: Add `NEXT_PUBLIC_API_URL`
3. Redeploy Vercel
4. Test registration/login

Good luck! 🚀
