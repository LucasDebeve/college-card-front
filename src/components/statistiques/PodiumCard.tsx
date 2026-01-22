import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import type { TopStudent } from '@/types';
import { cn } from '@/lib/utils';

interface PodiumCardProps {
  students: TopStudent[];
  isLoading?: boolean;
}

const medals = ['🥇', '🥈', '🥉'];

const podiumHeights = {
  0: 'h-60', // 1er
  1: 'h-52', // 2ème
  2: 'h-48', // 3ème
};

const podiumColors = {
  0: 'from-yellow-400 to-orange-500',
  1: 'from-gray-300 to-gray-500',
  2: 'from-orange-400 to-amber-600',
};

export function PodiumCard({ students, isLoading }: PodiumCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            🥇 PODIUM DES ÉLÈVES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-shimmer rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Réorganiser pour afficher 2ème, 1er, 3ème
  const orderedStudents = students.length >= 3 
    ? [students[1], students[0], students[2]]
    : students;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          🥇 PODIUM DES ÉLÈVES
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-[var(--text-secondary)]">
              Aucune donnée disponible pour cette période
            </p>
          </div>
        ) : (
          <div className="flex items-end justify-center gap-8 pt-8">
            {orderedStudents.map((student, displayIndex) => {
              // Index réel (0=1er, 1=2ème, 2=3ème)
              const realIndex = displayIndex === 1 ? 0 : displayIndex === 0 ? 1 : 2;
              const height = podiumHeights[realIndex as keyof typeof podiumHeights];
              const gradient = podiumColors[realIndex as keyof typeof podiumColors];

              return (
                <div key={student.student_id} className="flex flex-col items-center">
                  {/* Medal */}
                  <div className="text-5xl mb-2">{medals[realIndex]}</div>

                  {/* Avatar */}
                  <Avatar
                    firstName={student.student_name.split(' ')[0]}
                    lastName={student.student_name.split(' ')[1] || ''}
                    size="md"
                    className="mb-4"
                  />

                  {/* Podium */}
                  <div
                    className={cn(
                      'w-44 rounded-t-2xl bg-gradient-to-br shadow-xl flex flex-col items-center justify-center text-white transition-transform hover:scale-105',
                      height,
                      gradient
                    )}
                  >
                    <div className="text-5xl font-bold font-mono mb-2">
                      {student.forgot_count}
                    </div>
                    <div className="text-sm opacity-90">oublis</div>
                  </div>

                  {/* Student Info */}
                  <div className="text-center mt-4">
                    <div className="font-bold text-[var(--text-primary)]">
                      {student.student_name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      ({student.student_class})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}