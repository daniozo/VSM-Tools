/**
 * AppMenuBar - Barre de menu pour la version web
 * 
 * Fournit les mêmes fonctionnalités que le menu natif Electron
 * mais dans une interface web avec des menus déroulants.
 */

import React from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/renderer/components/ui/menubar'
import {
  FolderPlus,
  FolderOpen,
  Save,
  Download,
  Upload,
  FileImage,
  FileText,
  Settings2,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  HelpCircle,
  Info,
  BookOpen,
} from 'lucide-react'

export interface AppMenuBarProps {
  onNewProject: () => void
  onOpenProject: () => void
  onSave: () => void
  onExportPNG: () => void
  onExportVSMX: () => void
  onImportVSMX: () => void
  onExportReport: () => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onOpenConfiguration: () => void
  onShowAbout: () => void
  onShowHelp: () => void
  // États pour désactiver les boutons
  canSave?: boolean
  canUndo?: boolean
  canRedo?: boolean
  hasProject?: boolean
}

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  onNewProject,
  onOpenProject,
  onSave,
  onExportPNG,
  onExportVSMX,
  onImportVSMX,
  onExportReport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenConfiguration,
  onShowAbout,
  onShowHelp,
  canSave = false,
  canUndo = false,
  canRedo = false,
  hasProject = false,
}) => {
  return (
    <Menubar className="rounded-none border-b border-t-0 border-x-0 px-2 h-9">
      {/* Menu Projet */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Projet</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNewProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Nouveau Projet
            <MenubarShortcut>Ctrl+N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onOpenProject}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Ouvrir Projet
            <MenubarShortcut>Ctrl+O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={onSave} disabled={!canSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
            <MenubarShortcut>Ctrl+S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={onExportVSMX} disabled={!hasProject}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter en VSMX
              </MenubarItem>
              <MenubarItem onClick={onExportPNG} disabled={!hasProject}>
                <FileImage className="mr-2 h-4 w-4" />
                Exporter en PNG
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onExportReport} disabled={!hasProject}>
                <BookOpen className="mr-2 h-4 w-4" />
                Générer un Rapport
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem onClick={onImportVSMX}>
            <Upload className="mr-2 h-4 w-4" />
            Importer VSMX
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Menu Édition */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Édition</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onUndo} disabled={!canUndo}>
            <Undo className="mr-2 h-4 w-4" />
            Annuler
            <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onRedo} disabled={!canRedo}>
            <Redo className="mr-2 h-4 w-4" />
            Rétablir
            <MenubarShortcut>Ctrl+Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            <Scissors className="mr-2 h-4 w-4" />
            Couper
            <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <Copy className="mr-2 h-4 w-4" />
            Copier
            <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            <Clipboard className="mr-2 h-4 w-4" />
            Coller
            <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
            <MenubarShortcut>Suppr</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Menu Affichage */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Affichage</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onZoomIn}>
            <ZoomIn className="mr-2 h-4 w-4" />
            Zoom Avant
            <MenubarShortcut>Ctrl++</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onZoomOut}>
            <ZoomOut className="mr-2 h-4 w-4" />
            Zoom Arrière
            <MenubarShortcut>Ctrl+-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onZoomReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser Zoom
            <MenubarShortcut>Ctrl+0</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            <Maximize2 className="mr-2 h-4 w-4" />
            Plein Écran
            <MenubarShortcut>F11</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Menu Diagramme */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Diagramme</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onOpenConfiguration} disabled={!hasProject}>
            <Settings2 className="mr-2 h-4 w-4" />
            Configurer le Diagramme
            <MenubarShortcut>Ctrl+K</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Menu Aide */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Aide</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onShowHelp}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Documentation
            <MenubarShortcut>F1</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={onShowAbout}>
            <Info className="mr-2 h-4 w-4" />
            À Propos
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export default AppMenuBar
