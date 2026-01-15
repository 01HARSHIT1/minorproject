# Simple Deployment Steps - Exactly What You Need

## ✅ Yes, You're Right!

**Step 1:** Deploy backend to Fly.io  
**Step 2:** Add Fly.io URL as environment variable in Vercel

That's it! 🎉

---

## 📋 Step-by-Step (Super Simple)

### Step 1: Deploy Backend to Fly.io

1. **Install Fly CLI** (one time):
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```
   (Restart terminal after installation)

2. **Sign up**:
   ```bash
   fly auth signup
   ```

3. **Deploy**:
   ```bash
   cd backend
   fly launch
   ```
   
   When prompted:
   - App name: `student-gateway-backend` (or press Enter)
   - Region: Choose closest to you
   - PostgreSQL: **Type `y`** (creates database automatically)
   - Redis: **Type `n`** (skip for now)

4. **Set secrets**:
   ```bash
   # Generate encryption key
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   
   # Set secrets (replace with your values)
   fly secrets set JWT_SECRET=your-random-secret-key
   fly secrets set ENCRYPTION_KEY=<paste-32-char-key-from-above>
   fly secrets set FRONTEND_URL=https://minorproject-teal.vercel.app
   ```

5. **Get your backend URL**:
   ```bash
   fly status
   ```
   Your URL will be: `https://student-gateway-backend.fly.dev` (or similar)

---

### Step 2: Add Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `minorproject`

2. **Go to Settings**
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

3. **Add New Variable**
   - Click **"Add New"** button
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://student-gateway-backend.fly.dev` (your Fly.io URL from Step 1)
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

4. **Redeploy**
   - Go to **"Deployments"** tab
   - Click **"⋯"** (three dots) on latest deployment
   - Click **"Redeploy"**
   - Wait for deployment to complete

---

## ✅ That's It!

Now your setup is:
- ✅ **Frontend on Vercel**: `https://minorproject-teal.vercel.app`
- ✅ **Backend on Fly.io**: `https://student-gateway-backend.fly.dev`
- ✅ **Connected**: Frontend calls backend via `NEXT_PUBLIC_API_URL`

---

## 🧪 Test It

1. Visit your Vercel app: `https://minorproject-teal.vercel.app`
2. Try to register/login
3. Check browser console (F12) - should see API calls going to your Fly.io URL
4. Should work! ✅

---

## 📝 Quick Reference

### Fly.io Commands:
```bash
cd backend
fly launch          # First time deployment
fly status          # Check your URL
fly logs            # View logs
fly secrets set KEY=value  # Set environment variables
```

### Vercel:
- Dashboard: https://vercel.com/dashboard
- Environment Variables: Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = Your Fly.io URL

---

## 🐛 Troubleshooting

### "Cannot connect to server" error:
- ✅ Check Fly.io backend is running: `fly status`
- ✅ Check `NEXT_PUBLIC_API_URL` is set in Vercel
- ✅ Check you redeployed Vercel after adding variable

### "CORS error":
- ✅ Check `FRONTEND_URL` is set in Fly.io: `fly secrets set FRONTEND_URL=https://minorproject-teal.vercel.app`
- ✅ Redeploy Fly.io: `fly deploy`

---

## 🎯 Summary

**Exactly what you said:**
1. ✅ Upload backend to Fly.io
2. ✅ Provide Fly.io URL as environment variable in Vercel

**That's the complete process!** 🚀
