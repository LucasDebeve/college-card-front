import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HistoriqueFiltersProps {
  filters: {
    startDate?: Date;
    endDate?: Date;
    class?: string;
    student?: string;
    noteSent?: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function HistoriqueFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: HistoriqueFiltersProps) {
  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Filtres
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Start */}
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? (
                  format(filters.startDate, 'dd/MM/yyyy', { locale: fr })
                ) : (
                  <span>Choisir...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => onFiltersChange({ ...filters, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date End */}
        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? (
                  format(filters.endDate, 'dd/MM/yyyy', { locale: fr })
                ) : (
                  <span>Choisir...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => onFiltersChange({ ...filters, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Class */}
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select
            value={filters.class}
            onValueChange={(value) => onFiltersChange({ ...filters, class: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              <SelectItem value="6A">6A</SelectItem>
              <SelectItem value="6B">6B</SelectItem>
              <SelectItem value="5A">5A</SelectItem>
              <SelectItem value="5B">5B</SelectItem>
              <SelectItem value="4A">4A</SelectItem>
              <SelectItem value="4B">4B</SelectItem>
              <SelectItem value="3A">3A</SelectItem>
              <SelectItem value="3B">3B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Note Sent */}
        <div className="space-y-2">
          <Label>Mot envoyé</Label>
          <Select
            value={filters.noteSent}
            onValueChange={(value) => onFiltersChange({ ...filters, noteSent: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="yes">Oui</SelectItem>
              <SelectItem value="no">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}