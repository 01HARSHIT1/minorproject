# Fix Render Build Command Error

## 🐛 Error
```
bash: line 1: cd: backend: No such file or directory
```

## ✅ Problem
The build command has `cd backend` but Root Directory is already set to `backend`, so it's trying to go into `backend/backend` which doesn't exist.

## 🔧 Fix

### Step 1: Go to Render Settings
1. Go to: https://dashboard.render.com
2. Click: `student-gateway-backend`
3. Click: "Settings" tab

### Step 2: Update Build Command
**Current (Wrong):**
```
cd backend && npm install --include=dev && npm run build
```

**Change to:**
```
npm install && npm run build
```

**OR (if you want dev dependencies):**
```
npm install --include=dev && npm run build
```

### Step 3: Save and Redeploy
1. Click "Save Changes"
2. Go to "Events" tab
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment

---

## ✅ Why This Works

- Root Directory is already set to `backend`
- So you're already in the `backend` directory
- No need to `cd backend` again
- Just run `npm install` and `npm run build` directly

---

That's it! Update the build command and redeploy.
