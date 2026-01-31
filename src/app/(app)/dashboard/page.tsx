'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  Wand2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { summarizeFeedbackAction } from './actions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { TimeAgo } from '@/components/time-ago';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Agent } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, limit } from 'firebase/firestore';

function getPlaceholderImage(id: string) {
  return PlaceHolderImages.find(img => img.id === id);
}

function AgentCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-5 w-5" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const agentsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'agents'),
      where('uid', '==', user.uid),
      limit(3)
    );
  }, [firestore, user]);

  const { data: agents, loading: agentsLoading } = useCollection<Agent>(agentsQuery);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    const result = await summarizeFeedbackAction();
    setIsSummarizing(false);

    if (result.success && result.data) {
      setSummary(result.data);
      toast({
        title: 'Feedback Summarized!',
        description: 'The AI has analyzed all user feedback.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          A high-level overview of your AI automation agents.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary" />
            Feedback Analysis Agent
          </CardTitle>
          <CardDescription>
            Use AI to analyze and summarize all user feedback from the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSummarize} disabled={isSummarizing}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isSummarizing ? 'Analyzing Feedback...' : 'Generate Summary'}
          </Button>

          {summary && (
            <Alert className="mt-4">
              <AlertTitle>AI Feedback Summary</AlertTitle>
              <AlertDescription className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                <pre className="text-xs bg-muted p-3 rounded-md font-mono whitespace-pre-wrap">
                  {summary}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">My Recent Agents</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {agentsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))
          : agents?.map(agent => {
              const placeholder = getPlaceholderImage(agent.avatar);
              return (
                <Link href={`/agents/${agent.id}`} key={agent.id}>
                  <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">
                        {agent.name}
                      </CardTitle>
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          {placeholder && (
                            <AvatarImage
                              src={placeholder.imageUrl}
                              alt={placeholder.description}
                              data-ai-hint={placeholder.imageHint}
                            />
                          )}
                          <AvatarFallback>
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {agent.description}
                          </p>
                          <div className="flex items-center pt-2">
                            {agent.status === 'active' && (
                              <Badge variant="secondary">
                                <CheckCircle className="mr-1 h-3 w-3" /> Active
                              </Badge>
                            )}
                            {agent.status === 'inactive' && (
                              <Badge variant="outline">
                                <Clock className="mr-1 h-3 w-3" /> Inactive
                              </Badge>
                            )}
                            {agent.status === 'error' && (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" /> Error
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Tasks completed:</span>
                          <span className="font-semibold text-foreground">
                            {agent.tasksCompleted}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last run:</span>
                          <span className="font-semibold text-foreground">
                            <TimeAgo date={agent.lastRun} />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        { !agentsLoading && agents?.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3 flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">You haven't created any agents yet.</p>
              <Button asChild variant="link">
                <Link href="/agents/new">Create your first agent!</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
