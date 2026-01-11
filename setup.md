# WhatsApp Bulk Messaging Platform Setup

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Convex account** (sign up at https://convex.dev)

## Quick Start

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install WhatsApp service dependencies
cd whatsapp-service
npm install
cd ..
```

### 2. Setup Convex

```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev
```

This will:
- Create a new Convex deployment
- Generate your deployment URL
- Start the development server

### 3. Configure Environment Variables

Create `.env.local` in the root directory:

```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
WHATSAPP_SERVICE_URL=http://localhost:3001
```

Create `.env` in the `whatsapp-service` directory:

```env
PORT=3001
CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Start WhatsApp Service

```bash
cd whatsapp-service
npm start
```

**Important**: When you first start the service, it will display a QR code. Scan this with your WhatsApp mobile app to authenticate.

### 5. Start Frontend

In a new terminal:

```bash
npm run dev
```

Visit http://localhost:3000 to access the application.

## Usage

### 1. Upload Contacts

- Navigate to the "Contacts" tab
- Upload a CSV file with columns: `phone_number`, `full_name`, `opt_in`
- Phone numbers must be in E.164 format (e.g., +1234567890)
- Only contacts with `opt_in=true` will be processed

### 2. Create Campaign

- Go to "Campaigns" tab
- Enter campaign name and message template
- Use `{{name}}` to personalize messages
- Configure rate limiting (recommended: 30+ seconds between messages)

### 3. Monitor Progress

- Check "Dashboard" tab for real-time campaign status
- View sent/failed message counts
- Monitor queue status and recent activity

## Important Notes

⚠️ **Compliance**: This platform is subject to WhatsApp's Terms of Service. Users are responsible for:
- Obtaining proper consent from recipients
- Complying with local messaging regulations
- Respecting WhatsApp's rate limits and policies

⚠️ **Rate Limiting**: WhatsApp may temporarily or permanently ban accounts that send too many messages too quickly. Always use conservative rate limits.

## Troubleshooting

### WhatsApp Service Issues

1. **QR Code not appearing**: Restart the service and check console output
2. **Authentication failed**: Delete `.wwebjs_auth` folder and restart
3. **Messages not sending**: Check WhatsApp service logs for errors

### Frontend Issues

1. **Convex connection errors**: Verify environment variables are correct
2. **Build errors**: Ensure all dependencies are installed

### Common Problems

- **Phone number validation**: Ensure numbers are in E.164 format
- **Opt-in compliance**: Only contacts with `opt_in=true` will be processed
- **Rate limiting**: If messages fail, increase delay between messages

## Production Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### WhatsApp Service (Docker)

```bash
# Build Docker image
docker build -t whatsapp-service ./whatsapp-service

# Run with Docker Compose
docker-compose up -d
```

### Convex

```bash
# Deploy to production
npx convex deploy --prod
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review WhatsApp Web.js documentation
3. Check Convex documentation for backend issues