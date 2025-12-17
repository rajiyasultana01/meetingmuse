import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Sparkles, Clock, Lightbulb } from "lucide-react";

interface MeetingReportProps {
  summary?: string;
  deepDiveSummary?: string;
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
  keyPoints?: string[];
  coachingTips?: string[];
  metrics?: {
    readScore: number;
    engagement: number;
    sentiment: number;
  };
}

export function MeetingReport({
  summary = "The discussion focused on...",
  deepDiveSummary = "",
  transcript = null,
  chapters = [], // Removed large mock data for brevity in diff, defaults handle it
  actionItems = [],
  keyQuestions = [],
  keyPoints = [],
  coachingTips = [],
  metrics = {
    readScore: 78,
    engagement: 76,
    sentiment: 81
  }
}: MeetingReportProps) {
  // ... (existing state) ...
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
          {chapters && chapters.length > 0 && (
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
          )}

          {/* Action Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              Action Items
            </h3>
            <div className="space-y-2">
              {actionItems.length > 0 ? (
                actionItems.map((item, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No action items detected.</p>
              )}
            </div>
          </div>

          {/* Key Questions */}
          {keyQuestions && keyQuestions.length > 0 && (
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
          )}

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
            {deepDiveSummary && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Deep Dive Analysis
                </h3>
                <div className="prose max-w-none text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {deepDiveSummary}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Key Discussion Points
            </h3>
            {keyPoints && keyPoints.length > 0 ? (
              <ul className="space-y-3">
                {keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No deep dive analysis available yet.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Coaching & Feedback
            </h3>
            {coachingTips && coachingTips.length > 0 ? (
              <ul className="space-y-3">
                {coachingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Coaching insights will appear here soon.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
