import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className='flex flex-col items-center justify-center py-12'>
        <Icon className='h-12 w-12 text-gray-400 mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
        <p className='text-gray-600 text-center mb-4'>{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant='outline'>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
