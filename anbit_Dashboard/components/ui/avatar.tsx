import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100',
        className,
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
};

