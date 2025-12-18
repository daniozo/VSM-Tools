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
  Settings,
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
  FileCode,
  FileType,
  Palette,
  Database,
  Globe,
  Bell,
} from 'lucide-react'

export interface AppMenuBarProps {
  onNewProject: () => void
  onOpenProject: () => void
  onSave: () => void
  onExportPNG: () => void
  onExportSVG: () => void
  onExportPDF: () => void
  onExportVSMX: () => void
  onImportVSMX: () => void
  onExportReport: () => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onOpenConfiguration: () => void
  onOpenSettings: () => void
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
  onExportSVG,
  onExportPDF,
  onExportVSMX,
  onImportVSMX,
  onExportReport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenConfiguration,
  onOpenSettings,
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
                <FileCode className="mr-2 h-4 w-4" />
                Exporter en VSMX
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onExportPNG} disabled={!hasProject}>
                <FileImage className="mr-2 h-4 w-4" />
                Exporter en PNG
              </MenubarItem>
              <MenubarItem onClick={onExportSVG} disabled={!hasProject}>
                <FileType className="mr-2 h-4 w-4" />
                Exporter en SVG
              </MenubarItem>
              <MenubarItem onClick={onExportPDF} disabled={!hasProject}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter en PDF
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onExportReport} disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                Générer un Rapport
                <span className="ml-2 text-xs text-muted-foreground">(bientôt)</span>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem onClick={onImportVSMX}>
            <Upload className="mr-2 h-4 w-4" />
            Importer VSMX
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
          <MenubarSeparator />
          <MenubarItem onClick={() => window.open('http://localhost:5174/dashboard', '_blank')}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ouvrir Dashboard
          </MenubarItem>
          <MenubarItem onClick={() => window.open('http://localhost:5174/operator', '_blank')}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Interface Opérateur
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

      {/* Menu Paramètres */}
      <MenubarMenu>
        <MenubarTrigger className="font-medium">Paramètres</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Préférences générales
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Thème
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => document.documentElement.classList.remove('dark')}>
                Clair
              </MenubarItem>
              <MenubarItem onClick={() => document.documentElement.classList.add('dark')}>
                Sombre
              </MenubarItem>
              <MenubarItem onClick={() => {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
              }}>
                Système
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>
            <Database className="mr-2 h-4 w-4" />
            Connexion Backend
          </MenubarItem>
          <MenubarItem disabled>
            <Globe className="mr-2 h-4 w-4" />
            Langue
          </MenubarItem>
          <MenubarItem disabled>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
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
