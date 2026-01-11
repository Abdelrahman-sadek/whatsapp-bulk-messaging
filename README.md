# WhatsApp Bulk Messaging Platform

A compliant, scalable bulk messaging platform built with Next.js, Convex, and whatsapp-web.js.

## 🚀 **Live Demo**

- **Frontend**: Deploy to Vercel in 1 click
- **Backend**: Powered by Convex (serverless)
- **WhatsApp Integration**: Self-hosted service with Docker support

## ✨ **Features**

### 📊 **Core Functionality**
- **CSV Contact Upload** - Bulk import with E.164 validation
- **Consent Management** - Opt-in tracking with timestamps
- **Campaign Builder** - Message templates with AI variations
- **Real-time Dashboard** - Live progress tracking and analytics
- **Rate Limiting** - Configurable sending speeds to prevent bans

### 🛡️ **Compliance & Security**
- **WhatsApp Policy Compliance** - Built-in warnings and guidelines
- **Opt-in Validation** - Only send to consented contacts
- **Phone Number Validation** - E.164 format enforcement
- **Retry Logic** - Exponential backoff for failed messages
- **Error Tracking** - Comprehensive logging and monitoring

### 🔧 **Technical Features**
- **TypeScript** - Full type safety
- **Real-time Updates** - Live campaign progress
- **Responsive Design** - Works on all devices
- **Docker Support** - Easy deployment
- **Scalable Architecture** - Handles thousands of contacts

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Convex        │    │  WhatsApp       │
│   (Next.js)     │◄──►│   Backend       │◄──►│  Service        │
│   Vercel        │    │   (Serverless)  │    │  (Node.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Convex for database and real-time functions
- **WhatsApp Service**: Separate Node.js service with whatsapp-web.js
- **Queue System**: Redis-based job processing with retry logic

## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone https://github.com/yourusername/whatsapp-bulk-messaging.git
cd whatsapp-bulk-messaging
npm install
```

### 2. **Setup Convex**
```bash
npx convex dev
# Follow the prompts to create your deployment
```

### 3. **Configure Environment**
```bash
cp .env.example .env.local
# Update with your Convex deployment URL
```

### 4. **Start Development**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: WhatsApp Service
cd whatsapp-service
npm install
npm start
```

### 5. **Access Application**
- Frontend: http://localhost:3000
- Status Page: http://localhost:3000/status

## 📋 **Usage Guide**

### 1. **Upload Contacts**
Create a CSV file with these columns:
```csv
phone_number,full_name,opt_in
+1234567890,John Doe,true
+1987654321,Jane Smith,true
```

### 2. **Create Campaign**
- Enter campaign name and message template
- Use `{{name}}` for personalization
- Configure rate limiting (recommended: 30+ seconds)

### 3. **Monitor Progress**
- Real-time dashboard shows sent/failed counts
- Queue status and recent activity logs
- Campaign pause/resume controls

## 🌐 **Production Deployment**

### **Deploy to Vercel** (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/whatsapp-bulk-messaging)

Or manually:
```bash
npm i -g vercel
vercel
```

### **Deploy Convex** (Backend)
```bash
npx convex deploy --prod
```

### **Deploy WhatsApp Service**
Choose your preferred platform:

#### Railway (Recommended)
```bash
railway login
railway init
railway up
```

#### Docker
```bash
docker build -t whatsapp-service ./whatsapp-service
docker run -p 3001:3001 whatsapp-service
```

#### Heroku
```bash
heroku create your-whatsapp-service
git subtree push --prefix whatsapp-service heroku main
```

## ⚙️ **Configuration**

### **Environment Variables**

#### Frontend (.env.local)
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name
WHATSAPP_SERVICE_URL=http://localhost:3001
```

#### WhatsApp Service (.env)
```env
PORT=3001
CONVEX_URL=https://your-deployment.convex.cloud
```

### **Rate Limiting**
Configure sending speeds to comply with WhatsApp policies:
- **Conservative**: 1 message per 60 seconds
- **Moderate**: 1 message per 30 seconds  
- **Aggressive**: 1 message per 10 seconds (higher ban risk)

## 🛡️ **Compliance**

### **WhatsApp Policies**
- Only send to opted-in contacts
- Respect rate limits to avoid bans
- Include opt-out mechanisms
- Follow local messaging regulations

### **Data Protection**
- Secure contact data storage
- Opt-in consent tracking
- Data retention policies
- GDPR compliance ready

## 🔧 **Development**

### **Project Structure**
```
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   └── contexts/           # React contexts
├── convex/                 # Backend functions & schema
├── whatsapp-service/       # WhatsApp integration service
└── docs/                   # Documentation
```

### **Key Technologies**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless database & functions)
- **WhatsApp**: whatsapp-web.js, Puppeteer
- **Deployment**: Vercel, Railway, Docker

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📊 **Monitoring**

### **Built-in Monitoring**
- Real-time campaign progress
- Queue status and statistics
- Error logging and retry tracking
- System health checks

### **Recommended External Tools**
- **Vercel Analytics** - Frontend performance
- **Convex Dashboard** - Backend monitoring
- **Sentry** - Error tracking
- **Uptime Robot** - Service availability

## ⚠️ **Important Disclaimers**

### **WhatsApp Compliance**
This platform is subject to WhatsApp's Terms of Service. Users are responsible for:
- Obtaining proper consent from recipients
- Complying with local messaging regulations
- Respecting WhatsApp's rate limits and policies
- Implementing proper opt-out mechanisms

### **No Ban Guarantee**
WhatsApp may restrict or ban accounts that violate their policies. Always:
- Use conservative sending rates
- Only message opted-in contacts
- Monitor for policy updates
- Have backup communication channels

## 📞 **Support**

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@yourcompany.com

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API
- [Convex](https://convex.dev) - Backend-as-a-Service
- [Vercel](https://vercel.com) - Frontend deployment
- [Next.js](https://nextjs.org) - React framework

---

**⭐ Star this repo if it helped you build compliant WhatsApp messaging solutions!**