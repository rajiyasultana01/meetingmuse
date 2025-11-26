import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Sparkles, Clock } from "lucide-react";

interface MeetingReportProps {
  summary?: string;
  transcript?: string | null;
  chapters?: Array<{
    time: string;
    title: string;
    description: string;
    bullets?: string[];
  }>;
  actionItems?: Array<{
    time: string;
    description: string;
    assignee?: string;
  }>;
  keyQuestions?: Array<{
    time: string;
    question: string;
    proposedAnswer: string;
  }>;
  metrics?: {
    readScore: number;
    engagement: number;
    sentiment: number;
  };
}

export function MeetingReport({
  summary = "The discussion focused on the ongoing development of the system, particularly the image services and the status of the front and back end. Rajya Sultana reported on the progress of the development cluster, while MD Rakib Hossain highlighted that the front end is advancing, but the back end is incomplete and requires a load balancer, with plans for two—one for production and one for development. Andreas Öhrvall suggested that the front end might eventually operate as a static website without a load balancer, but emphasized the need for a fully operational back end with its own load balancer for proper functionality...",
  transcript = null,
  chapters = [
    {
      time: "0:01",
      title: "System Update and Load Balancer Discussion",
      description: "Rajya Sultana launched her screen to show the development cluster of the system, which is currently running with updated image services. MD. Rakib Hossain confirmed that while the front end is being worked on, the back end is not yet completed and requires a load balancer. Andreas Öhrvall suggested that over time, the front end might not need a load balancer if it operates as a static website.",
      bullets: [
        "System update and load balancer setup"
      ]
    },
    {
      time: "8:06",
      title: "System Update and Cost Management",
      description: "Stephen Biswas shared insights from a system update, highlighting billing details and AWS forecasts, which indicate a daily cost of around $7,012. He mentioned that the highest daily expense recorded was $50, which is considered normal for ongoing testing. Andreas Öhrvall advised that close communication with Khalid is essential to keep track of these costs and suggested daily checks of the portal to prevent unexpected charges.",
      bullets: [
        "Communication regarding billing details"
      ]
    }
  ],
  actionItems = [
    { time: "5:53", description: "MD. Rakib Hossain will update the system to include a load balancer for the back end.", assignee: "MD. Rakib Hossain" },
    { time: "9:49", description: "Rajya Sultana will communicate closely with Khalid regarding the billing details to ensure he is aware of all costs.", assignee: "Rajya Sultana" },
    { time: "14:28", description: "Rajya Sultana will work on connecting the back end environment to ensure the system functions end-to-end.", assignee: "Rajya Sultana" }
  ],
  keyQuestions = [
    {
      time: "5:06",
      question: "Is the front end expected to require a load balancer in the future?",
      proposedAnswer: "The front end might not need a load balancer over time."
    },
    {
      time: "8:22",
      question: "How will the team ensure that Khalid is informed about the billing details?",
      proposedAnswer: "Rajya Sultana will communicate closely with Khalid regarding the costs."
    }
  ],
  metrics = {
    readScore: 78,
    engagement: 76,
    sentiment: 81
  }
}: MeetingReportProps) {
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({});
  const [descriptionsEnabled, setDescriptionsEnabled] = useState(true);

  const toggleChapter = (index: number) => {
    setOpenChapters(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(142 76% 36%)";
    if (score >= 60) return "hsl(47 96% 53%)";
    return "hsl(0 84% 60%)";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "GOOD";
    if (score >= 60) return "OKAY";
    return "NEEDS WORK";
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Read Score</span>
            <span className="text-2xl font-bold">{metrics.readScore}</span>
            <span className="text-xs" style={{ color: getScoreColor(metrics.readScore) }}>
              {getScoreLabel(metrics.readScore)}
            </span>
          </div>
          <Progress value={metrics.readScore} className="h-1" />
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Engagement</span>
            <span className="text-2xl font-bold">{metrics.engagement}</span>
            <span className="text-xs" style={{ color: getScoreColor(metrics.engagement) }}>
              {getScoreLabel(metrics.engagement)}
            </span>
          </div>
          <Progress value={metrics.engagement} className="h-1" />
        </div>
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Sentiment</span>
            <span className="text-2xl font-bold">{metrics.sentiment}</span>
            <span className="text-xs" style={{ color: getScoreColor(metrics.sentiment) }}>
              {getScoreLabel(metrics.sentiment)}
            </span>
          </div>
          <Progress value={metrics.sentiment} className="h-1" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
          <TabsTrigger 
            value="notes" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Notes
          </TabsTrigger>
          <TabsTrigger 
            value="transcript"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger 
            value="deep-dive"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Deep Dive
          </TabsTrigger>
          <TabsTrigger 
            value="coaching"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Coaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6 space-y-6">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Summary
              </h3>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Personalize Summary
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Chapters & Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Chapters & Topics
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Descriptions</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-10 p-0"
                  onClick={() => setDescriptionsEnabled(!descriptionsEnabled)}
                >
                  <div className={`w-8 h-4 rounded-full transition-colors ${descriptionsEnabled ? 'bg-foreground' : 'bg-muted'}`}>
                    <div className={`w-3 h-3 rounded-full bg-background transition-transform ${descriptionsEnabled ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`} />
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <Collapsible
                  key={index}
                  open={openChapters[index]}
                  onOpenChange={() => toggleChapter(index)}
                >
                  <div className="border rounded-lg p-4">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-start gap-3">
                        {openChapters[index] ? (
                          <ChevronDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="flex items-start gap-2">
                            <Badge variant="secondary" className="text-xs font-mono">
                              {chapter.time}
                            </Badge>
                            <span className="text-sm font-semibold">{chapter.title}</span>
                          </div>
                          {descriptionsEnabled && !openChapters[index] && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-7">
                      <p className="text-sm text-muted-foreground mb-3">
                        {chapter.description}
                      </p>
                      {chapter.bullets && (
                        <ul className="space-y-1">
                          {chapter.bullets.map((bullet, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="mt-1.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              Action Items
            </h3>
            <div className="space-y-2">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant="secondary" className="text-xs font-mono mt-0.5">
                    {item.time}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{item.description}</p>
                    {item.assignee && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Assignee: {item.assignee}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Questions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
              Key Questions
            </h3>
            <div className="space-y-3">
              {keyQuestions.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {item.time}
                    </Badge>
                    <p className="text-sm font-medium flex-1">{item.question}</p>
                  </div>
                  <div className="ml-7 space-y-2">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3 w-3 mt-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Proposed answer:</span> {item.proposedAnswer}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-xs">📝</span>
                </div>
                Your Notes
              </h3>
              <span className="text-xs text-muted-foreground">Only you can see this</span>
            </div>
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                You did not take any notes in this meeting
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          <Card className="p-6">
            {transcript ? (
              <div className="prose max-w-none">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {transcript}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No transcript available yet. Transcript will appear here once processing is complete.
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="deep-dive" className="mt-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Deep dive analysis will appear here</p>
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="mt-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Coaching insights will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
