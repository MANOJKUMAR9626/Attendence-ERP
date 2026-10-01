import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const SMSConfiguration = () => {
  const [providers, setProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState('');
  const [config, setConfig] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Attendance Management SMS test');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchProviders(),
          fetchConfig(),
          fetchStatus()
        ]);
      } catch (err) {
        console.error(err);
        setError('Unable to load SMS configuration. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchProviders = async () => {
    const res = await api.get('/admin/sms/providers');
    setProviders(res.data.data);
  };

  const fetchConfig = async () => {
    const res = await api.get('/admin/sms/config');
    const data = res.data.data;
    setConfig(data || { provider: '', credentials: {} });
    setActiveProvider(data?.provider || '');
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/admin/sms/status');
      setStatus(res.data.data);
    } catch (err) {}
  };

  const handleProviderChange = (e) => {
    const p = e.target.value;
    setActiveProvider(p);
    setConfig({
      ...config,
      provider: p,
      credentials: {}, // reset creds visually when switching
    });
  };

  const handleCredentialChange = (field, value) => {
    setConfig({
      ...config,
      credentials: {
        ...config.credentials,
        [field]: value
      }
    });
  };

  const handleSettingsChange = (field, value) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/admin/sms/config', config);
      toast.success('SMS Configuration saved successfully');
      fetchConfig();
      fetchStatus();
    } catch (err) {
      toast.error('Failed to save SMS configuration');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await api.post('/admin/sms/test-connection', {
        provider: activeProvider,
        credentials: config.credentials
      });
      toast.success('Connection successful');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testPhone) return toast.error('Enter test phone number');
    try {
      const res = await api.post('/admin/sms/test-message', {
        phoneNumber: testPhone,
        message: testMessage
      });
      toast.success(res.data.message || 'Test SMS request submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test SMS failed');
    }
  };

  const selectedProviderData = providers.find(p => p.id === activeProvider);

  if (isLoading) return <div className="p-4 flex items-center gap-2"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> Loading SMS Config...</div>;
  if (error) return <div className="p-4 text-rose-500 font-semibold">{error}</div>;
  if (!config || !providers.length) return <div className="p-4 text-rose-500 font-semibold">Unable to load SMS configuration. Please try again.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-none shadow-sm">
            <CardHeader>
              <CardTitle>Provider Selection & Setup</CardTitle>
              <CardDescription>Configure the active SMS provider for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select SMS Provider</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                  value={activeProvider}
                  onChange={handleProviderChange}
                >
                  <option value="">Select Provider</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProviderData && (
                <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold">{selectedProviderData.name} Configuration</h3>
                  
                  {selectedProviderData.fields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        type={field.type}
                        value={config.credentials?.[field.name] || ''}
                        placeholder={field.type === 'password' ? '••••••••••••••••' : ''}
                        onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label>Sender ID</Label>
                    <Input 
                      value={config.senderId || ''} 
                      onChange={(e) => setConfig({...config, senderId: e.target.value})} 
                      placeholder="e.g. SMRTERP" 
                      maxLength={6}
                    />
                  </div>

                  {selectedProviderData.requiresTemplateId && (
                    <div className="space-y-2">
                      <Label>DLT Template ID (Required for India)</Label>
                      <Input 
                        value={config.templateId || ''} 
                        onChange={(e) => setConfig({...config, templateId: e.target.value})} 
                      />
                      <p className="text-xs text-slate-500">Indian SMS providers may require DLT registration and approved templates.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Country Code</Label>
                    <Input 
                      value={config.countryCode || 'IN'} 
                      onChange={(e) => setConfig({...config, countryCode: e.target.value})} 
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave}>
                      Save Configuration
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-none shadow-sm">
            <CardHeader>
              <CardTitle>SMS Settings & Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Automatic Low Attendance SMS</Label>
                  <p className="text-sm text-slate-500">Send SMS when attendance falls below threshold</p>
                </div>
                <Switch 
                  checked={config.settings?.automaticSmsEnabled !== false}
                  onCheckedChange={(c) => handleSettingsChange('automaticSmsEnabled', c)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Duplicate SMS Protection</Label>
                  <p className="text-sm text-slate-500">Prevent multiple alerts to the same parent on the same day</p>
                </div>
                <Switch 
                  checked={config.settings?.duplicateSmsProtection !== false}
                  onCheckedChange={(c) => handleSettingsChange('duplicateSmsProtection', c)}
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <Label>Tamil Template</Label>
                <Textarea 
                  rows={4}
                  value={config.settings?.templateTamil || ''}
                  onChange={(e) => handleSettingsChange('templateTamil', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>English Template</Label>
                <Textarea 
                  rows={4}
                  value={config.settings?.templateEnglish || ''}
                  onChange={(e) => handleSettingsChange('templateEnglish', e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Variables supported: {'{{studentName}}'}, {'{{attendance}}'}, {'{{requiredAttendance}}'}
                </p>
              </div>
              
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-none shadow-sm bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>SMS SERVICE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Provider:</span>
                <span className="font-semibold">{status?.provider || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Status:</span>
                <span className="font-semibold">{status?.configured ? '🟢 Configured' : '🔴 Unconfigured'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Automatic SMS:</span>
                <span className="font-semibold">{status?.automaticSmsEnabled ? '🟢 Enabled' : '🔴 Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Last SMS:</span>
                <span className="font-semibold text-xs mt-1 text-slate-700 dark:text-slate-300">
                  {status?.lastSmsSent ? new Date(status.lastSmsSent).toLocaleString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-none shadow-sm">
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Mobile Number</Label>
                <Input 
                  placeholder="+91XXXXXXXXXX" 
                  value={testPhone} 
                  onChange={(e) => setTestPhone(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Test Message</Label>
                <Textarea 
                  value={testMessage} 
                  onChange={(e) => setTestMessage(e.target.value)} 
                  rows={2}
                />
              </div>
              <Button onClick={handleTestMessage} className="w-full">
                Send Test SMS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SMSConfiguration;
