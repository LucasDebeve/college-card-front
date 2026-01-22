import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClassChartProps {
  data: { name: string; count: number }[];
  isLoading?: boolean;
}

const COLORS = [
  '#7C3AED', // Violet
  '#10B981', // Vert
  '#3B82F6', // Bleu
  '#F59E0B', // Orange
  '#EC4899', // Rose
  '#6366F1', // Indigo
];

export function ClassChart({ data, isLoading }: ClassChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Oublis par classe</CardTitle>
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
        <CardTitle>📊 Oublis par classe</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--text-secondary)]">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
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
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}