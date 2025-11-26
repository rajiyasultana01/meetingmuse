import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Play, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingReport } from "@/components/MeetingReport";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Meeting = Tables<'meetings'>;
type Transcript = Tables<'transcripts'>;
type Summary = Tables<'summaries'>;

interface MeetingData extends Meeting {
  transcripts?: Transcript | null;
  summaries?: Summary | null;
}

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMeetingData();
    }
  }, [id]);

  const fetchMeetingData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          transcripts(*),
          summaries(*)
        `)
        .eq('id', id!)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Meeting not found');
        return;
      }

      setMeeting(data as any);
    } catch (err: any) {
      console.error('Error fetching meeting:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load meeting details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meeting details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !meeting) {
    return (
      <Layout>
        <div className="p-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Meeting Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || 'This meeting does not exist or you do not have access to it.'}</p>
            <Button onClick={() => navigate("/meetings")} className="rounded-xl">
              ← Back to Meetings
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'completed': 'bg-green-500',
      'processing': 'bg-blue-500',
      'transcribing': 'bg-yellow-500',
      'summarizing': 'bg-purple-500',
      'failed': 'bg-red-500',
      'uploaded': 'bg-gray-500'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-500'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const summary = meeting.summaries as any;
  const transcript = meeting.transcripts as any;

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold">{meeting.title}</h1>
            {getStatusBadge(meeting.status)}
          </div>
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(meeting.created_at)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDuration(meeting.duration_seconds)}
            </span>
            {summary?.participants && summary.participants.length > 0 && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {summary.participants.length} participants
              </span>
            )}
          </div>
          {summary?.topics && summary.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {meeting.video_url && meeting.status === 'completed' && (
            <Button
              onClick={() => navigate(`/meetings/${id}/play`)}
              className="rounded-xl mt-4"
            >
              <Play className="h-4 w-4 mr-2" />
              Watch Recording
            </Button>
          )}
        </div>

        {/* Processing Status */}
        {meeting.status !== 'completed' && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <div>
                <h3 className="font-semibold">Processing in progress...</h3>
                <p className="text-sm text-muted-foreground">
                  {meeting.status === 'transcribing' && 'Extracting transcript from video...'}
                  {meeting.status === 'summarizing' && 'Generating AI summary...'}
                  {meeting.status === 'processing' && 'Processing your meeting...'}
                  {meeting.status === 'uploaded' && 'Waiting to start processing...'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Status */}
        {meeting.status === 'failed' && (
          <Card className="p-6 mb-6 border-destructive">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Processing Failed</h3>
                <p className="text-sm text-muted-foreground">
                  {meeting.error_message || 'An error occurred while processing this meeting.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Meeting Report */}
        {meeting.status === 'completed' && summary && transcript && (
          <MeetingReport
            summary={summary.summary_text}
            actionItems={summary.action_items?.map((item: string) => ({
              time: '0:00',
              description: item
            })) || []}
            metrics={{
              readScore: 78,
              engagement: 76,
              sentiment: summary.sentiment === 'positive' ? 85 : summary.sentiment === 'negative' ? 50 : 70
            }}
            transcript={transcript.cleaned_transcript || transcript.raw_transcript}
          />
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/meetings")}
            className="rounded-xl"
          >
            ← Back to Meetings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
