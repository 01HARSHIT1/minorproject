# Fix Render Build Error - Command Not Found

## Problem
Error: `npm error command sh -c nest build` - Command not found (error 127)

## Solution
The `nest` CLI is not found. We need to use `npx` or ensure devDependencies are installed.

## Fix: Update Build Command in Render

Go to your Render Web Service → Settings tab and change:

**Current Build Command:**
```
npm install && npm run build
```

**New Build Command:**
```
cd backend && npm install --include=dev && npm run build
```

OR (simpler):

```
cd backend && npm install && npx nest build
```

---

## Step-by-Step Fix

1. Go to Render Dashboard
2. Click on `student-gateway-backend` service
3. Click "Settings" tab (left sidebar)
4. Find "Build Command" field
5. Change it to: `cd backend && npm install --include=dev && npm run build`
6. Click "Save Changes"
7. Go to "Events" tab
8. Click "Manual Deploy" → "Deploy latest commit"

---

## Alternative: Update package.json build script

If the above doesn't work, we can update the build script to use `npx`.
