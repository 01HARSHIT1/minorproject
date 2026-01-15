# Render.com Deployment - Detailed Step-by-Step Guide

## 🎯 Complete Guide: Deploy Your Backend to Render.com (100% Free)

---

## 📋 Prerequisites

- GitHub account (you have this: `01HARSHIT1/minorproject`)
- Your code pushed to GitHub (✅ already done)
- 15-20 minutes of time

---

## Step 1: Sign Up for Render.com (2 minutes)

### Detailed Steps:

1. **Open your browser** and go to: **https://render.com**

2. **Click the button** that says:
   - **"Get Started for Free"** (top right corner)
   - OR **"Sign Up"** button

3. **Choose sign-up method**:
   - You'll see options like:
     - "Sign up with GitHub" ⭐ (Recommended - easiest)
     - "Sign up with Email"
     - "Sign up with Google"
   
   **Click "Sign up with GitHub"**

4. **Authorize Render**:
   - GitHub will ask: "Authorize Render?"
   - Click **"Authorize Render"** or **"Authorize"**
   - This allows Render to access your GitHub repos (safe, they only read what you allow)

5. **Complete sign-up**:
   - Render might ask for your email (optional)
   - Click **"Continue"** or **"Skip"**
   - **No credit card required!** ✅

6. **You're in!** You should see the Render dashboard

---

## Step 2: Create Web Service (5 minutes)

### Detailed Steps:

1. **In Render dashboard**, look at the top right corner
   - You'll see a button: **"New +"** (green button with plus icon)
   - Click it

2. **Select service type**:
   - A dropdown menu appears
   - Click **"Web Service"**
   - (This is for your Node.js/NestJS backend)

3. **Connect GitHub** (if not already connected):
   - If you see "Connect account", click it
   - Authorize Render to access your GitHub
   - If already connected, skip this

4. **Select your repository**:
   - You'll see a list of your GitHub repositories
   - Find and click: **`01HARSHIT1/minorproject`**
   - Click **"Connect"** button

5. **Configure the service** - Fill in these fields:

   **a) Name:**
   - Field: **"Name"**
   - Enter: `student-gateway-backend`
   - (This is what your service will be called)

   **b) Region:**
   - Field: **"Region"**
   - Choose: **"Oregon (US West)"** or closest to you
   - (This is where your server will be located)

   **c) Branch:**
   - Field: **"Branch"**
   - Should auto-fill: `main`
   - If not, select `main`

   **d) Root Directory:** ⚠️ **IMPORTANT!**
   - Field: **"Root Directory"**
   - Enter: **`backend`**
   - (This tells Render where your backend code is)
   - **This is critical!** Without this, Render won't find your code

   **e) Environment:**
   - Field: **"Environment"**
   - Select: **"Node"**
   - (This tells Render you're using Node.js)

   **f) Build Command:**
   - Field: **"Build Command"**
   - Enter: **`npm install && npm run build`**
   - (This installs dependencies and builds your app)

   **g) Start Command:**
   - Field: **"Start Command"**
   - Enter: **`npm run start:prod`**
   - (This runs your production server)

6. **DON'T click "Create Web Service" yet!**
   - We need to add the database first
   - Leave this page open (or you can come back to it)

---

## Step 3: Add PostgreSQL Database (3 minutes)

### Detailed Steps:

1. **Go back to dashboard** (click "Dashboard" or Render logo)

2. **Click "New +"** again (top right)

3. **Select database type**:
   - From dropdown, click **"PostgreSQL"**

4. **Configure database**:

   **a) Name:**
   - Field: **"Name"**
   - Enter: `student-gateway-db`
   - (This is what your database will be called)

   **b) Database:**
   - Field: **"Database"**
   - Enter: `student_gateway` (or leave default)
   - (This is the database name inside PostgreSQL)

   **c) User:**
   - Field: **"User"**
   - Leave default (Render will generate one)
   - OR enter: `student_gateway_user`

   **d) Region:**
   - Field: **"Region"**
   - Choose: **Same region as your web service** (e.g., "Oregon (US West)")

   **e) PostgreSQL Version:**
   - Field: **"PostgreSQL Version"**
   - Select: **"16"** or latest available

   **f) Plan:**
   - Field: **"Plan"**
   - Select: **"Free"** ✅
   - (This is the free tier - no payment needed!)

5. **Create database**:
   - Click **"Create Database"** button
   - Wait 1-2 minutes for database to be created
   - You'll see a progress indicator

6. **Database is ready!** ✅
   - You should see your database in the dashboard
   - Status should show "Available" or green checkmark

---

## Step 4: Get Database Connection Details (2 minutes)

### Detailed Steps:

1. **Click on your PostgreSQL database** in the dashboard
   - Name: `student-gateway-db`

2. **Go to "Info" tab** (top of the page)
   - You'll see database information

3. **Find these values** (copy them somewhere safe):

   **a) Internal Database URL:**
   - Looks like: `postgresql://user:password@host:5432/dbname`
   - **Copy this entire URL** (you might need it)

   **b) Individual values:**
   - **Host**: Something like `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `student_gateway` (or what you named it)
   - **User**: `student_gateway_user` (or generated name)
   - **Password**: (shown in the Internal Database URL)

   **How to extract password from URL:**
   - URL format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
   - Example: `postgresql://student_gateway_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/student_gateway`
   - Password is between `:` and `@` → `abc123xyz`

4. **Save these values!** You'll need them in the next step

---

## Step 5: Set Environment Variables (5 minutes)

### Detailed Steps:

1. **Go back to your Web Service**:
   - Click on **"student-gateway-backend"** in dashboard
   - (Not the database, the web service)

2. **Go to "Environment" tab**:
   - Click **"Environment"** tab at the top
   - You'll see a list of environment variables (might be empty)

3. **Add environment variables one by one**:

   Click **"Add Environment Variable"** button for each:

   **a) NODE_ENV:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Save"**

   **b) PORT:**
   - **Key**: `PORT`
   - **Value**: `3001`
   - Click **"Save"**

   **c) DATABASE_HOST:**
   - **Key**: `DATABASE_HOST`
   - **Value**: `<paste host from Step 4>` (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
   - Click **"Save"**

   **d) DATABASE_PORT:**
   - **Key**: `DATABASE_PORT`
   - **Value**: `5432`
   - Click **"Save"**

   **e) DATABASE_USER:**
   - **Key**: `DATABASE_USER`
   - **Value**: `<paste user from Step 4>` (e.g., `student_gateway_user`)
   - Click **"Save"**

   **f) DATABASE_PASSWORD:**
   - **Key**: `DATABASE_PASSWORD`
   - **Value**: `<paste password from Step 4>` (extracted from URL)
   - Click **"Save"**

   **g) DATABASE_NAME:**
   - **Key**: `DATABASE_NAME`
   - **Value**: `<paste database name from Step 4>` (e.g., `student_gateway`)
   - Click **"Save"**

   **h) JWT_SECRET:**
   - **Key**: `JWT_SECRET`
   - **Value**: `my-super-secret-jwt-key-2024` (or any random string)
   - Click **"Save"**

   **i) ENCRYPTION_KEY:**
   - **Key**: `ENCRYPTION_KEY`
   - **Value**: Must be exactly 32 characters!
   
   **To generate:**
   - Open your terminal/PowerShell
   - Run: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
   - Copy the output (32 characters)
   - Paste as value
   - Click **"Save"**

   **j) FRONTEND_URL:**
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://minorproject-teal.vercel.app`
   - (Your Vercel frontend URL)
   - Click **"Save"**

4. **Verify all variables are added**:
   - You should see all 10 variables in the list
   - Check each one is correct

---

## Step 6: Link Database to Service (1 minute)

### Detailed Steps:

1. **Still in your Web Service** → **"Environment" tab**

2. **Scroll down** to find **"Environment Groups"** section

3. **Link the database**:
   - Click **"Link Environment Group"** button
   - A popup appears
   - Select: **"student-gateway-db"** (your PostgreSQL database)
   - Click **"Link"**

4. **Verify linking**:
   - You should see database variables automatically added
   - Variables like `DATABASE_URL` might appear
   - This is good! ✅

**Note**: You can use either:
- Individual variables (DATABASE_HOST, DATABASE_USER, etc.) - what we set above
- OR `DATABASE_URL` from linked database - both work!

---

## Step 7: Create and Deploy (5-10 minutes)

### Detailed Steps:

1. **Go back to your Web Service configuration**:
   - If you closed it, click on "student-gateway-backend" in dashboard
   - Go to **"Settings"** tab

2. **Review your settings**:
   - Make sure:
     - Root Directory: `backend` ✅
     - Build Command: `npm install && npm run build` ✅
     - Start Command: `npm run start:prod` ✅
     - All environment variables are set ✅

3. **Create the service**:
   - Scroll to bottom
   - Click **"Create Web Service"** button (big green button)

4. **Watch the deployment**:
   - Render will start deploying
   - Go to **"Logs"** tab to see progress
   - You'll see:
     - "Cloning repository..."
     - "Installing dependencies..."
     - "Building application..."
     - "Starting service..."

5. **Wait for completion**:
   - This takes **5-10 minutes**
   - Status will show:
     - "Building..." (yellow)
     - "Deploying..." (yellow)
     - "Live" ✅ (green) - **Success!**

6. **If there are errors**:
   - Check the **"Logs"** tab
   - Look for error messages
   - Common issues:
     - Wrong Root Directory → Should be `backend`
     - Missing environment variables → Check Step 5
     - Build errors → Check logs for specific error

---

## Step 8: Get Your Backend URL (1 minute)

### Detailed Steps:

1. **Once deployment is "Live"** ✅:
   - Go to your Web Service dashboard
   - Look at the top of the page

2. **Find the URL**:
   - You'll see a section showing your service URL
   - Format: `https://student-gateway-backend.onrender.com`
   - (Your actual URL might be slightly different)

3. **Copy the URL**:
   - Click the URL or copy button
   - **Save this URL!** You'll need it for Vercel

4. **Test the URL** (optional):
   - Open the URL in a new tab
   - You might see an error (that's OK - means it's running)
   - Or you might see nothing (also OK)

**Note**: First request might take 30-60 seconds (wake-up time). This is normal for free tier!

---

## Step 9: Update Vercel Environment Variable (3 minutes)

### Detailed Steps:

1. **Go to Vercel Dashboard**:
   - Open: **https://vercel.com/dashboard**
   - Login if needed

2. **Select your project**:
   - Find and click: **`minorproject`**
   - (Your frontend project)

3. **Go to Settings**:
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

4. **Add new variable**:
   - Click **"Add New"** button (top right)

5. **Fill in the form**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - (Must be exactly this - case sensitive!)
   
   - **Value**: `https://student-gateway-backend.onrender.com`
   - (Paste your Render backend URL from Step 8)
   - (Replace with your actual URL if different)

   - **Environment**: Select all three checkboxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - (This makes it available everywhere)

6. **Save**:
   - Click **"Save"** button
   - Variable is now added! ✅

---

## Step 10: Redeploy Vercel (2-3 minutes)

### Detailed Steps:

1. **Go to Deployments**:
   - Still in Vercel dashboard
   - Click **"Deployments"** tab (top menu)

2. **Find latest deployment**:
   - You'll see a list of deployments
   - Find the most recent one (top of list)

3. **Redeploy**:
   - Click **"⋯"** (three dots) on the right side of the deployment
   - A menu appears
   - Click **"Redeploy"**

4. **Confirm**:
   - A popup might ask "Redeploy this deployment?"
   - Click **"Redeploy"** or **"Confirm"**

5. **Wait for redeployment**:
   - Status will show "Building..." then "Ready"
   - Takes 2-3 minutes
   - You'll see progress in real-time

6. **Deployment complete!** ✅
   - Status shows "Ready" (green)
   - Your frontend now has the backend URL!

---

## ✅ Done! Test Your Setup

### Test Steps:

1. **Visit your frontend**:
   - Go to: `https://minorproject-teal.vercel.app`
   - (Your Vercel URL)

2. **Try to register**:
   - Fill in registration form
   - Click "Create Account"
   - **First request might take 30-60 seconds** (Render wake-up)
   - After that, should work! ✅

3. **Check browser console** (optional):
   - Press F12
   - Go to "Network" tab
   - Try registration again
   - You should see API calls going to: `https://student-gateway-backend.onrender.com`
   - ✅ This means frontend is connected to backend!

4. **If it works**: 🎉 **Success!**

---

## 🐛 Troubleshooting

### Problem: Deployment Failed

**Check:**
- ✅ Root Directory is `backend` (not empty)
- ✅ Build Command: `npm install && npm run build`
- ✅ Start Command: `npm run start:prod`
- ✅ All environment variables are set
- ✅ Check "Logs" tab for specific error

**Fix:**
- Correct the issue
- Click "Manual Deploy" → "Deploy latest commit"

---

### Problem: Database Connection Error

**Check:**
- ✅ Database is running (green status in Render)
- ✅ DATABASE_* variables are correct
- ✅ Password is correct (extracted from URL)

**Fix:**
- Verify database connection details
- Update environment variables
- Redeploy service

---

### Problem: CORS Error

**Check:**
- ✅ `FRONTEND_URL` is set to your Vercel domain
- ✅ Value is exactly: `https://minorproject-teal.vercel.app`

**Fix:**
- Update `FRONTEND_URL` environment variable
- Redeploy backend

---

### Problem: Slow First Request

**This is NORMAL!** ✅
- Render free tier spins down after 15 min inactivity
- First request takes 30-60 seconds (wake-up)
- Subsequent requests are fast
- **This is expected behavior for free tier**

**To keep it awake (optional):**
- Use UptimeRobot (free) to ping your backend every 10 minutes
- Or accept the wake-up time (it's fine!)

---

## 📝 Quick Checklist

Before testing, verify:

- [ ] Signed up for Render (free, no credit card)
- [ ] Created Web Service
- [ ] Set Root Directory to `backend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm run start:prod`
- [ ] Created PostgreSQL database (free)
- [ ] Got database connection details
- [ ] Set all 10 environment variables
- [ ] Linked database to service
- [ ] Deployment completed successfully ("Live" status)
- [ ] Got backend URL from Render
- [ ] Added `NEXT_PUBLIC_API_URL` to Vercel
- [ ] Redeployed Vercel
- [ ] Tested registration/login

---

## 🎉 Success!

If all steps are complete, you now have:

- ✅ **Frontend**: Vercel (free)
- ✅ **Backend**: Render (free)
- ✅ **Database**: PostgreSQL on Render (free)
- ✅ **Total Cost**: **$0/month** 🎉

Your app is live and working! 🚀

---

## 💡 Pro Tips

1. **Monitor your service**:
   - Check Render dashboard regularly
   - Watch "Logs" tab for any issues

2. **Keep it awake** (optional):
   - Use UptimeRobot.com (free)
   - Set it to ping your backend every 10 minutes
   - Prevents spin-down

3. **Check usage**:
   - Render free tier: 750 hours/month
   - You should be well within limits

4. **Backup**:
   - Your code is on GitHub (backed up)
   - Database backups: Render handles this automatically

---

Good luck! If you get stuck, check the troubleshooting section or ask for help! 🚀
