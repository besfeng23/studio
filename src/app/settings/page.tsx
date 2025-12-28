'use client';

import { MainSidebar } from '@/components/main-sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDoc, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


type Settings = {
  provider?: string;
  memoryLaneModel?: string;
  answerLaneModel?: string;
  replyStyle?: 'Short' | 'Long';
};

type ApiClient = {
  id: string;
  apiKey: string;
  createdAt: any;
};

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-20" />
        </div>
    </div>
)


export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { data: settings, loading } = useDoc<Settings>(
    user ? `settings/${user.uid}` : ''
  );
  
  const [localSettings, setLocalSettings] = useState<Settings>({});
  const [apiClients, setApiClients] = useState<ApiClient[]>([]);
  const [callbackUrl, setCallbackUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if(window) {
      setCallbackUrl(`${window.location.origin}/api/memory-chat`);
    }
  }, []);

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    if (!user || !db) return;
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await setDoc(doc(db, 'settings', user.uid), newSettings, { merge: true });
  };
  
  const generateApiKey = async () => {
    if (!db || !user) return;
    // In a real app, this would be a secure, server-generated key.
    const newKey = `mock-api-key-${crypto.randomUUID()}`;
    const newClient: Omit<ApiClient, 'id'> = {
        apiKey: newKey,
        createdAt: serverTimestamp(),
    }
    const docRef = await addDoc(collection(db, 'api_clients'), newClient);
    setApiClients(prev => [...prev, { ...newClient, id: docRef.id }]);
    toast({ title: "API Key Generated", description: "A new API key has been created." });
  };

  const revokeApiKey = (keyId: string) => {
    // Logic to revoke API key would go here.
    toast({ title: "API Key Revoked", description: `Key ${keyId} has been revoked.` });
  };


  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
            <h1 className="text-lg font-semibold md:text-xl">Settings</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto max-w-2xl space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Model Configuration</CardTitle>
                  <CardDescription>
                    Choose the AI models and reply style for Pandora.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <LoadingSkeleton /> : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="provider">AI Provider</Label>
                      <Select
                        value={localSettings.provider}
                        onValueChange={(value) => handleSettingChange('provider', value)}
                      >
                        <SelectTrigger id="provider">
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google (Vertex AI)</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memory-model">Memory Lane Model (Fast)</Label>
                      <Select
                        value={localSettings.memoryLaneModel}
                        onValueChange={(value) => handleSettingChange('memoryLaneModel', value)}
                      >
                        <SelectTrigger id="memory-model">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT 3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer-model">Answer Lane Model (Deep)</Label>
                      <Select
                        value={localSettings.answerLaneModel}
                        onValueChange={(value) => handleSettingChange('answerLaneModel', value)}
                      >
                        <SelectTrigger id="answer-model">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                          <SelectItem value="gpt-4">GPT 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className='space-y-0.5'>
                            <Label htmlFor="reply-style">Long Replies</Label>
                            <p className='text-xs text-muted-foreground'>Generate more detailed and verbose answers.</p>
                        </div>
                        <Switch
                            id="reply-style"
                            checked={localSettings.replyStyle === 'Long'}
                            onCheckedChange={(checked) =>
                            handleSettingChange('replyStyle', checked ? 'Long' : 'Short')
                            }
                        />
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>API Access</CardTitle>
                    <CardDescription>Manage API keys for the callback endpoint.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="callback-url">Callback URL</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="callback-url" value={callbackUrl} readOnly />
                            <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(callbackUrl)}>
                                <Icons.Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <div>
                        <h4 className="mb-2 font-medium">API Keys</h4>
                        <div className="space-y-2">
                            {apiClients.map(client => (
                                <div key={client.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <span className="font-mono text-sm">****-****-****-{client.apiKey.slice(-4)}</span>
                                    <Button variant="ghost" size="sm" onClick={() => revokeApiKey(client.id)}>Revoke</Button>
                                </div>
                            ))}
                        </div>
                        <Button onClick={generateApiKey} className="mt-4">Generate New Key</Button>
                    </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
