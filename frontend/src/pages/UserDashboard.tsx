import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, Clock, TrendingUp, Zap, Play, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { meetingsAPI, Meeting } from "@/services/meetings";
import { format } from "date-fns";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMeetings();
  }, []);

  const fetchRecentMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingsAPI.getAll(3, 0); // Get 3 most recent
      setMeetings(data.meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

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
            value={meetings.length.toString()}
            icon={Calendar}
            subtitle="Recorded meetings"
          />
          <StatCard
            title="Status"
            value="Active"
            icon={Clock}
            subtitle="System operational"
          />
          <StatCard
            title="Latest"
            value={meetings.length > 0 ? "1" : "0"}
            icon={Zap}
            subtitle="New recordings"
          />
          <StatCard
            title="Ready"
            value="100%"
            icon={TrendingUp}
            subtitle="System ready"
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

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No meetings recorded yet. Use the extension to record your first meeting!
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/meetings/${meeting._id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <Badge variant={meeting.status === "completed" ? "default" : "secondary"}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{format(new Date(meeting.createdAt), 'MMM d, yyyy')}</span>
                    <span>{meeting.duration || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/meetings/${meeting._id}`);
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
                        navigate(`/meetings/${meeting._id}/play`);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Recording
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions - Coming Soon */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">Action Items</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>Action items will appear here after meetings are processed</p>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">Analytics</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>Meeting analytics coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
