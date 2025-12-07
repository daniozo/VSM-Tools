import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/shared/components/ui/IconButton';

/**
 * Exemple d'utilisation des composants shadcn/ui dans VSM-Tools
 * Démonstration de l'intégration avec notre système de design
 */
export const ShadcnExampleCard: React.FC = () => {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configuration VSM
          <IconButton
            icon="Settings"
            variant="ghost"
            size="sm"
          />
        </CardTitle>
        <CardDescription>
          Configurez les paramètres de votre cartographie des flux de valeur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="project-name" className="text-sm font-medium">
            Nom du projet
          </label>
          <Input
            id="project-name"
            placeholder="Entrez le nom du projet"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="default" size="sm">
            Sauvegarder
          </Button>
          <Button variant="outline" size="sm">
            Annuler
          </Button>
          <IconButton
            icon="Trash2"
            variant="destructive"
            size="sm"
            title="Supprimer le projet"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ShadcnExampleCard;
