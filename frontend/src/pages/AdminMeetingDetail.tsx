import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Download, Share2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingReport } from "@/components/MeetingReport";

export default function AdminMeetingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Layout>
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-playfair mb-2">Coffee Chat ☕</h1>
              <p className="text-muted-foreground">Hosted by Sarah Chen • January 20, 2024 • 45 minutes</p>
            </div>
            <Badge>Completed</Badge>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate(`/admin/meetings/${id}/play`)}>
              <Play className="mr-2 h-4 w-4" />
              Play Recording
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Summary
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <MeetingReport />
      </div>
    </Layout>
  );
}
