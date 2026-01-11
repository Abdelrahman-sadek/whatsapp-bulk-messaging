# Vercel Deployment Guide

## 🚀 **Deploy to Vercel in 5 Minutes**

### 1. **Prepare Repository**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: WhatsApp Bulk Messaging Platform"

# Push to GitHub
git remote add origin https://github.com/yourusername/whatsapp-bulk-messaging.git
git push -u origin main
```

### 2. **Deploy Frontend to Vercel**

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: whatsapp-bulk-messaging
# - Directory: ./
# - Override settings? No
```

#### Option B: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### 3. **Configure Environment Variables in Vercel**

In your Vercel project dashboard, add these environment variables:

```env
NEXT_PUBLIC_CONVEX_URL=https://optimistic-lark-892.convex.cloud
CONVEX_DEPLOYMENT=dev:optimistic-lark-892
```

### 4. **Deploy Convex to Production**

```bash
# Deploy Convex schema and functions to production
npx convex deploy --prod

# This will create a production deployment URL
# Update your Vercel environment variables with the new production URL
```

### 5. **WhatsApp Service Deployment Options**

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

#### Option B: Heroku
```bash
# Install Heroku CLI and login
heroku create whatsapp-service-yourname

# Set environment variables
heroku config:set CONVEX_URL=https://your-production-convex.convex.cloud

# Deploy
git subtree push --prefix whatsapp-service heroku main
```

#### Option C: Docker + Cloud Run
```bash
# Build and push Docker image
cd whatsapp-service
docker build -t whatsapp-service .
docker tag whatsapp-service gcr.io/your-project/whatsapp-service
docker push gcr.io/your-project/whatsapp-service

# Deploy to Cloud Run
gcloud run deploy whatsapp-service \
  --image gcr.io/your-project/whatsapp-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 **Production Configuration**

### Environment Variables Summary

#### Vercel (Frontend)
```env
NEXT_PUBLIC_CONVEX_URL=https://your-production-convex.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name
WHATSAPP_SERVICE_URL=https://your-whatsapp-service.railway.app
```

#### WhatsApp Service
```env
PORT=3001
CONVEX_URL=https://your-production-convex.convex.cloud
NODE_ENV=production
```

#### Convex
```bash
# Production deployment
npx convex deploy --prod
```

## 🎯 **Post-Deployment Checklist**

### ✅ **Frontend (Vercel)**
- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible at your-app.vercel.app

### ✅ **Backend (Convex)**
- [ ] Production deployment created
- [ ] Schema and functions deployed
- [ ] Environment variables updated with production URL

### ✅ **WhatsApp Service**
- [ ] Service deployed to cloud platform
- [ ] Environment variables configured
- [ ] Health endpoint accessible
- [ ] WhatsApp authentication completed

### ✅ **Integration Testing**
- [ ] Frontend can connect to Convex
- [ ] Contact upload works
- [ ] Campaign creation works
- [ ] WhatsApp service receives jobs
- [ ] End-to-end message sending works

## 🔒 **Security Considerations**

### Production Security
- [ ] Use HTTPS for all services
- [ ] Secure environment variable storage
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] WhatsApp session data encrypted

### Compliance
- [ ] Privacy policy updated
- [ ] Terms of service include WhatsApp compliance
- [ ] Opt-in consent properly tracked
- [ ] Data retention policies implemented

## 📊 **Monitoring & Maintenance**

### Recommended Monitoring
- Vercel Analytics for frontend performance
- Convex dashboard for backend monitoring
- WhatsApp service health checks
- Error tracking (Sentry recommended)

### Regular Maintenance
- Monitor WhatsApp policy updates
- Update dependencies regularly
- Review sending patterns for compliance
- Backup important data

## 🎉 **Success!**

Once deployed, your platform will be accessible at:
- **Frontend**: https://your-app.vercel.app
- **Status Page**: https://your-app.vercel.app/status
- **Convex Dashboard**: https://dashboard.convex.dev

The platform is now ready for production use with proper scalability, monitoring, and compliance features!