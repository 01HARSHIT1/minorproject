# Test Backend Connection - Step by Step

## 🎯 Goal
Verify your backend is working before troubleshooting frontend connection.

---

## Step 1: Test Backend URL Directly

### Method 1: Browser Test (Easiest)

1. **Open your browser**
2. **Visit**: `https://student-gateway-backend.onrender.com`
3. **What you should see**:
   - ✅ **Empty page or "Cannot GET /"** = Backend is running! (This is normal)
   - ❌ **"This site can't be reached"** = Backend is down
   - ⏳ **Loading for 30-60 seconds** = Backend is waking up (normal for free tier)

### Method 2: Test API Endpoint

1. **Open browser**
2. **Visit**: `https://student-gateway-backend.onrender.com/auth/register`
3. **What you should see**:
   - ✅ **Error about missing fields** = Backend is working! (This is expected)
   - ❌ **Timeout or connection error** = Backend is not accessible

---

## Step 2: Test with Postman/Thunder Client (Optional)

If you have Postman or VS Code Thunder Client:

**Request:**
- **Method**: POST
- **URL**: `https://student-gateway-backend.onrender.com/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "test@test.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Response:**
- ✅ **400 Bad Request** (validation error) = Backend is working!
- ✅ **201 Created** = Registration successful (if email doesn't exist)
- ❌ **Timeout** = Backend not accessible

---

## Step 3: Check Render Logs

1. **Go to Render Dashboard**
2. **Click**: `student-gateway-backend`
3. **Click**: "Logs" tab
4. **Look for**:
   - ✅ "Nest application successfully started"
   - ✅ "Student Gateway API running on..."
   - ❌ Any error messages

---

## Step 4: Verify Vercel Environment Variable

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project `minorproject`
3. **Go to**: Settings → Environment Variables
4. **Check**:
   - ✅ `NEXT_PUBLIC_API_URL` exists
   - ✅ Value is: `https://student-gateway-backend.onrender.com`
   - ✅ All environments are selected (Production, Preview, Development)

**If missing or wrong:**
- Add/Update the variable
- **Redeploy** Vercel (Deployments → ⋯ → Redeploy)

---

## Step 5: Test Frontend Connection

1. **Open browser console** (F12)
2. **Go to**: Network tab
3. **Visit**: `https://minorproject-teal.vercel.app`
4. **Try to register**
5. **Check Network tab**:
   - ✅ Request goes to: `https://student-gateway-backend.onrender.com`
   - ❌ Request goes to: `http://localhost:3001` = Environment variable not set

---

## 🐛 Troubleshooting

### Backend Not Accessible

**Check Render:**
1. Go to Render Dashboard
2. Check service status (should be "Live")
3. Check logs for errors
4. If "Failed", check error messages

**Common Issues:**
- Service spun down (wait 30-60 seconds)
- Database connection error (check SSL config)
- Build failed (check build logs)

### Frontend Can't Connect

**Check:**
1. ✅ Backend is accessible (Step 1)
2. ✅ `NEXT_PUBLIC_API_URL` is set in Vercel
3. ✅ Vercel is redeployed after setting variable
4. ✅ Browser console shows correct API URL

**Fix:**
- Update environment variable
- Redeploy Vercel
- Clear browser cache
- Try in incognito mode

---

## ✅ Success Checklist

- [ ] Backend URL accessible in browser
- [ ] Backend API endpoint responds (even with error)
- [ ] Render logs show "successfully started"
- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Vercel is redeployed
- [ ] Browser Network tab shows correct API URL
- [ ] Frontend can connect to backend

---

## 🎯 Quick Test Commands

### Test Backend (PowerShell):
```powershell
# Test if backend is accessible
Invoke-WebRequest -Uri "https://student-gateway-backend.onrender.com" -TimeoutSec 90

# Test API endpoint
Invoke-WebRequest -Uri "https://student-gateway-backend.onrender.com/auth/register" -Method POST -Body '{"email":"test@test.com","password":"test"}' -ContentType "application/json" -TimeoutSec 90
```

### Test Frontend Connection:
1. Open browser console (F12)
2. Run: `console.log(process.env.NEXT_PUBLIC_API_URL)`
3. Should show: `https://student-gateway-backend.onrender.com`

---

Good luck! 🚀
