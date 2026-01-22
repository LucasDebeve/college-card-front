import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EvolutionChartProps {
  data: { day: string; count: number }[];
  isLoading?: boolean;
}

export function EvolutionChart({ data, isLoading }: EvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 Évolution hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-shimmer rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Évolution hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--text-secondary)]">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '14px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '14px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={3}
                fill="url(#colorCount)"
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={3}
                dot={{ fill: '#7C3AED', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}