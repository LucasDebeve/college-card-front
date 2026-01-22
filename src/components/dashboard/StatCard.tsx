import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  variant?: 'default' | 'warning' | 'success';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles = {
  default: 'from-violet-500 to-purple-600',
  warning: 'from-orange-500 to-amber-600',
  success: 'from-green-500 to-emerald-600',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'default',
  trend
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:hover:shadow-violet-900/20 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className={cn(
                "text-5xl font-bold font-mono bg-gradient-to-br bg-clip-text text-transparent",
                variantStyles[variant]
              )}>
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-sm font-semibold",
                  trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-full p-3 bg-gradient-to-br shadow-lg dark:shadow-md",
            variantStyles[variant]
          )}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}