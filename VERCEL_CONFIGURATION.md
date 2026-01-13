# Vercel Configuration Fix - Critical!

## The Error
```
Error: Cannot read properties of undefined (reading 'fsPath')
```

This error occurs because **Vercel is building from the repository root instead of the `frontend` directory**.

## Solution: Set Root Directory in Vercel Dashboard

You **MUST** configure Vercel to use the `frontend` directory. This cannot be fixed in code - you need to set it in Vercel's dashboard.

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in and select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab (top navigation)
   - Click on **General** in the left sidebar

3. **Set Root Directory**
   - Scroll down to **Root Directory** section
   - Click **Edit** button
   - Select **"frontend"** from the dropdown
   - Click **Save**

4. **Verify Build Settings**
   - **Framework Preset**: Should show "Next.js" (auto-detected)
   - **Build Command**: Should be `npm run build` (auto-detected)
   - **Output Directory**: Should be `.next` (auto-detected)
   - **Install Command**: Should be `npm install` (auto-detected)

5. **Redeploy**
   - After saving, go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger automatic deployment

## Why This Error Happens

- Vercel detects the root `package.json` with workspaces
- It tries to auto-detect the framework from the root
- The root directory structure confuses Vercel's build system
- Setting Root Directory to `frontend` tells Vercel where your Next.js app actually is

## After Configuration

Once Root Directory is set to `frontend`:
- ✅ Vercel will only see the `frontend` directory
- ✅ Build will run `cd frontend && npm install && npm run build`
- ✅ Backend code will be completely ignored
- ✅ No more build errors

## Important Notes

- **This setting must be changed in Vercel Dashboard** - it cannot be set in code
- **Each Vercel project needs this configured separately**
- **Root Directory setting persists for all future deployments**
