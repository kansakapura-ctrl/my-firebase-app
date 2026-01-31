'use client';

import { useDoc, useUser } from '@/firebase';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Play, Zap, Clock, Plus, FileCog, Share2 } from 'lucide-react';
import { NaturalLanguageForm } from './natural-language-form';
import { type Agent } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useTransition } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { publishAgentAction, runAgentAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

function AgentWorkflowPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <header className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </header>
        <Skeleton className="h-11 w-28" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AgentWorkflowPage({
  params,
}: {
  params: { agentId: string };
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isPublishing, startPublishTransition] = useTransition();
  const [isRunPending, startRunTransition] = useTransition();

  const agentRef = useMemo(
    () => doc(firestore, 'agents', params.agentId),
    [firestore, params.agentId]
  );

  const { data: agent, loading } = useDoc<Agent>(agentRef);

  if (loading) {
    return <AgentWorkflowPageSkeleton />;
  }

  if (!agent) {
    notFound();
  }

  // Mock data for trigger
  const trigger = { type: 'schedule', details: 'Runs every day at 9:00 AM' };

  const handlePublish = async () => {
    if (!user) return;
    startPublishTransition(async () => {
      const result = await publishAgentAction({
        agentId: params.agentId,
        uid: user.uid,
      });
      if (result.success) {
        toast({
          title: 'Agent Published!',
          description: 'Your agent is now visible in the explore page.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Publishing',
          description: result.message,
        });
      }
    });
  };

  const handleRunAgent = async () => {
    if (!user) return;
    startRunTransition(async () => {
      const result = await runAgentAction({
        agentId: params.agentId,
        uid: user.uid,
      });
      if (result.success) {
        toast({
          title: 'Agent Run Finished',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Agent Run Failed',
          description: result.message,
        });
      }
    });
  };

  const isOwner = user?.uid === agent.uid;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <header className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            {agent.isPublic && <Badge variant="secondary">Public</Badge>}
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {agent.description}
          </p>
        </header>
        <div className="flex gap-2">
          {isOwner && !agent.isPublic && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
          <Button
            size="lg"
            className="flex-shrink-0"
            onClick={handleRunAgent}
            disabled={isRunPending}
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunPending ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-primary" /> Workflow
              </CardTitle>
              <CardDescription>
                The sequence of triggers and actions this agent will perform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trigger */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Trigger: On a schedule</h3>
                  <p className="text-muted-foreground text-sm">
                    {trigger.details}
                  </p>
                </div>
              </div>
              <Separator />
              {/* Actions */}
              <div className="space-y-6">
                <h3 className="font-semibold">Actions</h3>
                {agent.tasks?.map((action, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-accent/10 text-accent-foreground p-3 rounded-full">
                      <FileCog className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {action.details}
                      </p>
                    </div>
                  </div>
                ))}
                 {agent.tasks?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No actions defined yet. Add one using AI!
                  </p>
                )}
              </div>

              {isOwner && (
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Action Manually
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Add Action with AI</CardTitle>
                <CardDescription>
                  Describe the next step for this agent in plain English.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NaturalLanguageForm agentId={params.agentId} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
