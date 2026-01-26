import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/shared/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Lock, 
  Sun, 
  Moon, 
  Monitor, 
  Keyboard, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Mot de passe actuel requis'),
  new_password: z.string()
    .min(12, 'Minimum 12 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  new_password_confirm: z.string(),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["new_password_confirm"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilPage() {
  const { user } = useAuthStore();
  const { theme, setTheme, actualTheme } = useThemeStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('new_password', '');

  const passwordValidations = [
    { 
      label: 'Minimum 12 caractères', 
      valid: newPassword.length >= 12 
    },
    { 
      label: 'Au moins 1 majuscule', 
      valid: /[A-Z]/.test(newPassword) 
    },
    { 
      label: 'Au moins 1 chiffre', 
      valid: /[0-9]/.test(newPassword) 
    },
  ];

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data);
      toast.success('Mot de passe modifié', {
        description: 'Votre mot de passe a été mis à jour avec succès',
      });
      setIsPasswordModalOpen(false);
      reset();
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.response?.data?.detail || 'Impossible de modifier le mot de passe',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          👤 Mon Profil
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar
              firstName={user.first_name}
              lastName={user.last_name}
              size="lg"
            />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {user.first_name} {user.last_name}
                </h3>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-2">
                  {user.role === 'admin' ? 'Administrateur' : 'Surveillant'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-secondary)]">Nom d'utilisateur</span>
                  <p className="font-medium text-[var(--text-primary)]">{user.username}</p>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Membre depuis</span>
                  <p className="font-medium text-[var(--text-primary)]">
                    {format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">Dernière connexion</span>
                  <p className="font-medium text-[var(--text-primary)]">
                    {user.last_login 
                      ? format(new Date(user.last_login), 'dd/MM/yyyy à HH:mm', { locale: fr })
                      : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Statistiques personnelles</CardTitle>
          <CardDescription>
            Votre activité sur l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <div className="text-3xl font-bold font-mono text-violet-primary">
                {user?.stats.total_forgot_cards_recorded ?? 0}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Oublis enregistrés au total
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold font-mono text-green-primary">
                {user?.stats.current_week_recorded ?? 0}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Oublis enregistrés cette semaine
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold font-mono text-blue-600">
                {user?.stats.manual_notes_added ?? 0}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Mots ajoutés
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Sécurité</CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Changer mon mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Préférences</CardTitle>
          <CardDescription>
            Personnalisez votre expérience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Mode d'affichage
            </Label>
            <div className="flex gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  theme === 'light' && 'gradient-violet text-white'
                )}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Clair
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  theme === 'dark' && 'gradient-violet text-white'
                )}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Sombre
              </Button>
              <Button
                variant={theme === 'auto' ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  theme === 'auto' && 'gradient-violet text-white'
                )}
                onClick={() => setTheme('auto')}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Auto
              </Button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Thème actuel : {actualTheme === 'dark' ? 'Sombre' : 'Clair'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>🔐 Changer mon mot de passe</DialogTitle>
            <DialogDescription>
              Assurez-vous de choisir un mot de passe sécurisé
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Mot de passe actuel</Label>
              <Input
                id="old_password"
                type="password"
                {...register('old_password')}
                className={errors.old_password ? 'border-red-500' : ''}
              />
              {errors.old_password && (
                <p className="text-sm text-red-500">{errors.old_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <Input
                id="new_password"
                type="password"
                {...register('new_password')}
                className={errors.new_password ? 'border-red-500' : ''}
              />
              
              {/* Password Validations */}
              <div className="space-y-1 mt-2">
                {passwordValidations.map((validation, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      validation.valid ? 'text-green-600' : 'text-gray-500'
                    )}
                  >
                    {validation.valid ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{validation.label}</span>
                  </div>
                ))}
              </div>

              {errors.new_password && (
                <p className="text-sm text-red-500">{errors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirm">Confirmer le nouveau mot de passe</Label>
              <Input
                id="new_password_confirm"
                type="password"
                {...register('new_password_confirm')}
                className={errors.new_password_confirm ? 'border-red-500' : ''}
              />
              {errors.new_password_confirm && (
                <p className="text-sm text-red-500">{errors.new_password_confirm.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  reset();
                }}
                disabled={isChangingPassword}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="gradient-violet text-white"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}