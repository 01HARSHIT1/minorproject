# Vercel 500 Error - Troubleshooting Guide

## Common Causes & Solutions

### 1. Missing Environment Variables (Most Common - 80%)

**Error**: `process.env.NEXT_PUBLIC_API_URL is undefined`

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy

**Note**: The backend API URL must be accessible from the internet. It cannot be `http://localhost:3001`.

### 2. Zustand Persist SSR Issues (Fixed)

✅ **Already Fixed**: 
- Store uses `skipHydration: true`
- Storage getter returns no-op on server
- Rehydration happens in client component only

### 3. API Calls During SSR

✅ **Already Fixed**: 
- All API calls are in `useEffect` hooks (client-side only)
- API client checks for `window` before accessing localStorage
- Pages use `'use client'` directive

### 4. How to Check the Real Error

**Steps to see actual error**:

1. **Vercel Dashboard** → Your Project
2. Go to **Deployments** tab
3. Click on the **latest deployment** (the one that failed)
4. Click **View Function Logs** or **Functions** tab
5. Look for the error message (it will show the real cause)

**Common error messages you might see**:
- `TypeError: Cannot read property 'xyz' of undefined`
- `ReferenceError: localStorage is not defined`
- `ECONNREFUSED` (backend not accessible)
- `process.env.NEXT_PUBLIC_API_URL is undefined`

### 5. Quick Diagnostic Steps

1. **Check Environment Variables**:
   ```
   Vercel Dashboard → Settings → Environment Variables
   ```
   Must have: `NEXT_PUBLIC_API_URL`

2. **Check Build Logs**:
   ```
   Vercel Dashboard → Deployments → Latest → Build Logs
   ```
   Look for TypeScript errors or build failures

3. **Check Function Logs**:
   ```
   Vercel Dashboard → Deployments → Latest → Function Logs
   ```
   This shows runtime errors (the actual crash)

4. **Test Locally**:
   ```bash
   cd frontend
   npm run build
   npm run start
   ```
   If it crashes locally, it will crash on Vercel

### 6. Environment Variable Setup

**Required Environment Variable**:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Where to get backend URL**:
- If backend is on Railway: `https://your-app.railway.app`
- If backend is on Render: `https://your-app.onrender.com`
- If backend is local: **Cannot use localhost on Vercel!**

**Important**: 
- Backend must be deployed and accessible
- Cannot use `localhost` or `127.0.0.1`
- Must use HTTPS URL (or HTTP if backend allows)

### 7. Still Getting 500 Error?

1. **Check Vercel Function Logs** (most important)
   - This will show the EXACT error
   - Copy the error message

2. **Verify Backend is Running**
   - Test backend URL in browser
   - Check if backend is accessible
   - Verify CORS is configured for Vercel domain

3. **Check Build Success**
   - If build fails, deployment won't work
   - Check for TypeScript errors
   - Check for missing dependencies

4. **Common Issues**:
   - Backend URL is wrong/not accessible
   - Missing environment variable
   - Backend CORS not allowing Vercel domain
   - Backend not running/deployed

### 8. Expected Behavior

✅ **What should work**:
- Frontend builds successfully
- Pages load (even if API calls fail)
- Login page works
- Dashboard shows loading state
- API calls happen client-side only

❌ **What won't work**:
- API calls if backend is not deployed
- Authentication if backend is down
- Portal connections if backend unavailable

### 9. Testing Without Backend

If you want to test the frontend without backend:

1. Set `NEXT_PUBLIC_API_URL` to a mock URL
2. Frontend will build and load
3. API calls will fail (expected)
4. You'll see error messages in console (not crashes)

### 10. Next Steps

1. ✅ Check Vercel Function Logs for actual error
2. ✅ Add `NEXT_PUBLIC_API_URL` environment variable
3. ✅ Verify backend is deployed and accessible
4. ✅ Redeploy after fixing issues
5. ✅ Test the deployment URL
