import { cn } from '@/lib/utils';

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-20 h-20 text-2xl',
  lg: 'w-32 h-32 text-4xl',
};

const gradientClasses = [
  'avatar-gradient-1', // Violet
  'avatar-gradient-2', // Vert
  'avatar-gradient-3', // Bleu
  'avatar-gradient-4', // Orange
  'avatar-gradient-5', // Rose
  'avatar-gradient-6', // Indigo
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getAvatarGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientClasses[hash % gradientClasses.length];
}

export function Avatar({ firstName, lastName, size = 'md', className }: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  const gradient = getAvatarGradient(`${firstName} ${lastName}`);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        'text-white font-bold shadow-lg select-none',
        sizeClasses[size],
        gradient,
        className
      )}
    >
      {initials}
    </div>
  );
}