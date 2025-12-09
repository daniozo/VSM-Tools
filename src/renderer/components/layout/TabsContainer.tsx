/**
 * TabsContainer - Conteneur d'onglets style navigateur
 * Gère l'affichage des onglets et leur contenu
 */

import React, { useCallback } from 'react';
import { X, Map, Settings, ClipboardList, StickyNote, Database, BarChart3 } from 'lucide-react';
import { useTabsStore, TabType } from '@/store/tabsStore';
import { cn } from '@/lib/utils';

// Icônes par type d'onglet
const tabIcons: Record<TabType, React.ReactNode> = {
  diagram: <Map className="w-4 h-4" />,
  configuration: <Settings className="w-4 h-4" />,
  'action-plan': <ClipboardList className="w-4 h-4" />,
  notes: <StickyNote className="w-4 h-4" />,
  'data-sources': <Database className="w-4 h-4" />,
  analysis: <BarChart3 className="w-4 h-4" />,
  custom: <Map className="w-4 h-4" />,
};

interface TabProps {
  id: string;
  title: string;
  type: TabType;
  isActive: boolean;
  closable: boolean;
  onActivate: () => void;
  onClose: () => void;
}

const Tab: React.FC<TabProps> = ({
  id,
  title,
  type,
  isActive,
  closable,
  onActivate,
  onClose,
}) => {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-border',
        'min-w-[120px] max-w-[200px] select-none transition-colors',
        isActive
          ? 'bg-background text-foreground border-b-2 border-b-primary'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      onClick={onActivate}
    >
      <span className="flex-shrink-0 text-muted-foreground">
        {tabIcons[type]}
      </span>
      <span className="flex-1 truncate text-sm font-medium">{title}</span>
      {closable && (
        <button
          className={cn(
            'flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100',
            'hover:bg-destructive/20 hover:text-destructive transition-opacity'
          )}
          onClick={handleClose}
          title="Fermer l'onglet"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface TabsContainerProps {
  children?: React.ReactNode;
  renderContent?: (activeTabType: TabType | null, activeTabId: string | null) => React.ReactNode;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({
  children,
  renderContent,
}) => {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTabsStore();

  const handleActivate = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const handleClose = useCallback((tabId: string) => {
    removeTab(tabId);
  }, [removeTab]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'onglets */}
      <div className="flex items-stretch bg-muted/30 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            title={tab.title}
            type={tab.type}
            isActive={tab.id === activeTabId}
            closable={tab.closable}
            onActivate={() => handleActivate(tab.id)}
            onClose={() => handleClose(tab.id)}
          />
        ))}
        {/* Espace vide pour compléter la barre */}
        <div className="flex-1 bg-muted/30 border-b border-border" />
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 overflow-hidden">
        {renderContent
          ? renderContent(activeTab?.type || null, activeTabId)
          : children}
      </div>
    </div>
  );
};

export default TabsContainer;
