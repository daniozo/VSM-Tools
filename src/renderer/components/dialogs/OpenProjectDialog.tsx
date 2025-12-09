/**
 * OpenProjectDialog - Dialogue pour ouvrir un projet existant
 * 
 * Fonctionnalités :
 * - Liste tous les projets disponibles dans la base de données
 * - Affichage des métadonnées (nom, description, dates)
 * - Sélection et ouverture d'un projet
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Badge } from '@/renderer/components/ui/badge';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
import { Loader2, Search, FolderOpen, Calendar, FileText } from 'lucide-react';
import type { Project } from '@/services/api';

interface OpenProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  isLoading: boolean;
  onSelectProject: (project: Project) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const OpenProjectDialog: React.FC<OpenProjectDialogProps> = ({
  open,
  onOpenChange,
  projects,
  isLoading,
  onSelectProject,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  // Rafraîchir la liste lors de l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      onRefresh();
      setSelectedProject(null);
      setSearchQuery('');
    }
  }, [open, onRefresh]);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  const handleOpenProject = async () => {
    if (!selectedProject) return;

    setIsOpening(true);
    try {
      await onSelectProject(selectedProject);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du projet:', error);
    } finally {
      setIsOpening(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Ouvrir un Projet VSM</DialogTitle>
          <DialogDescription>
            Sélectionnez un projet existant dans la base de données.
          </DialogDescription>
        </DialogHeader>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des projets */}
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Aucun projet trouvé' : 'Aucun projet disponible'}
              </p>
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Créez votre premier projet pour commencer
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedProject?.id === project.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {project.name}
                        </h3>
                        {selectedProject?.id === project.id && (
                          <Badge variant="default" className="text-xs">
                            Sélectionné
                          </Badge>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Créé le {formatDate(project.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>Modifié le {formatDate(project.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleOpenProject}
            disabled={!selectedProject || isOpening}
          >
            {isOpening && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ouvrir le Projet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
