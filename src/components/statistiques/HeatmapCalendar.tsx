import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HeatmapCalendarProps {
  data: { date: string; count: number }[];
  isLoading?: boolean;
}

export function HeatmapCalendar({ data, isLoading }: HeatmapCalendarProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📅 Calendrier - Heatmap des oublis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-shimmer rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 6);
  const weekdayLabels: [string, string, string, string, string, string, string] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const periodLabel = `${format(threeMonthsAgo, 'dd MMM', { locale: fr })} → ${format(today, 'dd MMM', { locale: fr })}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Calendrier - Heatmap des oublis</CardTitle>
        <p className="text-sm text-[var(--text-secondary)]">Vue des 90 derniers jours. Survolez une case pour voir le détail.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
          <span>Période : {periodLabel}</span>
          <span>Survolez une case pour détails</span>
        </div>

        <div className="heatmap-container overflow-x-auto">
          <div className="heatmap-frame">
            <CalendarHeatmap
              startDate={threeMonthsAgo}
              endDate={today}
              values={data}
              gutterSize={1}
              classForValue={(value) => {
                if (!value || value.count === 0) {
                  return 'color-empty';
                }
                if (value.count >= 25) {
                  return 'color-scale-4';
                }
                if (value.count >= 15) {
                  return 'color-scale-3';
                }
                if (value.count >= 5) {
                  return 'color-scale-2';
                }
                return 'color-scale-1';
              }}
              weekdayLabels={weekdayLabels}
              showWeekdayLabels
              transformDayElement={(rect) => (
                <rect
                  {...rect}
                  width={8}
                  height={8}
                  rx={2}
                  ry={2}
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}