import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function MeetingPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && !authLoading && user) {
      fetchMeetingData();
    } else if (!authLoading && !user) {
      // Not logged in
      setIsLoading(false);
    }
  }, [id, authLoading, user]);

  const fetchMeetingData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/meetings/${id}`);
      const data = response.data;

      // Handle nested structure (meeting { ... }) or flat
      const meeting = data.meeting || data;

      if (meeting) {
        setTitle(meeting.title || "Meeting Recording");
        if (meeting.videoUrl) {
          setVideoUrl(meeting.videoUrl);
        } else {
          toast({
            title: "Video Unavailable",
            description: "No video recording was found for this meeting.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
      toast({
        title: "Error",
        description: "Failed to load meeting details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/meetings/${id}`)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summary
          </Button>
          <h1 className="text-2xl font-bold font-playfair truncate max-w-2xl">{title}</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Full Screen Video Player */}
        <div className="relative aspect-video bg-black border border-border rounded-xl overflow-hidden shadow-soft flex items-center justify-center">

          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-white" />
              <p className="text-white">Loading video...</p>
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center text-white">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg">Video not found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
