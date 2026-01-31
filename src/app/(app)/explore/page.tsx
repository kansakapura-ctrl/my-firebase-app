'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, Download, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useMemo, useTransition } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Agent } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { downloadAgentAction } from './actions';
import { useToast } from '@/hooks/use-toast';

function getPlaceholderImage(id: string) {
  return PlaceHolderImages.find(img => img.id === id);
}

function AgentCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDownloading, startDownloadTransition] = useTransition();

  const placeholder = getPlaceholderImage(agent.avatar);
  const isOwner = user?.uid === agent.uid;

  const handleDownload = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to download an agent.',
      });
      return;
    }

    startDownloadTransition(async () => {
      const result = await downloadAgentAction({
        agentId: agent.id,
        uid: user.uid,
      });

      if (result.success) {
        toast({
          title: 'Agent Downloaded!',
          description: `"${agent.name}" has been added to your agents.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Download Failed',
          description: result.message,
        });
      }
    });
  };

  return (
    <Card className="flex flex-col transition-all hover:border-primary/50 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {placeholder && (
              <AvatarImage
                src={placeholder.imageUrl}
                alt={placeholder.description}
                data-ai-hint={placeholder.imageHint}
              />
            )}
            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-medium hover:underline">
              <Link href={`/agents/${agent.id}`}>{agent.name}</Link>
            </CardTitle>
            <CardDescription>
              By {agent.authorDisplayName || 'Anonymous'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {agent.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{agent.downloads || 0}</span>
          </div>
          {/* Placeholder for rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>-</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading || isOwner || !user}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading
            ? 'Downloading...'
            : isOwner
            ? 'This is your agent'
            : 'Download'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ExplorePage() {
  const firestore = useFirestore();

  const publicAgentsQuery = useMemo(() => {
    return query(
      collection(firestore, 'agents'),
      where('isPublic', '==', true)
    );
  }, [firestore]);

  const { data: agents, loading: agentsLoading } =
    useCollection<Agent>(publicAgentsQuery);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Explore Agents</h1>
        <p className="text-muted-foreground">
          Discover and download AI agents created by the community.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {agentsLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <AgentCardSkeleton key={i} />
          ))}

        {!agentsLoading &&
          agents?.map(agent => <AgentCard key={agent.id} agent={agent} />)}
        {!agentsLoading && agents?.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3 flex items-center justify-center py-12">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No Public Agents Yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to publish an agent!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
