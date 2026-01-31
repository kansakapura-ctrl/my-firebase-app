'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Terminal } from 'lucide-react';
import { useState } from 'react';
import { interpretCommandAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/firebase';

const formSchema = z.object({
  command: z.string().min(5, {
    message: 'Command must be at least 5 characters.',
  }),
});

type InterpretationResult = {
  actionableSteps: string;
  validationResult: string;
};

export function NaturalLanguageForm({ agentId }: { agentId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<InterpretationResult | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      command: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    setIsPending(true);
    setResult(null);
    const actionResult = await interpretCommandAction({
      ...values,
      agentId,
      uid: user.uid,
    });
    setIsPending(false);

    if (actionResult.success && actionResult.data) {
      toast({
        title: 'Task Added!',
        description: 'The AI has added a new task to this agent.',
      });
      setResult(actionResult.data);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: actionResult.message,
      });
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="command"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'Check for new emails in the support inbox'"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending || !user} className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending ? 'Adding Task...' : 'Add Task with AI'}
          </Button>
        </form>
      </Form>
      {result && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Last AI Interpretation</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <div>
              <p className="font-semibold text-foreground">Validation:</p>
              <p>{result.validationResult}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Actionable Steps:</p>
              <pre className="text-xs bg-muted p-3 rounded-md font-mono whitespace-pre-wrap">
                {result.actionableSteps}
              </pre>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
