import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Webhook, Database } from "lucide-react";

export default function AdminApiIntegration() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">API Integration</h1>
        <p className="text-muted-foreground">
          Manage API keys, webhooks, and external integrations
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <Code className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
            <p className="text-muted-foreground mb-6">
              Generate and manage API keys for external integrations
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">Current API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="api-key"
                    type="password"
                    value="••••••••••••••••••••••••"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Show</Button>
                  <Button variant="outline">Copy</Button>
                </div>
              </div>

              <div className="pt-4">
                <Button>Generate New API Key</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">API Key History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Production Key</p>
                  <p className="text-sm text-muted-foreground">Created on Jan 15, 2024</p>
                </div>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Development Key</p>
                  <p className="text-sm text-muted-foreground">Created on Dec 20, 2023</p>
                </div>
                <Button variant="outline" size="sm">Revoke</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Webhooks</h2>
            <p className="text-muted-foreground mb-6">
              Configure webhooks to receive real-time events
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-domain.com/webhook"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Events to Subscribe</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="meeting-created" />
                    <label htmlFor="meeting-created">Meeting Created</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="meeting-completed" />
                    <label htmlFor="meeting-completed">Meeting Completed</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="user-registered" />
                    <label htmlFor="user-registered">User Registered</label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button>Add Webhook</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Database Connection</h2>
            <p className="text-muted-foreground mb-6">
              Configure external database connections and manage data exports
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="db-host">Database Host</Label>
                <Input
                  id="db-host"
                  type="text"
                  placeholder="localhost:5432"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="db-name">Database Name</Label>
                <Input
                  id="db-name"
                  type="text"
                  placeholder="meetingmind_db"
                  className="mt-2"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <Button>Test Connection</Button>
                <Button variant="outline">Export Data</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
            <p className="text-muted-foreground mb-6">
              Reference guide for integrating with MeetingMind API
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <code>
                    curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                    https://api.meetingmind.com/v1/meetings
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
                <div className="space-y-3">
                  <div className="border-b pb-3">
                    <p className="font-medium">GET /v1/meetings</p>
                    <p className="text-sm text-muted-foreground">Retrieve all meetings</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="font-medium">POST /v1/meetings</p>
                    <p className="text-sm text-muted-foreground">Create a new meeting</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="font-medium">GET /v1/meetings/:id</p>
                    <p className="text-sm text-muted-foreground">Get meeting details</p>
                  </div>
                  <div className="pb-3">
                    <p className="font-medium">DELETE /v1/meetings/:id</p>
                    <p className="text-sm text-muted-foreground">Delete a meeting</p>
                  </div>
                </div>
              </div>

              <div>
                <Button variant="outline">View Full Documentation</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
