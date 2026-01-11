"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Eye, Settings } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CampaignBuilderProps {
  userId: Id<"users">;
  onCampaignCreated?: (campaignId: string) => void;
}

export function CampaignBuilder({ userId, onCampaignCreated }: CampaignBuilderProps) {
  const [campaignName, setCampaignName] = useState('');
  const [baseMessage, setBaseMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [rateLimit, setRateLimit] = useState({
    messagesPerMinute: 2,
    delayBetweenMessages: 30
  });
  const [isCreating, setIsCreating] = useState(false);

  const createCampaign = useMutation(api.campaigns.createCampaign);
  const contacts = useQuery(api.contacts.getContactsWithOptIn, { userId: userId });

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !baseMessage.trim()) {
      alert('Please fill in campaign name and message');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createCampaign({
        userId: userId,
        name: campaignName.trim(),
        baseMessage: baseMessage.trim(),
        rateLimit
      });

      alert(`Campaign created successfully! ${result.totalContacts} contacts will receive messages.`);
      
      // Reset form
      setCampaignName('');
      setBaseMessage('');
      setShowPreview(false);
      
      if (onCampaignCreated) {
        onCampaignCreated(result.campaignId);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const generatePreview = () => {
    const sampleNames = ['John', 'Sarah', 'Mike'];
    return sampleNames.map(name => {
      let message = baseMessage.replace(/\{\{name\}\}/g, name);
      return `Hi ${name}, ${message}`;
    });
  };

  const contactCount = contacts?.length || 0;
  const estimatedDuration = contactCount * rateLimit.delayBetweenMessages;
  const hours = Math.floor(estimatedDuration / 3600);
  const minutes = Math.floor((estimatedDuration % 3600) / 60);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Create Campaign</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Template
            </label>
            <textarea
              value={baseMessage}
              onChange={(e) => setBaseMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message. Use {{name}} to personalize with contact names."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use <code>{'{{name}}'}</code> to insert contact names. Messages will be automatically varied to avoid repetition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Messages per Minute
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rateLimit.messagesPerMinute}
                onChange={(e) => setRateLimit(prev => ({
                  ...prev,
                  messagesPerMinute: parseInt(e.target.value) || 1
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Between Messages (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={rateLimit.delayBetweenMessages}
                onChange={(e) => setRateLimit(prev => ({
                  ...prev,
                  delayBetweenMessages: parseInt(e.target.value) || 30
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Campaign Summary</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• {contactCount} opted-in contacts will receive messages</p>
              <p>• Estimated duration: {hours > 0 ? `${hours}h ` : ''}{minutes}m</p>
              <p>• Rate: 1 message every {rateLimit.delayBetweenMessages} seconds</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </Button>
            
            <Button
              onClick={handleCreateCampaign}
              disabled={isCreating || !campaignName.trim() || !baseMessage.trim() || contactCount === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              <span>{isCreating ? 'Creating...' : 'Create Campaign'}</span>
            </Button>
          </div>

          {showPreview && baseMessage && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Message Preview</h4>
              <div className="space-y-2">
                {generatePreview().map((message, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                    {message}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Each contact will receive a unique variation to avoid repetition.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}