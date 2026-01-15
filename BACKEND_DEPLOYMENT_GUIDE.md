# Complete Backend Deployment Guide

## 🎯 Goal
Deploy your NestJS backend so your Vercel frontend can connect to it.

---

## 📋 Step-by-Step Solution

### **Option 1: Railway (Easiest - Recommended)**

#### Step 1: Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest way)

#### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your repository: `01HARSHIT1/minorproject`
4. Click **"Deploy Now"**

#### Step 3: Configure Project Settings
1. In your Railway project, click on the service
2. Go to **Settings** tab
3. Set **Root Directory** to: `backend`
4. Go to **Variables** tab

#### Step 4: Add Environment Variables
Click **"New Variable"** and add these one by one:

**Required Variables:**
```
ENCRYPTION_KEY = your-32-character-encryption-key-here
```
*Generate a random 32-character string. You can use: `openssl rand -hex 16` or any online generator*

```
JWT_SECRET = your-jwt-secret-key-here
```
*Generate a random string (at least 32 characters)*

```
FRONTEND_URL = https://your-app.vercel.app
```
*Replace with your actual Vercel URL (e.g., `https://minorproject-teal.vercel.app`)*

**Optional (for full functionality):**
```
DATABASE_URL = postgresql://user:password@host:5432/dbname
```
*Railway can auto-provision PostgreSQL - click "New" → "Database" → "Add PostgreSQL"*

```
REDIS_URL = redis://default:password@host:6379
```
*Railway can auto-provision Redis - click "New" → "Database" → "Add Redis"*

**Note:** For now, you can skip DATABASE_URL and REDIS_URL - the app will use in-memory storage for development.

#### Step 5: Deploy
1. Railway will automatically detect it's a Node.js project
2. It will run `npm install` and `npm run build`
3. Then start the app with `npm run start:prod` or `node dist/main`
4. Wait for deployment to complete

#### Step 6: Get Your Backend URL
1. Once deployed, Railway will give you a URL
2. It looks like: `https://your-backend.up.railway.app`
3. **Copy this URL** - you'll need it for Vercel

#### Step 7: Update CORS in Backend (if needed)
The backend should already allow your Vercel domain if you set `FRONTEND_URL` correctly.

---

### **Option 2: Render (Alternative)**

#### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `01HARSHIT1/minorproject`
3. Click **"Connect"**

#### Step 3: Configure Service
- **Name**: `student-gateway-backend` (or any name)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"** and add:
- `ENCRYPTION_KEY` = (32-character string)
- `JWT_SECRET` = (random string)
- `FRONTEND_URL` = (your Vercel URL)
- `NODE_ENV` = `production`

#### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment
3. Copy the URL (e.g., `https://your-backend.onrender.com`)

---

## 🔧 Step 8: Update Vercel Environment Variable

Now that your backend is deployed, update Vercel:

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find or add: `NEXT_PUBLIC_API_URL`
5. Set value to your backend URL (e.g., `https://your-backend.up.railway.app`)
6. Make sure it's enabled for **Production**, **Preview**, and **Development**
7. Click **Save**

### Redeploy Vercel
1. Go to **Deployments**
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment

---

## ✅ Verify It Works

1. Visit your Vercel app URL
2. Try to register a new account
3. Check browser console (F12) → Network tab
4. You should see requests going to your backend URL (not localhost)
5. Registration should work!

---

## 🔑 Generate Secure Keys

### Generate ENCRYPTION_KEY (32 characters)
**Option 1: Online**
- Go to: https://www.random.org/strings/
- Length: 32
- Characters: Alphanumeric
- Copy the result

**Option 2: Command Line (if you have Node.js)**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Option 3: PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Generate JWT_SECRET (any length, at least 32 recommended)
Use the same methods as above, or use a longer string.

---

## 🐛 Troubleshooting

### Error: "ENCRYPTION_KEY must be exactly 32 characters"
- Make sure your `ENCRYPTION_KEY` is exactly 32 characters
- No spaces, no quotes in the environment variable value

### Error: "Cannot connect to server"
- Check that backend is deployed and running
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure backend URL doesn't have trailing slash
- Check backend logs in Railway/Render dashboard

### Error: CORS error
- Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include `https://` in the URL
- No trailing slash

### Backend won't start
- Check Railway/Render logs
- Verify all environment variables are set
- Make sure Root Directory is set to `backend`

---

## 📝 Quick Checklist

- [ ] Backend deployed on Railway/Render
- [ ] Root Directory set to `backend`
- [ ] `ENCRYPTION_KEY` set (32 characters)
- [ ] `JWT_SECRET` set
- [ ] `FRONTEND_URL` set to your Vercel URL
- [ ] Backend URL copied
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel to backend URL
- [ ] Vercel project redeployed
- [ ] Tested registration/login

---

## 🎉 You're Done!

Once all steps are complete, your frontend will connect to your backend and everything should work!

---

## 💡 Pro Tips

1. **Keep your keys secure** - Never commit them to GitHub
2. **Use different keys for production** - Don't reuse development keys
3. **Monitor your backend** - Check logs regularly
4. **Set up database later** - For now, in-memory storage works for testing

---

## 📞 Need Help?

If you're stuck:
1. Check the backend logs in Railway/Render dashboard
2. Check Vercel function logs
3. Open browser console and check Network tab
4. Verify all environment variables are set correctly
