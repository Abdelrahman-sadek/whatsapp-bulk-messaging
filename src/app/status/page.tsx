"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  url: string;
  lastCheck?: string;
  error?: string;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Frontend (Next.js)',
      status: 'online',
      url: 'http://localhost:3000',
    },
    {
      name: 'Convex Backend',
      status: 'checking',
      url: process.env.NEXT_PUBLIC_CONVEX_URL || 'Not configured',
    },
    {
      name: 'WhatsApp Service',
      status: 'checking',
      url: 'http://localhost:3001',
    },
  ]);

  const checkServiceStatus = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      if (service.name === 'Frontend (Next.js)') {
        return { ...service, status: 'online', lastCheck: new Date().toLocaleTimeString() };
      }

      if (service.name === 'Convex Backend') {
        // Test Convex connection by checking our health endpoint
        try {
          const response = await fetch('/api/health');
          const data = await response.json();
          
          return {
            ...service,
            status: response.ok && data.services?.convex === 'configured' ? 'online' : 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            error: response.ok && data.services?.convex === 'configured' ? undefined : 'Convex not properly configured'
          };
        } catch {
          return {
            ...service,
            status: 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            error: 'Health check failed'
          };
        }
      }

      if (service.name === 'WhatsApp Service') {
        try {
          const response = await fetch('http://localhost:3001/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          return {
            ...service,
            status: response.ok ? 'online' : 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            error: response.ok ? undefined : 'Service not responding'
          };
        } catch (error) {
          return {
            ...service,
            status: 'offline',
            lastCheck: new Date().toLocaleTimeString(),
            error: 'Service not running or not accessible'
          };
        }
      }

      return service;
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        lastCheck: new Date().toLocaleTimeString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAllServices = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    
    const updatedServices = await Promise.all(
      services.map(service => checkServiceStatus(service))
    );
    
    setServices(updatedServices);
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'checking':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
              <Button onClick={checkAllServices} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Monitor the status of all WhatsApp Bulk Messaging platform services
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(service.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm opacity-75">{service.url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'online' ? 'bg-green-100 text-green-800' :
                        service.status === 'offline' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.status.toUpperCase()}
                      </div>
                      {service.lastCheck && (
                        <p className="text-xs opacity-75 mt-1">
                          Last check: {service.lastCheck}
                        </p>
                      )}
                    </div>
                  </div>
                  {service.error && (
                    <div className="mt-2 text-sm opacity-75">
                      Error: {service.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Setup Instructions</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>1. <strong>Frontend:</strong> Should be running automatically</p>
                <p>2. <strong>Convex:</strong> Run <code>npx convex dev</code> in the root directory</p>
                <p>3. <strong>WhatsApp Service:</strong> Run <code>npm start</code> in the whatsapp-service directory</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">WhatsApp Service Setup</h3>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>If the WhatsApp service is offline:</p>
                <p>1. Navigate to the whatsapp-service directory</p>
                <p>2. Run <code>node simple-test.js</code> to test the connection</p>
                <p>3. Scan the QR code with your WhatsApp mobile app</p>
                <p>4. Once authenticated, run <code>npm start</code> for the full service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}