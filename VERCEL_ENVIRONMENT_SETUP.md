# Vercel Environment Variables Setup

## 🚨 Current Issue

Your app is trying to connect to `localhost:3001`, which doesn't work in production. You need to set the `NEXT_PUBLIC_API_URL` environment variable in Vercel.

---

## ✅ Quick Fix (2 Steps)

### Step 1: Deploy Your Backend First

Your backend needs to be deployed somewhere accessible. Options:

1. **Railway** (Recommended - Easy)
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect your GitHub repo
   - Set Root Directory to `backend`
   - Deploy
   - Copy the URL (e.g., `https://your-backend.railway.app`)

2. **Render** (Alternative)
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repo
   - Set Root Directory to `backend`
   - Deploy
   - Copy the URL

3. **AWS/Heroku/DigitalOcean** (Other options)

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.railway.app`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project:
   - Go to **Deployments**
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**

---

## 🔍 How to Verify

After setting the environment variable and redeploying:

1. Visit your Vercel app URL
2. Open browser console (F12)
3. Try to register/login
4. Check the Network tab - API calls should go to your backend URL, not `localhost:3001`

---

## 📝 Example

If your backend is deployed at `https://my-backend.railway.app`:

**Environment Variable:**
```
NEXT_PUBLIC_API_URL = https://my-backend.railway.app
```

**Note:** Do NOT include a trailing slash (`/`)

---

## ⚠️ Important Notes

1. **Backend must be deployed first** - You can't set the environment variable to a backend that doesn't exist yet
2. **CORS must be configured** - Your backend needs to allow requests from your Vercel domain
3. **Redeploy required** - After setting environment variables, you must redeploy for changes to take effect
4. **No trailing slash** - Don't add `/` at the end of the URL

---

## 🔧 Backend CORS Configuration

Make sure your backend allows requests from your Vercel domain. In your NestJS backend, update CORS:

```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000', // Local development
    'https://your-app.vercel.app', // Your Vercel domain
  ],
  credentials: true,
})
```

---

## 🎯 Summary

1. Deploy backend to Railway/Render/etc.
2. Copy backend URL
3. Add `NEXT_PUBLIC_API_URL` in Vercel environment variables
4. Redeploy Vercel project
5. Test the app

That's it! Your app will now connect to your deployed backend instead of localhost.
