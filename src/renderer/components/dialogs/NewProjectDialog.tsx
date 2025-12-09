/**
 * NewProjectDialog - Dialogue pour créer un nouveau projet
 * 
 * Fonctionnalités :
 * - Création d'un projet vide
 * - Import d'un projet depuis un fichier VSMX
 */

import React, { useState } from 'react';
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
import { Label } from '@/renderer/components/ui/label';
import { Textarea } from '@/renderer/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/renderer/components/ui/tabs';
import { FolderPlus, FileUp, Loader2 } from 'lucide-react';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, description?: string) => Promise<void>;
  onImportVSMX: (file: File, projectName: string, description?: string) => Promise<void>;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject,
  onImportVSMX,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'import'>('create');
  const [isLoading, setIsLoading] = useState(false);

  // État pour création
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // État pour import
  const [importProjectName, setImportProjectName] = useState('');
  const [importProjectDescription, setImportProjectDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setImportProjectName('');
    setImportProjectDescription('');
    setSelectedFile(null);
    setActiveTab('create');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateProject(projectName.trim(), projectDescription.trim() || undefined);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.vsmx')) {
      setSelectedFile(file);
      // Préremplir le nom du projet avec le nom du fichier (sans extension)
      if (!importProjectName) {
        const nameWithoutExt = file.name.replace('.vsmx', '');
        setImportProjectName(nameWithoutExt);
      }
    } else {
      alert('Veuillez sélectionner un fichier .vsmx valide');
      event.target.value = '';
    }
  };

  const handleImportProject = async () => {
    if (!selectedFile || !importProjectName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onImportVSMX(
        selectedFile,
        importProjectName.trim(),
        importProjectDescription.trim() || undefined
      );
      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'import du projet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Projet VSM</DialogTitle>
          <DialogDescription>
            Créez un nouveau projet vide ou importez un projet depuis un fichier VSMX.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'import')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Créer un Projet
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <FileUp className="h-4 w-4" />
              Importer VSMX
            </TabsTrigger>
          </TabsList>

          {/* Onglet Créer */}
          <TabsContent value="create" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nom du Projet *</Label>
              <Input
                id="project-name"
                placeholder="Ex: Ligne de Production A"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optionnel)</Label>
              <Textarea
                id="project-description"
                placeholder="Description du projet VSM..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Onglet Importer */}
          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="vsmx-file">Fichier VSMX *</Label>
              <div className="flex gap-2">
                <Input
                  id="vsmx-file"
                  type="file"
                  accept=".vsmx"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Fichier sélectionné: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-project-name">Nom du Projet *</Label>
              <Input
                id="import-project-name"
                placeholder="Ex: Ligne de Production A"
                value={importProjectName}
                onChange={(e) => setImportProjectName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-project-description">Description (optionnel)</Label>
              <Textarea
                id="import-project-description"
                placeholder="Description du projet VSM..."
                value={importProjectDescription}
                onChange={(e) => setImportProjectDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                onClick={handleImportProject}
                disabled={!selectedFile || !importProjectName.trim() || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importer le Projet
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
