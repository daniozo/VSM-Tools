import React, { useEffect, useState, useRef, ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './styles/App.css';

// Nouveau layout Model-First
import { MainLayout, MainLayoutHandle, Toolbar, StatusBar } from './components/layout';

// Composants de l'éditeur VSM
import VsmCanvas from './components/editor/VsmCanvas';
import ErrorFallback from './components/ui/ErrorFallback';
import { ConfigurationDialog } from './components/dialogs/configuration/ConfigurationDialog';
import { NewProjectDialog } from './components/dialogs/NewProjectDialog';
import { OpenProjectDialog } from './components/dialogs/OpenProjectDialog';

// Store et données
import { useVsmStore } from '@/store/vsmStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useTabsStore } from '@/store/tabsStore';
import { demoDiagram } from '@/shared/data/demo-diagram';
import { demoDiagramWithProblems } from '@/shared/data/demo-diagram-problems';
import { diagramsApi } from '@/services/api';
import { saveDiagram } from '@/services/sync/diagramSync';

// Hook de connexion backend
import { useBackendConnection } from './hooks/useBackendConnection';
import { AppMenuBar } from './components/layout/AppMenuBar';

// Détecter si on est dans Electron
const isElectron = !!(window as any).electron;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState<boolean>(false);
  const [isOpenProjectDialogOpen, setIsOpenProjectDialogOpen] = useState<boolean>(false);
  const canvasRef = useRef<any>(null);
  const mainLayoutRef = useRef<MainLayoutHandle>(null);

  // Store VSM - utiliser le store pour isConfigDialogOpen (permet au toolExecutor de l'ouvrir)
  const { loadDiagram, diagram, isDirty, createNewDiagram, isConfigDialogOpen, openConfigDialog, closeConfigDialog } = useVsmStore();
  const setIsConfigDialogOpen = (open: boolean) => open ? openConfigDialog() : closeConfigDialog();

  // Connexion backend (auto-connect)
  useBackendConnection();
  const {
    connectionStatus,
    projects,
    currentProject,
    currentDiagram,
    isLoadingProjects,
    fetchProjects,
    fetchDiagrams,
    createProject,
    selectProject,
  } = useProjectsStore();

  useEffect(() => {
    // Simulation de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K : Ouvrir la configuration
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsConfigDialogOpen(true);
      }

      // Zoom raccourcis
      if (e.ctrlKey && !e.shiftKey) {
        // Ctrl++ ou Ctrl+= : Zoom avant
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          if (canvasRef.current) {
            canvasRef.current.zoomIn();
          }
        }
        // Ctrl+- : Zoom arrière
        else if (e.key === '-') {
          e.preventDefault();
          if (canvasRef.current) {
            canvasRef.current.zoomOut();
          }
        }
        // Ctrl+0 : Réinitialiser zoom
        else if (e.key === '0') {
          e.preventDefault();
          if (canvasRef.current) {
            canvasRef.current.zoomReset();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Écoute des événements du menu natif Electron
  useEffect(() => {
    // @ts-expect-error - electron preload
    const ipcRenderer = window.electron?.ipcRenderer;
    if (!ipcRenderer) return;

    const handlers: Record<string, () => void> = {
      'menu:new-map': handleNewProject,
      'menu:open-map': handleOpenProject,
      'menu:open-configuration': () => openConfigDialog(),
    };

    // Enregistrer tous les listeners
    Object.entries(handlers).forEach(([channel, handler]) => {
      ipcRenderer.on(channel, handler);
    });

    // Cleanup
    return () => {
      Object.entries(handlers).forEach(([channel, handler]) => {
        ipcRenderer.removeListener(channel, handler);
      });
    };
  }, []);

  // Fonction de gestion des erreurs pour ErrorBoundary
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Erreur capturée par ErrorBoundary:', error, info);
  };

  // Gestionnaire pour les actions de la toolbar
  const handleToolbarAction = (action: string) => {
    console.log(`Action toolbar: ${action}`);

    switch (action) {
      case 'newProject':
        handleNewProject();
        break;
      case 'openProject':
        handleOpenProject();
        break;
      case 'save':
        handleSave();
        break;
      case 'undo':
        console.log('Annuler');
        break;
      case 'redo':
        console.log('Refaire');
        break;
      case 'zoomIn':
        if (mainLayoutRef.current) {
          mainLayoutRef.current.zoomIn();
        }
        break;
      case 'zoomOut':
        if (mainLayoutRef.current) {
          mainLayoutRef.current.zoomOut();
        }
        break;
      case 'zoomReset':
        if (mainLayoutRef.current) {
          mainLayoutRef.current.zoomReset();
        }
        break;
      case 'configure':
        setIsConfigDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Actions projet
  const handleNewProject = () => {
    setIsNewProjectDialogOpen(true);
  };

  const handleOpenProject = () => {
    setIsOpenProjectDialogOpen(true);
  };

  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const newProject = await createProject(name, description);
      await selectProject(newProject);
      console.log('Projet créé:', newProject);

      // Charger le diagramme du projet dans vsmStore
      await fetchDiagrams(newProject.id);
      const projectDiagrams = useProjectsStore.getState().diagrams;
      if (projectDiagrams && projectDiagrams.length > 0) {
        const diagramData = await diagramsApi.get(projectDiagrams[0].id);
        // diagramData.data contient le VSMDiagram complet
        if (diagramData.data) {
          loadDiagram(diagramData.data);
        }
      }

      // Fermer le dialogue de création
      setIsNewProjectDialogOpen(false);

      // Ouvrir le dialogue de configuration après la création
      setTimeout(() => setIsConfigDialogOpen(true), 100);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  };

  const handleSelectProject = async (project: typeof currentProject) => {
    try {
      await selectProject(project);
      console.log('Projet sélectionné:', project);
    } catch (error) {
      console.error('Erreur lors de la sélection du projet:', error);
      throw error;
    }
  };

  const handleLoadDemo = () => {
    console.log('Chargement du diagramme de démonstration avec problèmes');
    loadDiagram(demoDiagramWithProblems);
  };

  const handleSave = async () => {
    const diagram = useVsmStore.getState().diagram;
    const currentDiagram = useProjectsStore.getState().currentDiagram;

    if (!diagram || !currentDiagram) {
      console.warn('⚠️ Aucun diagramme à sauvegarder');
      return;
    }

    try {
      console.log('💾 Sauvegarde du diagramme...', currentDiagram.id);
      await saveDiagram(diagram, currentDiagram.id);
      useVsmStore.getState().markAsSaved();
      console.log('✅ Diagramme sauvegardé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      // TODO: Afficher une notification d'erreur à l'utilisateur
    }
  };

  // Fonctions d'export
  const handleExportVSMX = () => {
    const diagram = useVsmStore.getState().diagram;
    if (!diagram) {
      alert('Aucun diagramme à exporter');
      return;
    }

    const vsmxContent = JSON.stringify(diagram, null, 2);
    const blob = new Blob([vsmxContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.metaData?.name || 'diagram'}.vsmx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    const diagram = useVsmStore.getState().diagram;
    if (!diagram) {
      alert('Aucun diagramme à exporter');
      return;
    }

    // Trouver le conteneur du canvas maxGraph
    const canvasContainer = document.querySelector('.min-w-full.min-h-full.cursor-default') as HTMLElement;
    if (!canvasContainer) {
      alert('Impossible de trouver le diagramme');
      return;
    }

    try {
      // Utiliser l'élément SVG généré par maxGraph
      const svgElement = canvasContainer.querySelector('svg');
      if (!svgElement) {
        alert('Le diagramme n\'est pas encore rendu');
        return;
      }

      // Cloner le SVG pour le modifier
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Obtenir les dimensions
      const bbox = svgElement.getBBox();
      const padding = 40;
      svgClone.setAttribute('width', String(bbox.width + padding * 2));
      svgClone.setAttribute('height', String(bbox.height + padding * 2));
      svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);

      // Ajouter un fond blanc
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(bbox.x - padding));
      rect.setAttribute('y', String(bbox.y - padding));
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      svgClone.insertBefore(rect, svgClone.firstChild);

      // Convertir en data URL
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Créer une image et un canvas pour la conversion
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = bbox.width + padding * 2;
        canvas.height = bbox.height + padding * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${diagram.metaData?.name || 'diagram'}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('Erreur lors de l\'export PNG:', error);
      alert('Erreur lors de l\'export PNG');
    }
  };

  const handleExportSVG = () => {
    const diagram = useVsmStore.getState().diagram;
    if (!diagram) {
      alert('Aucun diagramme à exporter');
      return;
    }

    const canvasContainer = document.querySelector('.min-w-full.min-h-full.cursor-default') as HTMLElement;
    if (!canvasContainer) {
      alert('Impossible de trouver le diagramme');
      return;
    }

    const svgElement = canvasContainer.querySelector('svg');
    if (!svgElement) {
      alert('Le diagramme n\'est pas encore rendu');
      return;
    }

    // Cloner et préparer le SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const bbox = svgElement.getBBox();
    const padding = 40;
    svgClone.setAttribute('width', String(bbox.width + padding * 2));
    svgClone.setAttribute('height', String(bbox.height + padding * 2));
    svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);

    // Ajouter un fond blanc
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(bbox.x - padding));
    rect.setAttribute('y', String(bbox.y - padding));
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    svgClone.insertBefore(rect, svgClone.firstChild);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.metaData?.name || 'diagram'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const diagram = useVsmStore.getState().diagram;
    if (!diagram) {
      alert('Aucun diagramme à exporter');
      return;
    }

    // Pour le PDF, on ouvre la fenêtre d'impression du navigateur
    // qui permet de sauvegarder en PDF
    const canvasContainer = document.querySelector('.min-w-full.min-h-full.cursor-default') as HTMLElement;
    if (!canvasContainer) {
      alert('Impossible de trouver le diagramme');
      return;
    }

    const svgElement = canvasContainer.querySelector('svg');
    if (!svgElement) {
      alert('Le diagramme n\'est pas encore rendu');
      return;
    }

    // Créer une fenêtre d'impression avec le SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    const bbox = svgElement.getBBox();
    const padding = 40;
    svgClone.setAttribute('width', String(bbox.width + padding * 2));
    svgClone.setAttribute('height', String(bbox.height + padding * 2));
    svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${diagram.metaData?.name || 'Diagramme VSM'}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; }
            svg { max-width: 100%; height: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 20px;">${diagram.metaData?.name || 'Diagramme VSM'}</h1>
          ${svgString}
          <script>setTimeout(() => { window.print(); }, 500);<\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleImportVSMXFromMenu = () => {
    // Ouvrir le dialogue d'import (depuis le menu)
    setIsNewProjectDialogOpen(true);
  };

  const handleImportVSMXFile = async (file: File, projectName: string, description?: string) => {
    // Importer un fichier VSMX et créer un projet
    try {
      const content = await file.text();
      const diagramData = JSON.parse(content);

      // Créer le projet
      const newProject = await createProject(projectName, description);
      await selectProject(newProject);

      // Charger les diagrammes du projet
      await fetchDiagrams(newProject.id);
      const projectDiagrams = useProjectsStore.getState().diagrams;

      if (projectDiagrams && projectDiagrams.length > 0) {
        // Mettre à jour le diagramme existant avec les données importées
        await diagramsApi.update(projectDiagrams[0].id, {
          name: diagramData.metaData?.name || projectName,
          data: diagramData
        });

        // Charger dans le store
        loadDiagram(diagramData);
      }

      console.log('✅ Projet importé avec succès:', projectName);
      setIsNewProjectDialogOpen(false);
    } catch (error) {
      console.error('❌ Erreur lors de l\'import VSMX:', error);
      alert('Erreur lors de l\'import du fichier VSMX. Vérifiez que le fichier est valide.');
      throw error;
    }
  };

  const handleExportReport = () => {
    // TODO: Générer un rapport PDF/HTML
    alert('Génération de rapport - Fonctionnalité à venir');
  };

  const handleUndo = () => {
    console.log('Annuler - À implémenter');
  };

  const handleRedo = () => {
    console.log('Rétablir - À implémenter');
  };

  const handleShowAbout = () => {
    alert('VSM-Tools v1.0\n\nOutil de cartographie de flux de valeur (VSM)\n\n© 2025');
  };

  const handleShowHelp = () => {
    window.open('https://github.com/vsmtools/docs', '_blank');
  };

  const handleOpenSettings = () => {
    // Pour l'instant, on affiche un message
    // TODO: Créer un dialogue de paramètres
    alert('Paramètres - Dialogue à venir\n\nVous pouvez changer le thème via le menu Paramètres > Thème');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-3xl font-bold mb-4 text-text-primary">VSM-Tools</h1>
        <p className="mb-6 text-text-secondary">Chargement en cours...</p>
        <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      <div className="flex flex-col h-screen bg-background select-none">
        {/* Menu web (uniquement hors Electron) */}
        {!isElectron && (
          <AppMenuBar
            onNewProject={handleNewProject}
            onOpenProject={handleOpenProject}
            onSave={handleSave}
            onExportPNG={handleExportPNG}
            onExportSVG={handleExportSVG}
            onExportPDF={handleExportPDF}
            onExportVSMX={handleExportVSMX}
            onImportVSMX={handleImportVSMXFromMenu}
            onExportReport={handleExportReport}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onZoomIn={() => mainLayoutRef.current?.zoomIn()}
            onZoomOut={() => mainLayoutRef.current?.zoomOut()}
            onZoomReset={() => mainLayoutRef.current?.zoomReset()}
            onOpenConfiguration={() => openConfigDialog()}
            onOpenSettings={handleOpenSettings}
            onShowAbout={handleShowAbout}
            onShowHelp={handleShowHelp}
            canSave={!!currentProject && isDirty}
            hasProject={!!currentProject}
          />
        )}
        <Toolbar
          onAction={handleToolbarAction}
        />
        <MainLayout
          ref={mainLayoutRef}
          currentProject={currentProject}
          canvasRef={canvasRef}
        >
          <VsmCanvas ref={canvasRef} />
        </MainLayout>
        <StatusBar
          onOpenAnalysisPanel={() => useTabsStore.getState().requestLeftPanel('analysis')}
          onOpenActionPlanPanel={() => useTabsStore.getState().requestLeftPanel('action-plan')}
        />

        {/* Dialogues */}
        <ConfigurationDialog
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
        />

        <NewProjectDialog
          open={isNewProjectDialogOpen}
          onOpenChange={setIsNewProjectDialogOpen}
          onCreateProject={handleCreateProject}
          onImportVSMX={handleImportVSMXFile}
        />

        <OpenProjectDialog
          open={isOpenProjectDialogOpen}
          onOpenChange={setIsOpenProjectDialogOpen}
          projects={projects}
          isLoading={isLoadingProjects}
          onSelectProject={handleSelectProject}
          onRefresh={fetchProjects}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;