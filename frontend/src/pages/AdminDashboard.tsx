import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Users, FileText, Target, Play, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const meetings = [
    { id: 1, title: "Coffee Chat ☕", host: "Sarah Chen", date: "2024-01-20", duration: "45 min", status: "Completed" },
    { id: 2, title: "Action Heroes Session 🦸", host: "Mike Ross", date: "2024-01-19", duration: "30 min", status: "Completed" },
    { id: 3, title: "Sprint Planning ⚡", host: "Emma Wilson", date: "2024-01-18", duration: "1 hour", status: "Processing" },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all meetings and users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Meetings"
            value="247"
            icon={Video}
            subtitle="+12% from last month"
          />
          <StatCard
            title="Active Users"
            value="89"
            icon={Users}
            subtitle="23 new this week"
          />
          <StatCard
            title="Avg Summary Length"
            value="342"
            icon={FileText}
            subtitle="words per meeting"
          />
          <StatCard
            title="AI Accuracy"
            value="94%"
            icon={Target}
            subtitle="+2% improvement"
          />
        </div>

        {/* Meeting Management Table */}
        <Card className="p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-playfair">Meeting Management</h2>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate('/admin/meetings')}
            >
              View All
            </Button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Meeting Title</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow 
                    key={meeting.id} 
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                  >
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>{meeting.host}</TableCell>
                    <TableCell>{meeting.date}</TableCell>
                    <TableCell>{meeting.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={meeting.status === "Completed" ? "default" : "secondary"}
                      >
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/admin/meetings/${meeting.id}/play`)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* User Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-playfair">Top Active Users 🌟</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl"
                onClick={() => navigate('/admin/users')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {["Sarah Chen - 23 meetings", "Mike Ross - 19 meetings", "Emma Wilson - 17 meetings"].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium">{user}</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-playfair">Analytics Overview</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl"
                onClick={() => navigate('/admin/analytics')}
              >
                View Details
              </Button>
            </div>
            <div className="space-y-3">
              {[
                "1,247 total meeting hours",
                "+23% growth this month",
                "98.5% AI accuracy rate",
              ].map((activity, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-sm">{activity}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
