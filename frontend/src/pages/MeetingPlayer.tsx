import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function MeetingPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold font-playfair">Meeting Recording</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Full Screen Video Player */}
        <div className="relative aspect-video bg-background border border-border rounded-xl overflow-hidden shadow-soft">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Play className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Video player placeholder</p>
              <p className="text-sm text-muted-foreground mt-2">Recording playback will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
