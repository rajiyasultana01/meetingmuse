import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function AdminMeetingPlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Layout>
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/meetings/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meeting Details
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Coffee Chat ☕</h1>
          <p className="text-muted-foreground">Recording Playback</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-soft">
              <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-primary" />
                    ) : (
                      <Play className="w-10 h-10 text-primary ml-1" />
                    )}
                  </div>
                  <p className="text-muted-foreground">Recording Player</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>15:45</span>
                  <span>45:00</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-bold font-playfair mb-4">Transcript</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {[
                  { time: "00:15", speaker: "Sarah", text: "Let's start with the dashboard redesign discussion." },
                  { time: "00:45", speaker: "Mike", text: "I've prepared some initial mockups to share." },
                  { time: "01:20", speaker: "Emma", text: "The analytics requirements are crucial for Q1." },
                  { time: "02:10", speaker: "Sarah", text: "Great points. Let's dive into the details." },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                      <span className="text-sm font-semibold">{item.speaker}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
