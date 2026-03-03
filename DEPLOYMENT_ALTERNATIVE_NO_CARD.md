# Alternative: Deploy Without Credit Card

## ⚠️ Fly.io Requires Payment Method

Fly.io requires a credit card even for the free tier (they won't charge unless you exceed limits).

---

## ✅ Option 1: Render.com (No Credit Card Needed)

### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repo: `01HARSHIT1/minorproject`
3. Configure:
   - **Name**: `student-gateway-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### Step 3: Add PostgreSQL
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `student-gateway-db`
3. Click **"Create Database"**
4. Copy connection details

### Step 4: Set Environment Variables
In Web Service → **Environment** tab:

```
NODE_ENV=production
PORT=3001
DATABASE_HOST=<from-postgres>
DATABASE_PORT=5432
DATABASE_USER=<from-postgres>
DATABASE_PASSWORD=<from-postgres>
DATABASE_NAME=<from-postgres>
JWT_SECRET=<generate-random-string>
ENCRYPTION_KEY=<32-characters>
FRONTEND_URL=https://minorproject-teal.vercel.app
```

**Generate ENCRYPTION_KEY:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 5: Deploy
Click **"Create Web Service"** and wait (5-10 minutes)

### Step 6: Get URL
Your URL: `https://student-gateway-backend.onrender.com`

### Step 7: Update Vercel
Add: `NEXT_PUBLIC_API_URL=https://student-gateway-backend.onrender.com`

---

## ✅ Option 2: Railway.app (No Credit Card Needed)

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)

### Step 2: Create Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select: `01HARSHIT1/minorproject`

### Step 3: Configure
1. Click on your project
2. Click **"New"** → **"Service"**
3. Select your repo
4. In settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm run start:prod`

### Step 4: Add PostgreSQL
1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Copy connection details

### Step 5: Set Environment Variables
In your service → **Variables** tab:

```
NODE_ENV=production
PORT=3001
DATABASE_HOST=<from-postgres>
DATABASE_PORT=5432
DATABASE_USER=<from-postgres>
DATABASE_PASSWORD=<from-postgres>
DATABASE_NAME=railway
JWT_SECRET=<random-string>
ENCRYPTION_KEY=<32-characters>
FRONTEND_URL=https://minorproject-teal.vercel.app
```

### Step 6: Deploy
Railway auto-deploys. Wait for it to complete.

### Step 7: Get URL
Your URL will be shown in Railway dashboard.

### Step 8: Update Vercel
Add: `NEXT_PUBLIC_API_URL=<your-railway-url>`

---

## 📊 Comparison

| Platform | Credit Card? | Free Tier | Setup Time |
|----------|-------------|-----------|------------|
| **Fly.io** | ✅ Required | ✅ Yes | 5 min |
| **Render** | ❌ Not needed | ✅ Yes | 10 min |
| **Railway** | ❌ Not needed | ✅ Yes | 10 min |

---

## 🎯 My Recommendation

**Use Render.com** - It's the easiest without a credit card:
- ✅ No credit card needed
- ✅ Free tier available
- ✅ Easy web interface
- ✅ Automatic PostgreSQL setup

---

## 🚀 Quick Start with Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create Web Service → Connect repo
4. Set Root Directory: `backend`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy!

**That's it!** 🎉
