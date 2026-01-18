# Fix CORS Error - Step by Step

## 🐛 Error
```
Access to XMLHttpRequest at 'https://student-gateway-backend.onrender.com/auth/register' 
from origin 'https://minorproject-gu5fsk7xd-harsshitrk0120-gmailcoms-projects.vercel.app' 
has been blocked by CORS policy
```

## ✅ Problem
Backend is not allowing requests from your Vercel domain because:
1. CORS is configured but Vercel preview URLs change with each deployment
2. Your Vercel URL is: `https://minorproject-gu5fsk7xd-harsshitrk0120-gmailcoms-projects.vercel.app`
3. But `FRONTEND_URL` might be set to a different URL

## 🔧 Solution

### Step 1: Update FRONTEND_URL in Render (Quick Fix)

1. **Go to**: Render Dashboard → `student-gateway-backend` → Environment tab
2. **Find**: `FRONTEND_URL` variable
3. **Update to**: Your current Vercel URL:
   ```
   https://minorproject-gu5fsk7xd-harsshitrk0120-gmailcoms-projects.vercel.app
   ```
4. **OR** (Better): Add multiple URLs separated by commas:
   ```
   https://minorproject-teal.vercel.app,https://minorproject-gu5fsk7xd-harsshitrk0120-gmailcoms-projects.vercel.app
   ```

### Step 2: Redeploy Backend

1. **Go to**: Render → `student-gateway-backend` → Events tab
2. **Click**: "Manual Deploy" → "Deploy latest commit"
3. **Wait**: 2-3 minutes for deployment

**Note**: I've also updated the code to allow ALL Vercel domains automatically, so this should work even without updating FRONTEND_URL.

---

## ✅ What I Fixed in Code

I updated the CORS configuration to:
- ✅ Allow all `*.vercel.app` domains automatically
- ✅ Allow all Vercel preview URLs (they change with each deployment)
- ✅ Support multiple origins via comma-separated list
- ✅ Allow proper headers and methods

---

## 🧪 Test After Fix

1. **Wait for backend redeploy** (2-3 minutes)
2. **Try registration again** on your Vercel app
3. **Should work now!** ✅

---

## 📝 Alternative: Update FRONTEND_URL

If you want to be more specific, update `FRONTEND_URL` in Render to include your current Vercel URL.

---

## 🎯 Summary

**I've fixed the code** to allow all Vercel domains. Just:
1. ✅ Redeploy backend (code fix is pushed)
2. ✅ Test registration

**OR** update `FRONTEND_URL` in Render to your current Vercel URL for more control.

Good luck! 🚀
