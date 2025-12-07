/**
 * Dialogue de configuration central pour créer/éditer un diagramme VSM
 * 
 * Ce dialogue est LA interface principale pour construire/éditer un diagramme VSM
 * selon l'approche Model-First. Il contient 8 onglets pour configurer tous les
 * aspects du diagramme.
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useVsmStore } from '@/store/vsmStore'
import { TabNavigation } from './TabNavigation'
import { ConfigurationTab, TabItem } from './types'
import { VSMDiagram, DeliveryFrequency } from '@/shared/types/vsm-model'
import {
  FileText,
  Database,
  Users,
  Box,
  TrendingUp,
  Package,
  ArrowRight,
  MessageSquare
} from 'lucide-react'

// Import des onglets
import {
  GeneralInfoTab,
  DataSourcesTab,
  ActorsTab,
  ProcessStepsTab,
  IndicatorsTab,
  InventoriesTab,
  MaterialFlowsTab,
  InformationFlowsTab
} from './tabs'

/**
 * Définition des onglets avec icônes et descriptions
 */
const tabs: TabItem[] = [
  {
    id: 'general',
    label: 'Informations Générales',
    icon: <FileText size={18} />,
    description: 'Métadonnées du diagramme'
  },
  {
    id: 'dataSources',
    label: 'Sources de Données',
    icon: <Database size={18} />,
    description: 'Connexions aux systèmes externes'
  },
  {
    id: 'actors',
    label: 'Acteurs Externes',
    icon: <Users size={18} />,
    description: 'Fournisseur, Client, Centre de contrôle'
  },
  {
    id: 'processSteps',
    label: 'Étapes de Production',
    icon: <Box size={18} />,
    description: 'Processus de transformation'
  },
  {
    id: 'indicators',
    label: 'Indicateurs',
    icon: <TrendingUp size={18} />,
    description: 'KPIs et métriques'
  },
  {
    id: 'inventories',
    label: 'Stocks',
    icon: <Package size={18} />,
    description: 'Inventaires entre les étapes'
  },
  {
    id: 'materialFlows',
    label: 'Flux Matériels',
    icon: <ArrowRight size={18} />,
    description: 'Types de flux entre étapes'
  },
  {
    id: 'informationFlows',
    label: 'Flux d\'Information',
    icon: <MessageSquare size={18} />,
    description: 'Communications transverses'
  }
]

interface ConfigurationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ConfigurationDialog: React.FC<ConfigurationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const {
    diagram,
    loadDiagram
  } = useVsmStore()

  const [activeTab, setActiveTab] = useState<ConfigurationTab>('general')
  const [localDiagram, setLocalDiagram] = useState<VSMDiagram | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialiser le diagramme local quand le dialogue s'ouvre
  useEffect(() => {
    if (open) {
      if (diagram) {
        setLocalDiagram(JSON.parse(JSON.stringify(diagram))) // Deep clone
      } else {
        // Créer un nouveau diagramme vide si aucun n'existe
        const emptyDiagram: VSMDiagram = {
          id: 'diagram-' + Date.now(),
          metaData: {
            name: 'Nouveau diagramme VSM',
            description: '',
            version: '1.0',
            author: '',
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            appVersion: '1.0.0'
          },
          dataSources: [],
          actors: {
            supplier: {
              name: '',
              contact: '',
              deliveryFrequency: DeliveryFrequency.DAILY,
              leadTime: 0
            },
            customer: {
              name: '',
              contact: '',
              dailyDemand: 0,
              taktTime: 0
            },
            controlCenter: undefined
          },
          nodes: [],
          flowSequences: [],
          informationFlows: [],
          improvementPoints: [],
          textAnnotations: []
        }
        setLocalDiagram(emptyDiagram)
      }
      setHasChanges(false)
      setActiveTab('general')
    }
  }, [open, diagram])

  /**
   * Met à jour le diagramme local et marque comme modifié
   */
  const updateLocalDiagram = (updates: Partial<VSMDiagram>) => {
    if (!localDiagram) return

    setLocalDiagram({
      ...localDiagram,
      ...updates
    })
    setHasChanges(true)
  }

  /**
   * Applique les modifications (sans fermer le dialogue)
   */
  const handleApply = () => {
    if (localDiagram) {
      loadDiagram(localDiagram)
      setHasChanges(false)
    }
  }

  /**
   * Sauvegarde et ferme le dialogue
   */
  const handleOk = () => {
    handleApply()
    onOpenChange(false)
  }

  /**
   * Annule les modifications et ferme
   */
  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Vous avez des modifications non appliquées. Voulez-vous vraiment annuler ?'
      )
      if (!confirmed) return
    }
    onOpenChange(false)
  }

  /**
   * Rendu du contenu de l'onglet actif
   */
  const renderActiveTab = () => {
    if (!localDiagram) return null

    switch (activeTab) {
      case 'general':
        return (
          <GeneralInfoTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'dataSources':
        return (
          <DataSourcesTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'actors':
        return (
          <ActorsTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'processSteps':
        return (
          <ProcessStepsTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'indicators':
        return (
          <IndicatorsTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'inventories':
        return (
          <InventoriesTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'materialFlows':
        return (
          <MaterialFlowsTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      case 'informationFlows':
        return (
          <InformationFlowsTab
            diagram={localDiagram}
            onUpdate={updateLocalDiagram}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCancel()
      }
    }}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            Configuration du Diagramme VSM
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Navigation des onglets (gauche) */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Contenu de l'onglet actif (droite) */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderActiveTab()}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="text-amber-600">
                  • Modifications non appliquées
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button
                variant="secondary"
                onClick={handleApply}
                disabled={!hasChanges}
              >
                Appliquer
              </Button>
              <Button onClick={handleOk}>
                OK
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
