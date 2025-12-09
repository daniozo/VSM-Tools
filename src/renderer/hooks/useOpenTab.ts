/**
 * Hook pour gérer l'ouverture d'onglets depuis différentes parties de l'application
 */

import { useCallback } from 'react';
import { useTabsStore, TabType } from '@/store/tabsStore';

export const useOpenTab = () => {
  const { openOrFocusTab, addTab, setActiveTab, tabs } = useTabsStore();

  /**
   * Ouvre un onglet de configuration
   */
  const openConfiguration = useCallback(() => {
    openOrFocusTab('configuration', 'Configuration');
  }, [openOrFocusTab]);

  /**
   * Ouvre le plan d'action
   */
  const openActionPlan = useCallback(() => {
    openOrFocusTab('action-plan', "Plan d'action");
  }, [openOrFocusTab]);

  /**
   * Ouvre l'onglet des notes
   */
  const openNotes = useCallback((title?: string) => {
    openOrFocusTab('notes', title || 'Notes');
  }, [openOrFocusTab]);

  /**
   * Ouvre l'onglet des sources de données
   */
  const openDataSources = useCallback(() => {
    openOrFocusTab('data-sources', 'Sources de données');
  }, [openOrFocusTab]);

  /**
   * Ouvre l'onglet d'analyse
   */
  const openAnalysis = useCallback(() => {
    openOrFocusTab('analysis', 'Analyse VSM');
  }, [openOrFocusTab]);

  /**
   * Ouvre le diagramme (active l'onglet existant)
   */
  const openDiagram = useCallback(() => {
    const diagramTab = tabs.find(t => t.type === 'diagram');
    if (diagramTab) {
      setActiveTab(diagramTab.id);
    }
  }, [tabs, setActiveTab]);

  /**
   * Ouvre un onglet personnalisé
   */
  const openCustomTab = useCallback((title: string, data?: any) => {
    addTab({
      type: 'custom',
      title,
      closable: true,
      data,
    });
  }, [addTab]);

  return {
    openConfiguration,
    openActionPlan,
    openNotes,
    openDataSources,
    openAnalysis,
    openDiagram,
    openCustomTab,
    openOrFocusTab,
  };
};
