"use client"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Icons
import { Bell, Globe, Lock, Mail, Moon, Palette, Shield, User } from "lucide-react";

// Page Components
import SubscriptionCard from "./components/SubscriptionCard";
import PaymentHistory from './components/PaymentHistory';
import LogsView from './components/LogsView';

// Hooks and Utils
import { useUser } from '@clerk/nextjs';
import { usePricing } from "@/utils/hooks/usePricing";
import { useEffect, useState } from "react";
import config from '@/config';
import axios from "axios";

// Types
type SubscriptionHistory = {
  oldPlanName: string;
  newPlanName: string;
  changedAt: string;
  isUpgrade: boolean;
};

export default function SettingsPage() {
  // Usando um hook condicional de forma segura
  const userAuth = config?.auth?.enabled ? useUser() : { user: null };
  const user = userAuth.user;

  const { userInfo: subscriptionInfo, isLoading: subscriptionLoading } = usePricing();
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (user?.id) {
      setHistoryLoading(true);
      setError(undefined);
      console.log('🔄 Iniciando busca de histórico para usuário:', user.id);
      
      // Busca o histórico de assinaturas
      axios.get('/api/user/subscription/history', {
        headers: {
          'x-user-id': user.id
        }
      })
      .then(response => {
        console.log('✅ Histórico recebido:', response.data);
        setSubscriptionHistory(response.data.history);
      })
      .catch(error => {
        console.error('❌ Erro ao buscar histórico de assinaturas:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError('Não foi possível carregar o histórico de assinaturas. Por favor, tente novamente mais tarde.');
      })
      .finally(() => {
        setHistoryLoading(false);
      });
    }
  }, [user?.id]);

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/avatars/user.jpg" alt="User" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Avatar</Button>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" defaultValue={user?.firstName ? user?.firstName : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email" defaultValue={user?.emailAddresses?.[0]?.emailAddress!} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Username" defaultValue={user?.username!} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              {/* Subscription Card */}
              <SubscriptionCard 
                currentPlan={subscriptionInfo?.currentPlan || null}
                subscription={subscriptionInfo?.subscription || null}
                isLoading={subscriptionLoading || historyLoading}
                error={error}
              />

              {/* Payment History */}
              <PaymentHistory />

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground">Select your preferred language</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timezone</Label>
                      <p className="text-sm text-muted-foreground">Set your local timezone</p>
                    </div>
                    <Select defaultValue="est">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="gmt">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email updates</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive marketing emails</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Moon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Toggle dark mode</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label>Theme Color</Label>
                        <p className="text-sm text-muted-foreground">Choose your theme color</p>
                      </div>
                    </div>
                    <Select defaultValue="blue">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label>Password</Label>
                          <p className="text-sm text-muted-foreground">Change your password</p>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>Manage your active sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">Last active: Just now</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-destructive">Sign Out</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-6">
              <LogsView />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
