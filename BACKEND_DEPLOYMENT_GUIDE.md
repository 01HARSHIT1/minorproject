# Backend Deployment Guide - Step by Step

## 🎯 Goal
Deploy your NestJS backend so your Vercel frontend can connect to it.

---

## 📋 Prerequisites

- GitHub repository with your code (✅ You have this)
- A deployment platform account (Railway or Render - both free)

---

## 🚀 Option 1: Deploy to Railway (Recommended - Easiest)

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest way)

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: `01HARSHIT1/minorproject`
4. Click **"Deploy Now"**

### Step 3: Configure Project Settings

1. Railway will auto-detect your project
2. Click on your project → **Settings**
3. Set **Root Directory** to: `backend`
4. Set **Start Command** to: `npm run start:prod`

### Step 4: Add PostgreSQL Database (Required)

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database
4. Copy the connection details (you'll need them in Step 5)

### Step 5: Add Redis (Optional but Recommended)

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Copy the connection details

### Step 6: Set Environment Variables

1. In your Railway project, go to **Variables** tab
2. Add these environment variables:

#### Required Variables:

```
NODE_ENV=production
PORT=3001
```

#### Database Variables (from Step 4):

```
DATABASE_HOST=<from Railway PostgreSQL>
DATABASE_PORT=5432
DATABASE_USER=<from Railway PostgreSQL>
DATABASE_PASSWORD=<from Railway PostgreSQL>
DATABASE_NAME=railway
```

#### Redis Variables (if you added Redis):

```
REDIS_HOST=<from Railway Redis>
REDIS_PORT=<from Railway Redis>
```

#### Security Variables:

```
ENCRYPTION_KEY=<generate a random 32-character string>
JWT_SECRET=<generate a random string>
```

**To generate ENCRYPTION_KEY:**
- Use: `openssl rand -hex 16` (gives 32 characters)
- Or use: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
- Or use any online random string generator (32 characters exactly)

**To generate JWT_SECRET:**
- Use any random string generator
- Example: `my-super-secret-jwt-key-2024`

#### Frontend URL (Important!):

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Replace `your-vercel-app` with your actual Vercel domain.

#### Optional (for AI features):

```
OPENAI_API_KEY=<your OpenAI API key if you have one>
```

### Step 7: Deploy

1. Railway will automatically deploy when you save environment variables
2. Wait for deployment to complete (2-5 minutes)
3. Check the **Deployments** tab for logs

### Step 8: Get Your Backend URL

1. Once deployed, Railway will give you a URL
2. It looks like: `https://your-backend.up.railway.app`
3. **Copy this URL** - you'll need it for Vercel!

### Step 9: Test Your Backend

1. Visit: `https://your-backend.up.railway.app` (should show nothing or error - that's OK)
2. Test API: `https://your-backend.up.railway.app/auth/register` (should return validation error - that's OK, means it's working!)

---

## 🚀 Option 2: Deploy to Render (Alternative)

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `01HARSHIT1/minorproject`
3. Click **"Connect"**

### Step 3: Configure Service

1. **Name**: `student-gateway-backend`
2. **Root Directory**: `backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run start:prod`

### Step 4: Add PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name it: `student-gateway-db`
3. Click **"Create Database"**
4. Copy the connection details

### Step 5: Add Redis (Optional)

1. Click **"New +"** → **"Redis"**
2. Name it: `student-gateway-redis`
3. Click **"Create Redis"**
4. Copy the connection details

### Step 6: Set Environment Variables

In your Web Service → **Environment** tab, add the same variables as Railway (see Step 6 above).

### Step 7: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend URL will be: `https://student-gateway-backend.onrender.com`

---

## 🔗 Connect Frontend to Backend

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add or update:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.up.railway.app`)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### Step 2: Update Backend CORS

1. In Railway/Render, update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
2. Redeploy your backend

### Step 3: Redeploy Vercel

1. Go to Vercel → **Deployments**
2. Click **⋯** (three dots) → **Redeploy**

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend is running (check Railway/Render logs)
- [ ] Backend URL is accessible (visit in browser - may show error, that's OK)
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] `FRONTEND_URL` is set in backend (your Vercel domain)
- [ ] Database is connected (check backend logs)
- [ ] Frontend can connect (test registration/login)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to server"

**Check:**
1. Is backend deployed? (Check Railway/Render dashboard)
2. Is `NEXT_PUBLIC_API_URL` set correctly in Vercel?
3. Is backend URL correct? (Test in browser)

### Error: "CORS error"

**Fix:**
1. Update `FRONTEND_URL` in backend to your Vercel domain
2. Redeploy backend

### Error: "Database connection failed"

**Fix:**
1. Check database credentials in environment variables
2. Ensure database is running (Railway/Render dashboard)
3. Check database connection string format

### Error: "ENCRYPTION_KEY must be exactly 32 characters"

**Fix:**
1. Generate a new 32-character key
2. Update `ENCRYPTION_KEY` environment variable
3. Redeploy

---

## 📝 Quick Reference

### Backend Environment Variables Needed:

```
NODE_ENV=production
PORT=3001
DATABASE_HOST=<from database>
DATABASE_PORT=5432
DATABASE_USER=<from database>
DATABASE_PASSWORD=<from database>
DATABASE_NAME=<from database>
REDIS_HOST=<from redis>
REDIS_PORT=<from redis>
ENCRYPTION_KEY=<32 characters>
JWT_SECRET=<any string>
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend Environment Variable (Vercel):

```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

---

## 🎉 Success!

Once both are deployed and connected:
1. Your frontend on Vercel will connect to your backend
2. Registration and login will work
3. All API calls will go through your deployed backend

---

## 💡 Pro Tips

1. **Use Railway** - It's easier and faster than Render
2. **Start with minimal setup** - You can add Redis later if needed
3. **Test locally first** - Make sure backend works with `npm run start:dev`
4. **Check logs** - Railway/Render logs show what's wrong
5. **Database migrations** - TypeORM will auto-create tables on first run

---

## 🆘 Still Having Issues?

1. Check backend logs in Railway/Render
2. Check Vercel function logs
3. Test backend URL directly: `https://your-backend.up.railway.app/auth/register`
4. Verify all environment variables are set correctly

Good luck! 🚀
