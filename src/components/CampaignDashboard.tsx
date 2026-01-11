"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CampaignDashboardProps {
  userId: Id<"users">;
}

export function CampaignDashboard({ userId }: CampaignDashboardProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  const campaigns = useQuery(api.campaigns.getCampaigns, { userId: userId });
  const campaignDetails = useQuery(
    api.campaigns.getCampaignDetails,
    selectedCampaign ? { campaignId: selectedCampaign as Id<"campaigns"> } : "skip"
  );
  const queueStats = useQuery(api.queue.getQueueStats);
  
  const startCampaign = useMutation(api.campaigns.startCampaign);
  const pauseCampaign = useMutation(api.campaigns.pauseCampaign);

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await startCampaign({ campaignId: campaignId as Id<"campaigns"> });
      alert('Campaign started successfully!');
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert('Error starting campaign. Please try again.');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign({ campaignId: campaignId as Id<"campaigns"> });
      alert('Campaign paused successfully!');
    } catch (error) {
      console.error('Error pausing campaign:', error);
      alert('Error pausing campaign. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      {queueStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Queue Status</span>
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{queueStats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{queueStats.processing}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{queueStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Campaigns</h3>
        
        {!campaigns || campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No campaigns created yet.</p>
            <p className="text-sm">Create your first campaign to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCampaign === campaign._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCampaign(
                  selectedCampaign === campaign._id ? null : campaign._id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span>{campaign.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {campaign.totalContacts} contacts • {campaign.sentCount} sent • {campaign.failedCount} failed
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${campaign.totalContacts > 0 ? (campaign.sentCount / campaign.totalContacts) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {campaign.totalContacts > 0 
                          ? `${Math.round((campaign.sentCount / campaign.totalContacts) * 100)}% complete`
                          : '0% complete'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {campaign.status === 'draft' || campaign.status === 'paused' ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCampaign(campaign._id);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    ) : campaign.status === 'running' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseCampaign(campaign._id);
                        }}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Details */}
      {selectedCampaign && campaignDetails && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Message Template</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                {campaignDetails.campaign.baseMessage}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent Activity</h4>
              {campaignDetails.recentLogs.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {campaignDetails.recentLogs.map((log) => (
                    <div key={log._id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span>{log.phoneNumber}</span>
                        {log.errorMessage && (
                          <span className="text-red-600 text-xs">({log.errorMessage})</span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}