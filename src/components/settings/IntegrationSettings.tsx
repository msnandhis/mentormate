import React, { useState } from 'react';
import { Settings, Zap, Video, Mic, Globe } from 'lucide-react';
import { ApiKeySetup } from '../common/ApiKeySetup';

export const IntegrationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tavus' | 'other'>('tavus');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
          Integration Settings
        </h1>
        <p className="font-body text-neutral-600">
          Configure external API integrations for enhanced features.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 border border-border w-fit">
        <button
          onClick={() => setActiveTab('tavus')}
          className={`px-6 py-3 rounded-md font-body transition-colors ${
            activeTab === 'tavus'
              ? 'bg-primary text-white shadow-sm'
              : 'text-neutral-600 hover:text-foreground'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Tavus API</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-6 py-3 rounded-md font-body transition-colors ${
            activeTab === 'other'
              ? 'bg-primary text-white shadow-sm'
              : 'text-neutral-600 hover:text-foreground'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Other APIs</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tavus' && (
        <div className="space-y-6">
          <ApiKeySetup />
          
          {/* Tavus Features */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
              Tavus Integration Features
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-foreground">Video Generation</h4>
                    <p className="font-body text-sm text-neutral-600">
                      Generate professional AI videos for mentor responses
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-foreground">Voice Cloning</h4>
                    <p className="font-body text-sm text-neutral-600">
                      Create custom voices for personalized AI mentors
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-foreground">Avatar Management</h4>
                    <p className="font-body text-sm text-neutral-600">
                      Create and manage custom AI avatars from video
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-body font-semibold text-foreground">Real-time Generation</h4>
                    <p className="font-body text-sm text-neutral-600">
                      Live video generation with webhook notifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'other' && (
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">
              Additional Integrations
            </h3>
            <p className="font-body text-neutral-600 mb-4">
              More API integrations coming soon! This will include:
            </p>
            <ul className="font-body text-neutral-600 space-y-1 max-w-md mx-auto">
              <li>• OpenAI GPT integration for enhanced responses</li>
              <li>• Elevenlabs for additional voice options</li>
              <li>• Calendar integrations for scheduling</li>
              <li>• Fitness app integrations for goal tracking</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};