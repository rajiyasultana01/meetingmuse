import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, Clock, TrendingUp, Zap, Play, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const navigate = useNavigate();
  
  const recentMeetings = [
    { id: 1, title: "Coffee Chat", date: "Yesterday", duration: "30 min", status: "Completed" },
    { id: 2, title: "Action Heroes Session", date: "2 days ago", duration: "1 hour", status: "Completed" },
    { id: 3, title: "Sprint Planning", date: "3 days ago", duration: "45 min", status: "Processing" },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's your meeting overview</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Meetings" 
            value="24" 
            icon={Calendar}
            subtitle="This month"
          />
          <StatCard 
            title="Hours Saved" 
            value="18.5" 
            icon={Clock}
            subtitle="Through AI summaries"
          />
          <StatCard 
            title="Action Items" 
            value="32" 
            icon={Zap}
            subtitle="Completed this week"
          />
          <StatCard 
            title="Engagement" 
            value="94%" 
            icon={TrendingUp}
            subtitle="Team participation"
          />
        </div>

        {/* Recent Meetings */}
        <Card className="p-6 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-playfair">Recent Meetings</h2>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate('/meetings')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/meetings/${meeting.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <Badge variant={meeting.status === "Completed" ? "default" : "secondary"}>
                    {meeting.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{meeting.date}</span>
                  <span>{meeting.duration}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meetings/${meeting.id}`);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/meetings/${meeting.id}/play`);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Recording
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">Upcoming Action Items</h3>
            <div className="space-y-3">
              {[
                "Follow up with client - Due today",
                "Prepare Q2 presentation - Due tomorrow",
                "Review design mockups - Due in 2 days",
              ].map((item, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">This Week's Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Meetings attended", value: "12" },
                { label: "Total duration", value: "8.5 hours" },
                { label: "Action items created", value: "18" },
              ].map((stat, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
