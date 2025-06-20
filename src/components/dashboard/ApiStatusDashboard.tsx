import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, RefreshCw, Video, Mic, Users, Globe } from 'lucide-react';
import { tavusAPI } from '../../lib/tavus';

interface ApiStatus {
  name: string;
  status: 'connected' | 'error' | 'checking' | 'not_configured';
  message: string;
  details?: any;
  icon: React.ComponentType<any>;
  color: string;
}

export const ApiStatusDashboard: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkAllApiStatuses();
    // Check every 30 seconds
    const interval = setInterval(checkAllApiStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAllApiStatuses = async () => {
    setLoading(true);
    
    const statuses: ApiStatus[] = [];

    // Check Tavus API
    try {
      const health = await tavusAPI.checkHealth();
      const quota = await tavusAPI.getQuota();
      
      if (health.status === 'mock') {
        statuses.push({
          name: 'Tavus Video API',
          status: 'not_configured',
          message: 'API key not configured',
          icon: Video,
          color: 'bg-yellow-500'
        });
      } else {
        statuses.push({
          name: 'Tavus Video API',
          status: 'connected',
          message: `Connected • ${quota.videos_remaining} videos remaining`,
          details: { health, quota },
          icon: Video,
          color: 'bg-green-500'
        });
      }
    } catch (error) {
      statuses.push({
        name: 'Tavus Video API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
        icon: Video,
        color: 'bg-red-500'
      });
    }

    // Check Supabase connection
    try {
      const { data, error } = await supabase.from('mentors').select('count').limit(1);
      if (error) throw error;
      
      statuses.push({
        name: 'Supabase Database',
        status: 'connected',
        message: 'Database connected',
        icon: Globe,
        color: 'bg-green-500'
      });
    } catch (error) {
      statuses.push({
        name: 'Supabase Database',
        status: 'error',
        message: 'Database connection failed',
        icon: Globe,
        color: 'bg-red-500'
      });
    }

    setApiStatuses(statuses);
    setLastCheck(new Date());
    setLoading(false);
  };

  const getOverallStatus = () => {
    const hasError = apiStatuses.some(api => api.status === 'error');
    const hasNotConfigured = apiStatuses.some(api => api.status === 'not_configured');
    const allConnected = apiStatuses.every(api => api.status === 'connected');

    if (hasError) return { status: 'error', color: 'bg-red-500', text: 'System Issues' };
    if (hasNotConfigured) return { status: 'warning', color: 'bg-yellow-500', text: 'Setup Required' };
    if (allConnected) return { status: 'connected', color: 'bg-green-500', text: 'All Systems Online' };
    return { status: 'checking', color: 'bg-blue-500', text: 'Checking...' };
  };

  const overall = getOverallStatus();

  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-primary" />
          <h3 className="font-heading font-semibold text-xl text-foreground">
            System Status
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${overall.color} animate-pulse`}></div>
          <span className="font-body text-sm font-medium">{overall.text}</span>
          <button
            onClick={checkAllApiStatuses}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* API Status Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {apiStatuses.map((api, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all ${
              api.status === 'connected' ? 'border-green-200 bg-green-50' :
              api.status === 'error' ? 'border-red-200 bg-red-50' :
              api.status === 'not_configured' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <api.icon className={`w-5 h-5 ${
                  api.status === 'connected' ? 'text-green-600' :
                  api.status === 'error' ? 'text-red-600' :
                  api.status === 'not_configured' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <h4 className="font-body font-semibold">{api.name}</h4>
              </div>
              <div className={`w-2 h-2 rounded-full ${api.color}`}></div>
            </div>
            
            <p className={`font-body text-sm ${
              api.status === 'connected' ? 'text-green-700' :
              api.status === 'error' ? 'text-red-700' :
              api.status === 'not_configured' ? 'text-yellow-700' :
              'text-blue-700'
            }`}>
              {api.message}
            </p>

            {/* Quota Details for Tavus */}
            {api.details?.quota && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-green-600">{api.details.quota.videos_remaining}</div>
                  <div className="text-green-700">Videos</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-blue-600">{api.details.quota.voice_minutes_remaining}</div>
                  <div className="text-blue-700">Voice Min</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-bold text-purple-600">{api.details.quota.avatars_remaining}</div>
                  <div className="text-purple-700">Avatars</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Last Check Time */}
      {lastCheck && (
        <div className="text-center text-xs text-neutral-500">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};