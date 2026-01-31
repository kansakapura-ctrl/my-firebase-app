import { AgentForm } from './agent-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function NewAgentPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'new-agent-hero');

  return (
    <div className="space-y-8">
      <div className="relative w-full h-64 rounded-lg overflow-hidden border">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Bring Your Automations to Life
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Describe your ideal agent, and let our AI handle the rest. From
            simple tasks to complex workflows, your words are the blueprint.
          </p>
        </div>
      </div>
      <AgentForm />
    </div>
  );
}
