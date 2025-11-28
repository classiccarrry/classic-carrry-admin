# 🚀 Admin Panel Deployment Guide

Deploy Classic Carrry admin panel to Vercel.

## Prerequisites

- Backend API deployed on Render
- Backend URL available
- Vercel account (free)

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Admin panel ready for deployment"
git push origin main
```

### 2. Deploy on Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory:** `classic-carrry-admin`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com/api`
   - Apply to: Production, Preview, Development

6. Click **"Deploy"**

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd classic-carrry-admin
vercel

# Add environment variable
vercel env add VITE_API_URL

# Deploy to production
vercel --prod
```

### 3. Get Deployment URL

After deployment completes:
- Copy your Vercel URL
- Example: `https://classic-carrry-admin.vercel.app`

### 4. Update Backend CORS

Add your Vercel URL to backend environment variables:

1. Go to Render Dashboard
2. Select your backend service
3. Go to Environment tab
4. Update:
   ```env
   ADMIN_URL=https://your-admin.vercel.app
   ```
5. Save (Render will auto-redeploy)

### 5. Test Admin Panel

- Visit your Vercel URL
- Try to login
- Check dashboard loads
- Verify all features work

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com/api` |

**Important:** Must include `/api` at the end!

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check all imports are correct
- Verify file names match (case-sensitive)

**Error: "Out of memory"**
- Usually resolves on retry
- Or add to `package.json`:
  ```json
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
  ```

### Blank Page After Deploy

1. Check browser console for errors
2. Verify `VITE_API_URL` in Vercel environment variables
3. Check backend is accessible
4. Verify `vercel.json` routing

### API Connection Error

```
Failed to fetch
```

**Fix:**
- Verify `VITE_API_URL` is correct
- Check backend is running on Render
- Verify backend CORS includes your Vercel URL
- Test backend URL directly in browser

### CORS Errors

```
Access blocked by CORS policy
```

**Fix:**
- Verify `ADMIN_URL` is set in backend
- Check URL matches exactly (no trailing slash)
- Redeploy backend after updating
- Clear browser cache

### Images Not Loading

**Fix:**
- Verify Cloudinary configured in backend
- Check image URLs in database
- Test image URLs directly

## Post-Deployment Checklist

- [ ] Admin panel is live
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard loads with data
- [ ] Products page works
- [ ] Orders page works
- [ ] Can upload images
- [ ] All CRUD operations work
- [ ] No console errors
- [ ] Mobile responsive

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update backend `ADMIN_URL` with new domain

## Redeployment

### Automatic (Recommended)
- Push to GitHub
- Vercel auto-deploys

### Manual
```bash
vercel --prod
```

## Monitoring

### View Logs
- Vercel Dashboard → Project → Deployments → View Logs

### Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and usage

## Performance

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/

## Success! 🎉

Your admin panel is now live at: `https://your-admin.vercel.app`

Next steps:
1. Create admin user accounts
2. Start managing your store
3. Deploy user website
