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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { submitFeedbackAction } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquarePlus } from 'lucide-react';

const formSchema = z.object({
  type: z.enum(['review', 'issue', 'bug', 'feature_request']),
  comment: z.string().min(10, {
    message: 'Feedback must be at least 10 characters.',
  }),
});

export default function FeedbackPage() {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'review',
      comment: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    const actionResult = await submitFeedbackAction(values);
    setIsPending(false);

    if (actionResult.success) {
      toast({
        title: 'Feedback Submitted!',
        description: 'Thank you for your input.',
      });
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
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Submit Feedback</h1>
        <p className="text-muted-foreground">
          Have a suggestion, bug report, or some feedback? Let us know!
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Your Feedback</CardTitle>
          <CardDescription>
            We appreciate you taking the time to help us improve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="review">General Review</SelectItem>
                        <SelectItem value="issue">Issue/Problem</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature_request">
                          Feature Request
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please be as detailed as possible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                {isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
