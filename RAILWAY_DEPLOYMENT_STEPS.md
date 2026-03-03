# Railway.app Deployment - Step by Step

## 🚀 Complete Guide to Deploy Backend on Railway

---

## Step 1: Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub

**Done!** ✅

---

## Step 2: Create New Project

1. Click **"New Project"** (top right)
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`01HARSHIT1/minorproject`**
4. Click **"Deploy Now"**

Railway will start deploying your project.

---

## Step 3: Configure Service Settings

1. Click on your project (it will be named after your repo)
2. You'll see a service being created
3. Click on the service (or click **"Settings"**)
4. Scroll down to **"Root Directory"**
5. Set it to: **`backend`**
6. Scroll to **"Start Command"**
7. Set it to: **`npm run start:prod`**
8. Click **"Save"**

---

## Step 4: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** (top right)
2. Select **"Database"**
3. Select **"Add PostgreSQL"**
4. Railway will create a PostgreSQL database
5. Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. You'll see connection details:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - Copy these values (you'll need them in Step 5)

---

## Step 5: Set Environment Variables

1. Go back to your main service (the backend service)
2. Click **"Variables"** tab
3. Click **"New Variable"** and add these one by one:

### Required Variables:

```
NODE_ENV = production
PORT = 3001
```

### Database Variables (from Step 4):

```
DATABASE_HOST = <PGHOST value from PostgreSQL>
DATABASE_PORT = <PGPORT value from PostgreSQL>
DATABASE_USER = <PGUSER value from PostgreSQL>
DATABASE_PASSWORD = <PGPASSWORD value from PostgreSQL>
DATABASE_NAME = <PGDATABASE value from PostgreSQL>
```

### Security Variables:

Generate these first:

**JWT_SECRET** (any random string):
```
JWT_SECRET = your-random-secret-key-here
```

**ENCRYPTION_KEY** (must be exactly 32 characters):
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
Copy the output and use it as:
```
ENCRYPTION_KEY = <paste-the-32-char-key>
```

### Frontend URL:

```
FRONTEND_URL = https://minorproject-teal.vercel.app
```

---

## Step 6: Link Database to Service

1. Go to your backend service
2. Click **"Variables"** tab
3. You should see the PostgreSQL variables automatically added
4. If not, click **"Reference Variable"**
5. Select your PostgreSQL service
6. Select the variables you need (PGHOST, PGPORT, etc.)
7. Railway will automatically create references

**Note:** Railway automatically links databases, so you might see variables like `${{Postgres.PGHOST}}` - that's correct!

---

## Step 7: Wait for Deployment

1. Railway will automatically redeploy when you save variables
2. Watch the **"Deployments"** tab
3. Wait for status to show **"Success"** (2-5 minutes)
4. Check **"Logs"** tab if there are any errors

---

## Step 8: Get Your Backend URL

1. Go to your backend service
2. Click **"Settings"** tab
3. Scroll to **"Domains"**
4. You'll see a domain like: `student-gateway-backend-production.up.railway.app`
5. **Copy this URL** - this is your backend URL!

Or:
1. Click **"Generate Domain"** if no domain exists
2. Copy the generated domain

---

## Step 9: Update Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click your project: **`minorproject`**
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-domain.up.railway.app` (from Step 8)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**
7. Go to **"Deployments"** tab
8. Click **"⋯"** (three dots) on latest deployment
9. Click **"Redeploy"**

---

## ✅ Done!

Your setup:
- ✅ **Frontend**: Vercel (`minorproject-teal.vercel.app`)
- ✅ **Backend**: Railway (`your-backend.up.railway.app`)
- ✅ **Database**: PostgreSQL (on Railway)
- ✅ **Connected**: Frontend → Backend

---

## 🧪 Test It

1. Visit: `https://minorproject-teal.vercel.app`
2. Try to register/login
3. Should work! ✅

---

## 🐛 Troubleshooting

### Deployment Failed:
- Check **"Logs"** tab in Railway
- Verify all environment variables are set
- Check Root Directory is `backend`

### Database Connection Error:
- Verify PostgreSQL variables are set correctly
- Check database is running (green status)
- Verify variable names match (DATABASE_HOST, not PGHOST)

### CORS Error:
- Verify `FRONTEND_URL` is set to your Vercel domain
- Redeploy backend after setting FRONTEND_URL

---

## 📝 Quick Checklist

- [ ] Signed up for Railway
- [ ] Created project from GitHub
- [ ] Set Root Directory to `backend`
- [ ] Set Start Command to `npm run start:prod`
- [ ] Added PostgreSQL database
- [ ] Set all environment variables
- [ ] Got backend URL
- [ ] Updated Vercel with `NEXT_PUBLIC_API_URL`
- [ ] Redeployed Vercel
- [ ] Tested registration/login

---

Good luck! 🚀
