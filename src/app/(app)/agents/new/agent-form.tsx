'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { createAgentAction, saveAgentAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Wand2, FileCog, Save } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

type AgentResult = {
  name: string;
  description: string;
  tasks: { name: string; details: string }[];
};

export function AgentForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    setResult(null);
    const actionResult = await createAgentAction(values);
    setIsPending(false);

    if (actionResult.success && actionResult.data) {
      toast({
        title: 'Agent Configuration Generated!',
        description: 'Review the generated agent and save it to continue.',
      });
      setResult(actionResult.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: actionResult.message,
      });
    }
  }

  async function handleSaveAgent() {
    if (!result || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Agent',
        description: 'You must be logged in and have a generated agent configuration.',
      });
      return;
    }

    setIsSaving(true);
    const actionResult = await saveAgentAction({
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      agentConfig: result,
    });
    setIsSaving(false);

    if (actionResult.success && actionResult.data?.agentId) {
      toast({
        title: 'Agent Saved!',
        description: 'Redirecting to your new agent...',
      });
      router.push(`/agents/${actionResult.data.agentId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: actionResult.message,
      });
    }
  }

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Describe Your Agent</CardTitle>
              <CardDescription>
                Provide a detailed, natural language description of the
                automation agent you want to create.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'An agent that checks my inbox for new customer support tickets and categorizes them based on keywords like 'billing', 'bug', or 'feature request'.'"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Our AI will use this prompt to configure your new agent.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending || !!result}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isPending ? 'Generating...' : 'Generate Agent Configuration'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generated Agent Configuration</CardTitle>
            <CardDescription>
              This is a starting point for your agent. You can save it to
              continue or discard it to generate a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-foreground">Name:</p>
              <p>{result.name}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Description:</p>
              <p>{result.description}</p>
            </div>

            {result.tasks && result.tasks.length > 0 && (
              <div>
                <p className="font-semibold text-foreground">Initial Tasks:</p>
                <div className="mt-2 space-y-4">
                  {result.tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-accent/10 text-accent-foreground p-2 rounded-full">
                        <FileCog className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{task.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {task.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSaveAgent} disabled={isSaving || !user}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Agent'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                form.reset();
              }}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
