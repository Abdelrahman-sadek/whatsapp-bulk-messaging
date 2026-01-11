# 🚀 Deploy WhatsApp Service (Free Options)

## **Option 1: Render.com (Recommended - Free)**

### **Step 1: Create Account**
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository

### **Step 2: Deploy**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the `whatsapp-service` directory
4. Configure:
   - **Name**: `whatsapp-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### **Step 3: Environment Variables**
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
CONVEX_URL=https://optimistic-lark-892.convex.cloud
```

### **Step 4: Deploy**
Click "Create Web Service" - it will deploy automatically!

---

## **Option 2: Cyclic.sh (Free)**

### **Step 1: Deploy**
1. Go to https://app.cyclic.sh
2. Sign in with GitHub
3. Click "Deploy Now"
4. Select your repository
5. Choose `whatsapp-service` folder

### **Step 2: Environment Variables**
Add in Cyclic dashboard:
```
CONVEX_URL=https://optimistic-lark-892.convex.cloud
```

---

## **Option 3: Glitch.com (Free)**

### **Step 1: Import**
1. Go to https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Enter your repository URL
4. Select `whatsapp-service` folder

### **Step 2: Configure**
Add to `.env` file in Glitch:
```
CONVEX_URL=https://optimistic-lark-892.convex.cloud
```

---

## **Option 4: Local Testing First**

### **Test Locally**
```bash
cd whatsapp-service
npm install
npm start
```

1. **QR Code**: Scan with WhatsApp mobile app
2. **Authentication**: Complete WhatsApp Web setup
3. **Testing**: Send test messages
4. **Deploy**: Once working locally, deploy to cloud

---

## **After Deployment**

### **Update Frontend**
Update your Vercel environment variables:
```
WHATSAPP_SERVICE_URL=https://your-service.render.com
```

### **Test Integration**
1. Visit your live frontend
2. Create a test campaign
3. Check WhatsApp service logs
4. Verify message sending works

---

## **🎯 Recommended: Render.com**

**Why Render.com?**
- ✅ **Free tier**: 750 hours/month
- ✅ **Auto-deploy**: GitHub integration
- ✅ **HTTPS**: SSL certificates included
- ✅ **Logs**: Built-in monitoring
- ✅ **Environment variables**: Easy configuration

**Deploy URL**: https://render.com/deploy

---

## **🔧 Troubleshooting**

### **Common Issues**
1. **Build fails**: Check Node.js version in package.json
2. **WhatsApp auth fails**: Restart service and re-scan QR
3. **Convex connection fails**: Verify environment variables
4. **Service crashes**: Check logs for Puppeteer issues

### **Support**
- **Render**: https://render.com/docs
- **Cyclic**: https://docs.cyclic.sh
- **Glitch**: https://help.glitch.com