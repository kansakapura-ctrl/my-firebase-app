'use client';

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
import { TimeAgo } from '@/components/time-ago';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Log } from '@/lib/data';
import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function LogsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const logsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'logs'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: logs, loading } = useCollection<Log>(logsQuery);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Execution Logs</h1>
        <p className="text-muted-foreground">
          Review detailed logs of each AI agent&apos;s actions.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="w-[30%]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && logs?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No logs found. Run an agent to see its execution logs.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                logs?.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/agents/${log.agentId}`}
                        className="hover:underline"
                      >
                        {log.agentName}
                      </Link>
                    </TableCell>
                    <TableCell>{log.taskName}</TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge
                          variant="secondary"
                          className="text-green-600 border-green-200"
                        >
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failure</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TimeAgo date={log.timestamp} />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.details}
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
