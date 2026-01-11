"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ContactUpload } from '@/components/ContactUpload';
import { CampaignBuilder } from '@/components/CampaignBuilder';
import { CampaignDashboard } from '@/components/CampaignDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useUser } from '@/contexts/UserContext';
import { Users, Send, BarChart3, AlertTriangle, Settings, Loader2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('contacts');
  const { userId, user, isLoading, error } = useUser();

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Initializing application..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-medium text-red-900 mb-2">Initialization Error</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Setting up user account..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Bulk Messaging</h1>
              <p className="text-sm text-gray-600">
                Compliant bulk messaging platform • Welcome, {user?.name || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/status"
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>System Status</span>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>Ensure compliance with WhatsApp policies</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'contacts' && <ContactUpload userId={userId} />}
        {activeTab === 'campaigns' && (
          <CampaignBuilder 
            userId={userId} 
            onCampaignCreated={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'dashboard' && <CampaignDashboard userId={userId} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>⚠️ This platform is subject to WhatsApp's Terms of Service and messaging policies.</p>
            <p className="mt-1">Users are responsible for compliance with local regulations and obtaining proper consent.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}