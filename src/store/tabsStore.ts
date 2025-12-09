/**
 * Système de gestion des onglets pour VSM-Tools
 * Similaire aux onglets d'un navigateur web
 */

import { create } from 'zustand';

export type TabType = 
  | 'diagram'       // Vue du diagramme VSM (non fermable)
  | 'configuration' // Configuration du diagramme
  | 'action-plan'   // Plan d'action
  | 'notes'         // Notes
  | 'data-sources'  // Sources de données
  | 'analysis'      // Analyse
  | 'custom';       // Vue personnalisée

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  icon?: string;
  closable: boolean;
  data?: any; // Données spécifiques à l'onglet
}

interface TabsStore {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  addTab: (tab: Omit<Tab, 'id'> & { id?: string }) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  openOrFocusTab: (type: TabType, title: string, data?: any) => void;
  getTabById: (tabId: string) => Tab | undefined;
  getTabsByType: (type: TabType) => Tab[];
}

// Générer un ID unique
const generateId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTabsStore = create<TabsStore>((set, get) => ({
  tabs: [
    // Onglet du diagramme par défaut (non fermable)
    {
      id: 'diagram-main',
      type: 'diagram',
      title: 'Diagramme VSM',
      icon: 'map',
      closable: false,
    }
  ],
  activeTabId: 'diagram-main',

  addTab: (tabData) => {
    const id = tabData.id || generateId();
    const newTab: Tab = {
      id,
      type: tabData.type,
      title: tabData.title,
      icon: tabData.icon,
      closable: tabData.closable ?? true, // Par défaut fermable
      data: tabData.data,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id, // Activer le nouvel onglet
    }));
  },

  removeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const tabToRemove = tabs.find(t => t.id === tabId);
    
    // Ne pas fermer les onglets non fermables
    if (tabToRemove && !tabToRemove.closable) {
      return;
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    
    // Si on ferme l'onglet actif, activer l'onglet précédent ou le premier
    let newActiveId = activeTabId;
    if (activeTabId === tabId && newTabs.length > 0) {
      const closedIndex = tabs.findIndex(t => t.id === tabId);
      const newIndex = Math.max(0, closedIndex - 1);
      newActiveId = newTabs[newIndex]?.id || newTabs[0]?.id;
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
    });
  },

  setActiveTab: (tabId) => {
    const tab = get().tabs.find(t => t.id === tabId);
    if (tab) {
      set({ activeTabId: tabId });
    }
  },

  updateTab: (tabId, updates) => {
    set((state) => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      ),
    }));
  },

  // Ouvre un onglet existant du même type ou en crée un nouveau
  openOrFocusTab: (type, title, data) => {
    const { tabs, setActiveTab, addTab } = get();
    
    // Chercher un onglet existant du même type (sauf pour 'custom')
    if (type !== 'custom') {
      const existingTab = tabs.find(t => t.type === type);
      if (existingTab) {
        setActiveTab(existingTab.id);
        return;
      }
    }

    // Créer un nouvel onglet
    addTab({
      type,
      title,
      closable: type !== 'diagram', // Le diagramme n'est jamais fermable
      data,
    });
  },

  getTabById: (tabId) => {
    return get().tabs.find(t => t.id === tabId);
  },

  getTabsByType: (type) => {
    return get().tabs.filter(t => t.type === type);
  },
}));
