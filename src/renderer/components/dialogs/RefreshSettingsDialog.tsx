/**
 * RefreshSettingsDialog - Configuration des intervalles de rafraîchissement
 * 
 * Permet à l'utilisateur de configurer :
 * - L'intervalle de polling pour les données dynamiques
 * - L'activation/désactivation du rafraîchissement automatique
 * - L'affichage du dernier rafraîchissement
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RefreshCw, Clock, Zap } from 'lucide-react';

interface RefreshSettings {
  enabled: boolean;
  intervalSeconds: number;
}

interface RefreshSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: RefreshSettings;
  onSave: (settings: RefreshSettings) => void;
  lastRefresh?: Date;
  isRefreshing?: boolean;
}

const INTERVAL_OPTIONS = [
  { value: 10, label: '10 secondes', description: 'Très fréquent' },
  { value: 30, label: '30 secondes', description: 'Recommandé' },
  { value: 60, label: '1 minute', description: 'Modéré' },
  { value: 120, label: '2 minutes', description: 'Léger' },
  { value: 300, label: '5 minutes', description: 'Rare' },
  { value: 600, label: '10 minutes', description: 'Très rare' }
];

export const RefreshSettingsDialog: React.FC<RefreshSettingsDialogProps> = ({
  open,
  onOpenChange,
  currentSettings,
  onSave,
  lastRefresh,
  isRefreshing = false
}) => {
  const [enabled, setEnabled] = useState(currentSettings.enabled);
  const [intervalSeconds, setIntervalSeconds] = useState(currentSettings.intervalSeconds);

  const handleSave = () => {
    onSave({ enabled, intervalSeconds });
    onOpenChange(false);
  };

  const getTimeSinceRefresh = () => {
    if (!lastRefresh) return 'Jamais';
    
    const seconds = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    
    if (seconds < 60) return `Il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(seconds / 3600)} heure${Math.floor(seconds / 3600) > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
            Configuration du Rafraîchissement
          </DialogTitle>
          <DialogDescription>
            Configurez la fréquence de mise à jour automatique des données dynamiques
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* État actuel */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-sm">Dernier rafraîchissement</span>
            </div>
            <span className="text-sm font-medium">
              {getTimeSinceRefresh()}
            </span>
          </div>

          {/* Activation/Désactivation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base font-medium">
                Rafraîchissement automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                Met à jour les indicateurs et stocks dynamiques automatiquement
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Intervalle */}
          {enabled && (
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-base font-medium">
                Intervalle de rafraîchissement
              </Label>
              <Select
                value={intervalSeconds.toString()}
                onValueChange={(value) => setIntervalSeconds(parseInt(value))}
              >
                <SelectTrigger id="interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          ({option.description})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Avertissement pour intervalles courts */}
              {intervalSeconds < 30 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                  <Zap size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Un intervalle court peut augmenter la charge sur vos systèmes externes.
                    Recommandé : 30 secondes ou plus.
                  </p>
                </div>
              )}

              {/* Information */}
              <p className="text-xs text-muted-foreground">
                Les données seront rafraîchies toutes les {intervalSeconds} secondes
                pour tous les indicateurs et stocks en mode "Dynamique".
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
