# Task Manager API - Render Deployment Guide

## Prerequisites

1. ✅ GitHub repository with your server code
2. ✅ MongoDB Atlas database (recommended) or MongoDB on Render
3. ✅ Render account (free or paid)

## Step-by-Step Deployment on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Create New Web Service on Render

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `task-manager-api`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`

### Step 3: Set Environment Variables

In the Render dashboard, add these environment variables:

#### Required Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-min-64-chars
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-64-chars
JWT_REFRESH_EXPIRE=7d
ALLOWED_ORIGINS=https://your-frontend-domain.com
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### How to Generate Secure Secrets:
```bash
# Generate JWT secrets (run in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Configure MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account:** https://cloud.mongodb.com/
2. **Create a Cluster** (free tier available)
3. **Create Database User:**
   - Username: `taskmanager-user`
   - Password: Generate strong password
4. **Whitelist IP Addresses:**
   - Add `0.0.0.0/0` (allow from anywhere) - for Render deployment
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 5: Update CORS Origins

Make sure your `ALLOWED_ORIGINS` includes:
- Your frontend domain (e.g., Vercel, Netlify)
- Local development URLs for testing

### Step 6: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Check deployment logs** for any errors

### Step 7: Test Your Deployment

Your API will be available at: `https://your-service-name.onrender.com`

Test endpoints:
- **Health Check:** `GET /health`
- **API Info:** `GET /`
- **Swagger Docs:** `GET /api-docs`
- **API Endpoints:** `GET /api/v1/...`

## Production Optimizations Included

### Security
- ✅ Helmet for security headers
- ✅ CORS properly configured
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ XSS protection

### Performance
- ✅ Gzip compression
- ✅ MongoDB connection pooling
- ✅ Proper error handling
- ✅ Request logging with Winston

### Monitoring
- ✅ Health check endpoint (`/health`)
- ✅ Structured logging
- ✅ Error tracking
- ✅ Uptime monitoring

## Free Tier Limitations

Render Free Tier includes:
- ✅ 750 hours/month (about 31 days)
- ✅ Sleeps after 15 minutes of inactivity
- ✅ Cold starts (1-2 seconds wake up time)
- ✅ 512 MB RAM, 0.1 CPU

## Upgrading to Paid Plan

For production apps, consider upgrading:
- **Starter ($7/month):** No sleep, faster CPU
- **Standard ($25/month):** More resources, autoscaling

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Check TypeScript configuration

2. **Environment Variables:**
   - Double-check all required variables are set
   - Ensure MongoDB URI is correct
   - Verify JWT secrets are long enough

3. **Database Connection:**
   - Check MongoDB Atlas whitelist
   - Verify connection string format
   - Test connection in MongoDB Compass

4. **CORS Issues:**
   - Add your frontend domain to `ALLOWED_ORIGINS`
   - Check for trailing slashes in URLs

### Useful Commands:

```bash
# Check deployment status
curl https://your-app.onrender.com/health

# View logs (in Render dashboard)
# Go to your service → Logs tab

# Test API endpoints
curl https://your-app.onrender.com/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps After Deployment

1. **Update Frontend:** Point your frontend to the new API URL
2. **Set up Custom Domain:** (Paid plans only)
3. **Monitor Performance:** Use Render metrics
4. **Set up Alerts:** Monitor uptime and errors
5. **Database Backups:** Configure MongoDB Atlas backups

## Your API is now production-ready on Render! 🚀

**API URL:** `https://your-service-name.onrender.com`
**Documentation:** `https://your-service-name.onrender.com/api-docs`
**Health Check:** `https://your-service-name.onrender.com/health`
