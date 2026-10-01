import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, PaintBucket, Server, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import SMSConfiguration from '@/components/admin/SMSConfiguration';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data.data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [field]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-500" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure global ERP settings and policies.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Settings Nav */}
        <Card className="w-full lg:w-64 shrink-0 glass-panel border-none shadow-sm h-fit">
          <CardContent className="p-2 flex flex-col gap-1">
            {[
              { id: 'general', label: 'General', icon: Server },
              { id: 'attendance', label: 'Attendance Rules', icon: CheckCircle2 },
              { id: 'sms', label: 'SMS Configuration', icon: Bell },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security & Access', icon: Shield },
              { id: 'appearance', label: 'Appearance', icon: PaintBucket },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-panel border-none shadow-sm">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic information about the institution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input 
                      value={settings?.institutionName || ''} 
                      onChange={(e) => handleChange(null, 'institutionName', e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Input defaultValue="2026-2027" />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Semester</Label>
                      <select className="flex h-10 w-full rounded-md border border-slate-800 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-indigo-500">
                        <option>Odd Semester</option>
                        <option>Even Semester</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input defaultValue="support@globaltech.edu" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-panel border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Attendance Rules</CardTitle>
                  <CardDescription>Configure minimum attendance policies and AI risk thresholds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 border-b border-slate-800 dark:border-slate-800 pb-4">
                    <Label>Minimum Required Attendance (%)</Label>
                    <Input 
                      type="number" 
                      value={settings?.attendanceConfig?.minThreshold || 75} 
                      onChange={(e) => handleChange('attendanceConfig', 'minThreshold', parseInt(e.target.value))}
                      className="max-w-[200px]" 
                    />
                    <p className="text-xs text-slate-500 mt-1">Students below this will be marked as defaulters.</p>
                  </div>
                  <div className="space-y-2 border-b border-slate-800 dark:border-slate-800 pb-4">
                    <Label>Warning Threshold (%)</Label>
                    <Input 
                      type="number" 
                      value={settings?.attendanceConfig?.warningThreshold || 80} 
                      onChange={(e) => handleChange('attendanceConfig', 'warningThreshold', parseInt(e.target.value))}
                      className="max-w-[200px]" 
                    />
                    <p className="text-xs text-slate-500 mt-1">Students below this will receive warning alerts and trigger parent notifications.</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto-notify Defaulters</Label>
                      <p className="text-sm text-slate-500">Send automated SMS/Emails when attendance drops below threshold.</p>
                    </div>
                    <Switch 
                      checked={settings?.notificationConfig?.notifyParentsOnWarning || false} 
                      onCheckedChange={(checked) => handleChange('notificationConfig', 'notifyParentsOnWarning', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">AI Risk Prediction</Label>
                      <p className="text-sm text-slate-500">Enable predictive analytics for student drop-out risks.</p>
                    </div>
                    <Switch 
                      checked={settings?.aiConfig?.enablePredictions || false}
                      onCheckedChange={(checked) => handleChange('aiConfig', 'enablePredictions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Faculty Override</Label>
                      <p className="text-sm text-slate-500">Allow HODs to override student attendance marks manually.</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-panel border-none shadow-sm h-full">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Appearance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Choose your preferred theme</p>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-md mb-8">
                    <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-800 dark:border-slate-800 hover:border-indigo-500 transition-all bg-white dark:bg-slate-900">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Light</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 transition-all shadow-md">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Dark</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-800 dark:border-slate-800 hover:border-indigo-500 transition-all bg-white dark:bg-slate-900">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">System</span>
                    </button>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Primary Color</h3>
                    <div className="flex gap-3">
                      {[
                        {color: 'bg-blue-600', active: true},
                        {color: 'bg-emerald-500'},
                        {color: 'bg-slate-600'},
                        {color: 'bg-amber-500'},
                        {color: 'bg-rose-500'},
                        {color: 'bg-indigo-600'},
                        {color: 'bg-purple-600'}
                      ].map((c, i) => (
                        <button key={i} className={`w-6 h-6 rounded-full ${c.color} flex items-center justify-center ring-offset-2 dark:ring-offset-slate-950 transition-all ${c.active ? 'ring-2 ring-blue-600 scale-110' : 'hover:scale-110'}`}>
                          {c.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Font Family</label>
                      <select className="w-full bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 appearance-none">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Poppins</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Language</label>
                      <select className="w-full bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 appearance-none">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'sms' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <SMSConfiguration />
            </motion.div>
          )}

          {/* Placeholders for other tabs to prevent empty state */}
          {['notifications', 'security'].includes(activeTab) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center text-slate-500">
              <SettingsIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p>Settings for {activeTab} will be available in the next release.</p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
