import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { meetingsAPI, Meeting } from "@/services/meetings";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function MeetingsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingsAPI.getAll();
      setMeetings(data.meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load meetings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      await meetingsAPI.delete(id);
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
      fetchMeetings(); // Refresh list
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meeting",
      });
    }
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Meetings Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No meetings found matching your search." : "No meetings recorded yet. Use the extension to record your first meeting!"}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting._id}
                className="p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/meetings/${meeting._id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold mb-2">
                          {meeting.title}
                        </h3>
                        <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(meeting.createdAt), 'MMM d, yyyy')}
                        </span>
                        {meeting.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {meeting.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-2">
                      {meeting.summary || "No summary available yet..."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {meeting.tags?.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:min-w-[140px]">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/meetings/${meeting._id}`);
                      }}
                      className="rounded-xl flex-1"
                    >
                      View Summary
                    </Button>
                    <Button
                      onClick={(e) => handleDelete(e, meeting._id)}
                      variant="ghost"
                      className="rounded-xl flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
