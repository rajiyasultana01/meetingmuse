import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Edit, Trash2 } from "lucide-react";
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

export default function AdminMeetingsList() {
  const navigate = useNavigate();
  
  const meetings = [
    { id: 1, title: "Coffee Chat ☕", host: "Sarah Chen", date: "2024-01-20", duration: "45 min", status: "Completed" },
    { id: 2, title: "Action Heroes Session", host: "Mike Ross", date: "2024-01-19", duration: "30 min", status: "Completed" },
    { id: 3, title: "Sprint Planning", host: "Emma Wilson", date: "2024-01-18", duration: "1 hour", status: "Processing" },
    { id: 4, title: "Team Sync", host: "John Doe", date: "2024-01-17", duration: "20 min", status: "Completed" },
    { id: 5, title: "Design Review", host: "Jane Smith", date: "2024-01-16", duration: "1.5 hours", status: "Completed" },
    { id: 6, title: "Client Meeting", host: "Sarah Chen", date: "2024-01-15", duration: "45 min", status: "Completed" },
    { id: 7, title: "Brainstorming Session", host: "Mike Ross", date: "2024-01-14", duration: "1 hour", status: "Processing" },
    { id: 8, title: "Code Review", host: "Emma Wilson", date: "2024-01-13", duration: "30 min", status: "Completed" },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">All Meetings 📋</h1>
          <p className="text-muted-foreground">Complete list of all recorded meetings</p>
        </div>

        <Card className="p-6 shadow-soft">
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
      </div>
    </Layout>
  );
}
