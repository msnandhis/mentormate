import React, { useState, useEffect } from 'react';
import { Key, AlertCircle, CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { tavusAPI } from '../../lib/tavus';

export const ApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'unconfigured' | 'checking' | 'valid' | 'invalid'>('unconfigured');
  const [quota, setQuota] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const currentKey = import.meta.env.VITE_TAVUS_API_KEY;
    
    if (!currentKey) {
      setStatus('unconfigured');
      return;
    }

    setStatus('checking');
    setApiKey(currentKey);

    try {
      const health = await tavusAPI.checkHealth();
      if (health.status === 'mock') {
        setStatus('unconfigured');
        setError('API key not configured');
      } else {
        setStatus('valid');
        setError(null);
        
        // Get quota information
        try {
          const quotaInfo = await tavusAPI.getQuota();
          setQuota(quotaInfo);
        } catch (quotaError) {
          console.warn('Could not fetch quota information:', quotaError);
        }
      }
    } catch (error) {
      setStatus('invalid');
      setError(error instanceof Error ? error.message : 'Invalid API key');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'valid': return 'text-success border-success-200 bg-success-50';
      case 'invalid': return 'text-red-600 border-red-200 bg-red-50';
      case 'checking': return 'text-blue-600 border-blue-200 bg-blue-50';
      default: return 'text-warning border-warning-200 bg-warning-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'invalid': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'valid': return 'API key is valid and working';
      case 'invalid': return 'API key is invalid or has issues';
      case 'checking': return 'Checking API key...';
      default: return 'Tavus API key not configured';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-3 mb-4">
        <Key className="w-6 h-6 text-primary" />
        <h3 className="font-heading font-semibold text-xl text-foreground">
          Tavus API Configuration
        </h3>
      </div>

      {/* Status Display */}
      <div className={`p-4 rounded-lg border mb-6 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-body font-medium">
              {getStatusText()}
            </p>
            {error && (
              <p className="font-body text-sm mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* API Key Display */}
      {apiKey && (
        <div className="mb-6">
          <label className="block font-body font-medium text-foreground mb-2">
            Current API Key
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="w-full px-4 py-3 border border-border rounded-lg font-mono text-sm bg-neutral-50 text-neutral-600"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={checkApiKey}
              disabled={status === 'checking'}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test
            </button>
          </div>
        </div>
      )}

      {/* Quota Information */}
      {quota && status === 'valid' && (
        <div className="mb-6">
          <h4 className="font-body font-medium text-foreground mb-3">
            API Quota Status
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="font-heading font-bold text-2xl text-primary">
                {quota.videos_remaining || 0}
              </div>
              <div className="font-body text-sm text-neutral-600">Videos Remaining</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="font-heading font-bold text-2xl text-blue-600">
                {quota.voice_minutes_remaining || 0}
              </div>
              <div className="font-body text-sm text-neutral-600">Voice Minutes</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="font-heading font-bold text-2xl text-purple-600">
                {quota.avatars_remaining || 0}
              </div>
              <div className="font-body text-sm text-neutral-600">Avatars Remaining</div>
            </div>
          </div>
          {quota.reset_date && (
            <p className="font-body text-xs text-neutral-500 mt-2 text-center">
              Quota resets on {new Date(quota.reset_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      {status === 'unconfigured' && (
        <div className="space-y-4">
          <h4 className="font-body font-medium text-foreground">
            How to set up Tavus API:
          </h4>
          <ol className="font-body text-sm text-neutral-700 space-y-2 list-decimal list-inside">
            <li>
              Sign up for a Tavus account at{' '}
              <a 
                href="https://tavusapi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-600 inline-flex items-center"
              >
                tavusapi.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </li>
            <li>Navigate to your API settings and generate an API key</li>
            <li>Add the API key to your <code className="bg-neutral-100 px-1 rounded">.env</code> file:</li>
          </ol>
          
          <div className="bg-neutral-900 text-neutral-100 p-4 rounded-lg font-mono text-sm">
            <div className="text-green-400"># Add this to your .env file</div>
            <div>VITE_TAVUS_API_KEY=your_api_key_here</div>
            <div className="text-neutral-400"># Optional: Set webhook URL for status updates</div>
            <div>VITE_TAVUS_WEBHOOK_URL=https://your-domain.com/api/webhooks/tavus</div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-body text-blue-700 text-sm">
              <strong>Note:</strong> After adding the API key, restart your development server for the changes to take effect.
            </p>
          </div>
        </div>
      )}

      {/* Features Available */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent rounded-lg">
        <h4 className="font-body font-semibold text-primary-800 mb-2">
          Features Available with Tavus API
        </h4>
        <ul className="font-body text-primary-700 text-sm space-y-1">
          <li>• Professional AI avatar creation from video</li>
          <li>• High-quality video generation for mentor responses</li>
          <li>• Custom voice cloning for personalized mentors</li>
          <li>• Real-time video conversations with AI mentors</li>
          <li>• Advanced avatar customization and management</li>
        </ul>
      </div>
    </div>
  );
};