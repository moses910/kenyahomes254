import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapsLinkProps {
  href: string;
  /**
   * The accessible name. It must contain the visible text, otherwise a speech
   * input user saying what they see cannot activate the link.
   */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * The one way the app leaves for Google Maps. Keeping the anchor, the new-tab
 * semantics and the trailing icon in a single place stops the header link and
 * the map caption link from drifting apart.
 */
export default function MapsLink({ href, label, children, className }: MapsLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline',
        className,
      )}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
