import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MeetingsList() {
  const navigate = useNavigate();
  
  const meetings = [
    {
      title: "Coffee Chat",
      date: "Jan 20, 2024",
      duration: "45 min",
      participants: 4,
      summary: "Discussed Q4 targets, new design system launch, and budget allocation...",
      tags: ["Roadmap", "Budget", "Design"],
    },
    {
      title: "Action Heroes Session",
      date: "Jan 19, 2024",
      duration: "30 min",
      participants: 6,
      summary: "Sprint planning for upcoming release. Reviewed user stories and prioritized features...",
      tags: ["Sprint", "Planning", "Features"],
    },
    {
      title: "Peekaboo Meeting",
      date: "Jan 18, 2024",
      duration: "1 hour",
      participants: 3,
      summary: "Client demo and feedback session. Gathered requirements for next iteration...",
      tags: ["Client", "Demo", "Feedback"],
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Meetings</h1>
          <p className="text-muted-foreground">All your recorded meetings and summaries</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Meetings Grid */}
        <div className="space-y-4">
          {meetings.map((meeting, i) => (
            <Card
              key={i}
              className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {meeting.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.duration}
                      </span>
                      <span>{meeting.participants} participants</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{meeting.summary}</p>

                  <div className="flex flex-wrap gap-2">
                    {meeting.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 md:min-w-[140px]">
                  <Button 
                    onClick={() => navigate(`/meetings/${i + 1}`)}
                    className="rounded-xl flex-1"
                  >
                    View Full Summary
                  </Button>
                  <Button 
                    onClick={() => navigate(`/meetings/${i + 1}/play`)}
                    variant="outline" 
                    className="rounded-xl flex-1"
                  >
                    Play Recording
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
