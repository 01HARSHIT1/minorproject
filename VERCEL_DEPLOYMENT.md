# Vercel Deployment Guide

## Quick Setup

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - **IMPORTANT**: Vercel will try to auto-detect, but you need to configure the root directory

2. **Configure Project Settings (CRITICAL)**
   - Go to **Project Settings** → **General**
   - Find **Root Directory** section
   - Click **Edit** and select `frontend` folder
   - Click **Save**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   
   **⚠️ You MUST set Root Directory to `frontend` before deploying!**

3. **Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```
   
   **Note**: Replace with your actual backend API URL. The backend should be deployed separately (e.g., Railway, Render, AWS, etc.)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

## Important Notes

- **Backend**: The backend (NestJS) should be deployed separately. Vercel is only for the frontend.
- **API URL**: Make sure your backend API is accessible and CORS is configured to allow requests from your Vercel domain.
- **Environment Variables**: All `NEXT_PUBLIC_*` variables are exposed to the browser.

## Troubleshooting

### Build Fails
- Check that `lucide-react` is installed: `cd frontend && npm install`
- Verify all dependencies are in `package.json`

### 500 Errors
- Check Vercel function logs in the dashboard
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend API is running and accessible

### CORS Errors
- Configure CORS in your backend to allow your Vercel domain
- Add your Vercel URL to allowed origins in backend

## Backend Deployment Options

Since the backend uses Playwright and requires a database, consider:
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Render**: Free tier available
- **AWS EC2/ECS**: For production
- **DigitalOcean**: Simple VPS option

The backend cannot run on Vercel due to:
- Playwright requires full browser installation
- Long-running processes (scheduled jobs)
- Database connections
