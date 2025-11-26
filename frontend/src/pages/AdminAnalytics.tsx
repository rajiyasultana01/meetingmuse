import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Video, Users, Clock, TrendingUp, Calendar, FileText } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Analytics Dashboard 📊</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>

        {/* Overview Stats */}
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
            title="Total Hours"
            value="1,247"
            icon={Clock}
            subtitle="Meeting time logged"
          />
          <StatCard
            title="Growth Rate"
            value="+23%"
            icon={TrendingUp}
            subtitle="Month over month"
          />
        </div>

        {/* Monthly Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Activity
            </h3>
            <div className="space-y-4">
              {[
                { month: "January 2024", meetings: 87, users: 45, hours: 423 },
                { month: "December 2023", meetings: 78, users: 42, hours: 387 },
                { month: "November 2023", meetings: 82, users: 38, hours: 401 },
              ].map((data, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-xl">
                  <div className="font-medium mb-2">{data.month}</div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <div className="font-semibold text-foreground">{data.meetings}</div>
                      <div>Meetings</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{data.users}</div>
                      <div>Users</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{data.hours}h</div>
                      <div>Duration</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Summary Statistics
            </h3>
            <div className="space-y-4">
              {[
                { label: "Average Meeting Duration", value: "45 minutes" },
                { label: "Average Summary Length", value: "342 words" },
                { label: "AI Processing Success Rate", value: "98.5%" },
                { label: "User Satisfaction Score", value: "4.8/5.0" },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">Most Active Hosts 🌟</h3>
            <div className="space-y-3">
              {[
                { name: "Sarah Chen", meetings: 23, hours: "34.5h" },
                { name: "Mike Ross", meetings: 19, hours: "28.5h" },
                { name: "Emma Wilson", meetings: 17, hours: "25.5h" },
              ].map((host, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{host.name}</span>
                    <span className="text-sm text-muted-foreground">{host.hours}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{host.meetings} meetings</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-xl font-bold font-playfair mb-4">Peak Usage Times ⏰</h3>
            <div className="space-y-3">
              {[
                { time: "10:00 AM - 12:00 PM", percentage: "35%", meetings: 86 },
                { time: "2:00 PM - 4:00 PM", percentage: "28%", meetings: 69 },
                { time: "9:00 AM - 10:00 AM", percentage: "18%", meetings: 44 },
              ].map((slot, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-sm text-muted-foreground">{slot.percentage}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{slot.meetings} meetings</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
