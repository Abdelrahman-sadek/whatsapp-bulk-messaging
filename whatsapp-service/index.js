const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.rateLimiter = {
      lastSent: 0,
      minDelay: 10000, // 10 seconds minimum between messages
    };
    this.convexUrl = process.env.CONVEX_URL;
    this.pollInterval = 5000; // Poll for jobs every 5 seconds
    this.isPolling = false;
  }

  async initialize() {
    console.log('Initializing WhatsApp client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'whatsapp-bulk-client'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        executablePath: process.env.CHROME_PATH || undefined
      }
    });

    this.client.on('qr', (qr) => {
      console.log('QR Code received, scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
      this.startJobPolling();
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
      this.isPolling = false;
    });

    await this.client.initialize();
  }

  async startJobPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Starting job polling...');

    const poll = async () => {
      if (!this.isReady || !this.isPolling) return;

      try {
        await this.processJobs();
      } catch (error) {
        console.error('Error processing jobs:', error);
      }

      if (this.isPolling) {
        setTimeout(poll, this.pollInterval);
      }
    };

    poll();
  }

  async processJobs() {
    try {
      // Get next jobs from Convex
      const response = await axios.post(`${this.convexUrl}/api/query`, {
        path: 'queue:getNextJobs',
        args: { limit: 5 }
      });

      const jobs = response.data;
      
      for (const job of jobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }

  async processJob(job) {
    try {
      console.log(`Processing job ${job._id} for ${job.phoneNumber}`);

      // Mark job as processing
      await axios.post(`${this.convexUrl}/api/mutation`, {
        path: 'queue:markJobProcessing',
        args: { jobId: job._id }
      });

      // Apply rate limiting
      await this.applyRateLimit();

      // Send message
      const result = await this.sendMessage(job.phoneNumber, job.message);

      if (result.success) {
        // Mark job as completed
        await axios.post(`${this.convexUrl}/api/mutation`, {
          path: 'queue:markJobCompleted',
          args: { 
            jobId: job._id,
            whatsappMessageId: result.messageId 
          }
        });
        console.log(`✅ Message sent to ${job.phoneNumber}`);
      } else {
        // Mark job as failed
        await axios.post(`${this.convexUrl}/api/mutation`, {
          path: 'queue:markJobFailed',
          args: { 
            jobId: job._id,
            errorMessage: result.error,
            shouldRetry: this.shouldRetry(result.error)
          }
        });
        console.log(`❌ Failed to send to ${job.phoneNumber}: ${result.error}`);
      }

    } catch (error) {
      console.error(`Error processing job ${job._id}:`, error);
      
      // Mark job as failed
      try {
        await axios.post(`${this.convexUrl}/api/mutation`, {
          path: 'queue:markJobFailed',
          args: { 
            jobId: job._id,
            errorMessage: error.message,
            shouldRetry: true
          }
        });
      } catch (updateError) {
        console.error('Failed to update job status:', updateError);
      }
    }
  }

  async sendMessage(phoneNumber, message) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp client not ready');
      }

      // Format phone number for WhatsApp
      const chatId = phoneNumber.replace('+', '') + '@c.us';
      
      // Check if number exists on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        return {
          success: false,
          error: 'Phone number not registered on WhatsApp'
        };
      }

      // Send message
      const sentMessage = await this.client.sendMessage(chatId, message);
      
      return {
        success: true,
        messageId: sentMessage.id.id
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async applyRateLimit() {
    const now = Date.now();
    const timeSinceLastSent = now - this.rateLimiter.lastSent;
    
    if (timeSinceLastSent < this.rateLimiter.minDelay) {
      const waitTime = this.rateLimiter.minDelay - timeSinceLastSent;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.rateLimiter.lastSent = Date.now();
  }

  shouldRetry(errorMessage) {
    const nonRetryableErrors = [
      'not registered',
      'blocked',
      'invalid number',
      'spam detected'
    ];
    
    return !nonRetryableErrors.some(error => 
      errorMessage.toLowerCase().includes(error)
    );
  }

  getStatus() {
    return {
      ready: this.isReady,
      polling: this.isPolling,
      lastActivity: this.rateLimiter.lastSent
    };
  }
}

// Initialize service
const whatsappService = new WhatsAppService();

// API endpoints
app.get('/status', (req, res) => {
  res.json(whatsappService.getStatus());
});

app.post('/send', async (req, res) => {
  const { phoneNumber, message } = req.body;
  
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Phone number and message required' });
  }

  const result = await whatsappService.sendMessage(phoneNumber, message);
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`WhatsApp service running on port ${PORT}`);
  whatsappService.initialize().catch(console.error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down WhatsApp service...');
  whatsappService.isPolling = false;
  
  if (whatsappService.client) {
    await whatsappService.client.destroy();
  }
  
  process.exit(0);
});