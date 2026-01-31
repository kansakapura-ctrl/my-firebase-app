'use client';
import Link from 'next/link';
import {
  Plus,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TimeAgo } from '@/components/time-ago';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Agent } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';

export default function AgentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const agentsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'agents'), where('uid', '==', user.uid));
  }, [firestore, user]);

  const { data: agents, loading } = useCollection<Agent>(agentsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">My Agents</h1>
          <p className="text-muted-foreground">
            Manage your personal AI agents and create new ones.
          </p>
        </header>
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && agents?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No agents created yet.
                    <Button asChild variant="link" className="ml-1">
                      <Link href="/agents/new">Create one!</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                agents?.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
                        <div>
                          <Link
                            href={`/agents/${agent.id}`}
                            className="hover:underline"
                          >
                            {agent.name}
                          </Link>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agent.status === 'active' && (
                        <Badge variant="secondary">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />{' '}
                          Active
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
                    </TableCell>
                    <TableCell>{agent.tasksCompleted}</TableCell>
                    <TableCell>
                      <TimeAgo date={agent.lastRun} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/agents/${agent.id}`}>Configure</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Run Now</DropdownMenuItem>
                          <DropdownMenuItem>View Logs</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
