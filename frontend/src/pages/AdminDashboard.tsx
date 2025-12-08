import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and meetings</p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="p-6 shadow-soft hover:shadow-hover transition-all cursor-pointer"
            onClick={() => navigate('/admin/meetings')}
          >
            <h3 className="text-xl font-bold font-playfair mb-2">📋 All Meetings</h3>
            <p className="text-muted-foreground">View and manage all recorded meetings</p>
          </Card>

          <Card
            className="p-6 shadow-soft hover:shadow-hover transition-all cursor-pointer"
            onClick={() => navigate('/admin/users')}
          >
            <h3 className="text-xl font-bold font-playfair mb-2">👥 User Management</h3>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </Card>

          <Card
            className="p-6 shadow-soft hover:shadow-hover transition-all cursor-pointer"
            onClick={() => navigate('/admin/analytics')}
          >
            <h3 className="text-xl font-bold font-playfair mb-2">📊 Analytics</h3>
            <p className="text-muted-foreground">View system analytics and insights</p>
          </Card>

          <Card
            className="p-6 shadow-soft hover:shadow-hover transition-all cursor-pointer"
            onClick={() => navigate('/admin/api')}
          >
            <h3 className="text-xl font-bold font-playfair mb-2">🔌 API Integration</h3>
            <p className="text-muted-foreground">Configure API keys and webhooks</p>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-2">⚙️ Settings</h3>
            <p className="text-muted-foreground">System configuration (coming soon)</p>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-2">📈 Reports</h3>
            <p className="text-muted-foreground">Generate reports (coming soon)</p>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="p-6 shadow-soft mt-8">
          <h3 className="text-xl font-bold font-playfair mb-4">Getting Started</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>✅ Backend is running and connected to MongoDB</p>
            <p>✅ Firebase authentication is configured</p>
            <p>✅ Extension is ready for user recordings</p>
            <p className="pt-4 border-t">
              <strong>Next steps:</strong> Users can now login to the extension and start recording meetings.
              All recordings will appear in the "All Meetings" section.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
