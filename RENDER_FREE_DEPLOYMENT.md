# Render.com Free Deployment - Complete Guide

## 🎯 100% Free - No Credit Card Required!

---

## Step 1: Sign Up (2 minutes)

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Click **"Sign up with GitHub"**
4. Authorize Render to access your GitHub
5. **Done!** ✅ (No credit card needed!)

---

## Step 2: Create Web Service (3 minutes)

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if needed
4. Find your repo: **`01HARSHIT1/minorproject`**
5. Click **"Connect"**

---

## Step 3: Configure Service (2 minutes)

Fill in these settings:

- **Name**: `student-gateway-backend`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: **`backend`** ⚠️ (Important!)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

**Don't click "Create Web Service" yet!** We need to add database first.

---

## Step 4: Add PostgreSQL Database (2 minutes)

1. Click **"New +"** again (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `student-gateway-db`
   - **Database**: `student_gateway` (or leave default)
   - **User**: Leave default
   - **Region**: Same as your web service
   - **PostgreSQL Version**: `16` (or latest)
   - **Plan**: **Free** ✅
4. Click **"Create Database"**
5. Wait for database to be created (1-2 minutes)

---

## Step 5: Get Database Connection Details (1 minute)

1. Click on your PostgreSQL database
2. Go to **"Info"** tab
3. You'll see:
   - **Internal Database URL**: `postgresql://user:password@host:5432/dbname`
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `student_gateway`
   - **User**: `student_gateway_user`
   - **Password**: (shown in Internal Database URL)

**Copy these values!** You'll need them in Step 6.

---

## Step 6: Set Environment Variables (3 minutes)

1. Go back to your **Web Service** (not the database)
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"** and add these:

### Basic Settings:
```
NODE_ENV = production
PORT = 3001
```

### Database Settings (from Step 5):
```
DATABASE_HOST = <host from database info>
DATABASE_PORT = 5432
DATABASE_USER = <user from database info>
DATABASE_PASSWORD = <password from database info>
DATABASE_NAME = <database name from database info>
```

### Security Settings:

**JWT_SECRET** (any random string):
```
JWT_SECRET = my-super-secret-jwt-key-2024
```

**ENCRYPTION_KEY** (must be exactly 32 characters):

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Copy the output (32 characters) and use:
```
ENCRYPTION_KEY = <paste-the-32-char-key>
```

### Frontend URL:
```
FRONTEND_URL = https://minorproject-teal.vercel.app
```

---

## Step 7: Link Database to Service (1 minute)

1. Still in your Web Service → **"Environment"** tab
2. Scroll down to **"Environment Groups"**
3. Click **"Link Environment Group"**
4. Select your PostgreSQL database
5. Render will automatically add database variables
6. You should see variables like `DATABASE_URL` added automatically

**Note**: You can use either:
- Individual variables (DATABASE_HOST, DATABASE_USER, etc.) - what we set above
- Or `DATABASE_URL` from the linked database - both work!

---

## Step 8: Create and Deploy (5-10 minutes)

1. Go back to your Web Service configuration
2. Scroll down and click **"Create Web Service"**
3. Render will:
   - Clone your repo
   - Install dependencies
   - Build your app
   - Deploy it
4. Watch the **"Logs"** tab for progress
5. Wait for status to show **"Live"** ✅

**This takes 5-10 minutes** - grab a coffee! ☕

---

## Step 9: Get Your Backend URL (1 minute)

1. Once deployment is complete, go to your Web Service
2. You'll see a URL at the top: `https://student-gateway-backend.onrender.com`
3. **Copy this URL** - this is your backend!

**Note**: First request might take 30-60 seconds (wake-up time). After that, it's fast!

---

## Step 10: Update Vercel (2 minutes)

1. Go to: **https://vercel.com/dashboard**
2. Click your project: **`minorproject`**
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://student-gateway-backend.onrender.com` (from Step 9)
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"⋯"** (three dots) on latest deployment
9. Click **"Redeploy"**
10. Wait for redeployment (2-3 minutes)

---

## ✅ Done!

Your setup:
- ✅ **Frontend**: Vercel (`minorproject-teal.vercel.app`)
- ✅ **Backend**: Render (`student-gateway-backend.onrender.com`)
- ✅ **Database**: PostgreSQL (on Render, free)
- ✅ **Cost**: $0/month 🎉

---

## 🧪 Test It

1. Visit: `https://minorproject-teal.vercel.app`
2. Try to register/login
3. **First request might take 30-60 seconds** (wake-up time)
4. After that, should work fast! ✅

---

## ⚠️ Important Notes

### About Spin-Down:
- Render spins down after **15 minutes of inactivity**
- First request after spin-down takes **30-60 seconds** (wake-up)
- After wake-up, it's fast until next spin-down
- **This is normal and free!** ✅

### To Keep It Awake (Optional):
- Use a service like **UptimeRobot** (free) to ping your backend every 10 minutes
- Or accept the 30-60 sec wake-up time (it's fine for most apps)

---

## 🐛 Troubleshooting

### Deployment Failed:
- Check **"Logs"** tab in Render
- Verify Root Directory is `backend`
- Verify all environment variables are set
- Check Build Command: `npm install && npm run build`

### Database Connection Error:
- Verify database is running (green status)
- Check DATABASE_* variables are correct
- Try using `DATABASE_URL` instead (from linked database)

### CORS Error:
- Verify `FRONTEND_URL` is set to your Vercel domain
- Redeploy backend after setting FRONTEND_URL

### Slow First Request:
- **This is normal!** Render spins down after inactivity
- First request takes 30-60 seconds (wake-up)
- Subsequent requests are fast

---

## 📝 Quick Checklist

- [ ] Signed up for Render (free, no credit card)
- [ ] Created Web Service
- [ ] Set Root Directory to `backend`
- [ ] Added PostgreSQL database (free)
- [ ] Set all environment variables
- [ ] Linked database to service
- [ ] Deployment completed successfully
- [ ] Got backend URL
- [ ] Updated Vercel with `NEXT_PUBLIC_API_URL`
- [ ] Redeployed Vercel
- [ ] Tested registration/login

---

## 🎉 Success!

You now have a **completely free** backend deployment! 

**Total cost: $0/month** ✅

Good luck! 🚀
