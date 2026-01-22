import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
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
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Calendrier - Heatmap des oublis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="heatmap-container">
          <CalendarHeatmap
            startDate={threeMonthsAgo}
            endDate={today}
            values={data}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return 'color-empty';
              }
              if (value.count <= 5) {
                return 'color-scale-1';
              }
              if (value.count <= 10) {
                return 'color-scale-2';
              }
              if (value.count <= 15) {
                return 'color-scale-3';
              }
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value: any) => {
              if (!value || !value.date) {
                return {};
              }
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${format(new Date(value.date), 'dd MMMM yyyy', { locale: fr })}: ${value.count || 0} oublis`,
              };
            }}
            showWeekdayLabels
          />
          <ReactTooltip id="heatmap-tooltip" />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-sm text-[var(--text-secondary)]">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="w-4 h-4 rounded bg-violet-200 dark:bg-violet-900" />
            <div className="w-4 h-4 rounded bg-violet-400 dark:bg-violet-700" />
            <div className="w-4 h-4 rounded bg-violet-600 dark:bg-violet-500" />
            <div className="w-4 h-4 rounded bg-violet-800 dark:bg-violet-400" />
          </div>
          <span>Plus</span>
        </div>
      </CardContent>
    </Card>
  );
}