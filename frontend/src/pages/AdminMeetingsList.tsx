import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Loader2 } from "lucide-react";
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
import api from "@/services/api";
import { format } from "date-fns";

// Removed const envApiUrl... as api service handles base URL

interface Meeting {
  _id: string;
  title: string;
  createdAt: string;
  duration?: string;
  status: string;
  firebaseUid: string;
  userId: {
    email: string;
    displayName?: string;
    photoURL?: string;
  };
}

export default function AdminMeetingsList() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      // Admin endpoint to get all meetings
      // Backend now supports admins fetching all meetings at /meetings
      const response = await api.get('/meetings');
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      await api.delete(`/meetings/${id}`);
      fetchMeetings(); // Refresh list
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      alert("Failed to delete meeting");
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">All Meetings 📋</h1>
          <p className="text-muted-foreground">Complete list of all recorded meetings from all users</p>
        </div>

        <Card className="p-6 shadow-soft">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No meetings recorded yet. Meetings will appear here once users start recording.
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Meeting Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow
                      key={meeting._id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/meetings/${meeting._id}`)}
                    >
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{meeting.userId?.displayName || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{meeting.userId?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(meeting.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{meeting.duration || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={meeting.status === "completed" ? "default" : "secondary"}
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
                            onClick={() => navigate(`/admin/meetings/${meeting._id}/play`)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => handleDelete(e, meeting._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
