/**
 * FutureStateDialog - Dialogue pour créer un état futur VSM
 * 
 * Structure identique au ConfigurationDialog mais avec des valeurs
 * 100% statiques (pas de sources de données dynamiques).
 * 
 * Onglets disponibles:
 * - Informations Générales
 * - Acteurs Externes  
 * - Étapes de Production
 * - Indicateurs
 * - Stocks
 * - Flux Matériels
 * - Flux d'Information
 * - Améliorations
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/renderer/components/ui/dialog'
import { Button } from '@/renderer/components/ui/button'
import { Input } from '@/renderer/components/ui/input'
import { Label } from '@/renderer/components/ui/label'
import { Textarea } from '@/renderer/components/ui/textarea'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { Badge } from '@/renderer/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/renderer/components/ui/table'
import { cn } from '@/lib/utils'
import {
  FileText,
  Users,
  Box,
  TrendingUp,
  Package,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import {
  VSMDiagram,
  DiagramType,
  FlowType,
  TransmissionType,
  NodeType,
  DeliveryFrequency,
  InventoryType,
  Node,
  Indicator,
  InformationFlow,
  ImprovementPoint,
  ImprovementStatus,
  generateId
} from '@/shared/types/vsm-model'

// ============================================
// TYPES
// ============================================

type FutureStateTab =
  | 'general'
  | 'actors'
  | 'processSteps'
  | 'indicators'
  | 'inventories'
  | 'materialFlows'
  | 'informationFlows'
  | 'improvements'

interface TabItem {
  id: FutureStateTab
  label: string
  icon: React.ReactNode
  description: string
}

interface FutureStateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStateDiagram: VSMDiagram
  onCreateFutureState: (futureDiagram: VSMDiagram) => Promise<void>
}

// ============================================
// TABS DEFINITION
// ============================================

const tabs: TabItem[] = [
  {
    id: 'general',
    label: 'Informations Générales',
    icon: <FileText size={18} />,
    description: 'Métadonnées de l\'état futur'
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
    description: 'Processus cibles'
  },
  {
    id: 'indicators',
    label: 'Indicateurs',
    icon: <TrendingUp size={18} />,
    description: 'KPIs et métriques cibles'
  },
  {
    id: 'inventories',
    label: 'Stocks',
    icon: <Package size={18} />,
    description: 'Niveaux de stock cibles'
  },
  {
    id: 'materialFlows',
    label: 'Flux Matériels',
    icon: <ArrowRight size={18} />,
    description: 'Types de flux cibles'
  },
  {
    id: 'informationFlows',
    label: 'Flux d\'Information',
    icon: <MessageSquare size={18} />,
    description: 'Communications cibles'
  },
  {
    id: 'improvements',
    label: 'Améliorations',
    icon: <Lightbulb size={18} />,
    description: 'Points Kaizen à implémenter'
  }
]

// ============================================
// TAB NAVIGATION COMPONENT
// ============================================

interface TabNavigationProps {
  tabs: TabItem[]
  activeTab: FutureStateTab
  onTabChange: (tab: FutureStateTab) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="w-64 border-r bg-muted/30 p-4 space-y-2 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">
        État Futur VSM
      </h2>

      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left h-auto py-3 px-3',
            activeTab === tab.id && 'bg-secondary'
          )}
          onClick={() => onTabChange(tab.id)}
        >
          <div className="flex items-start gap-3 w-full">
            <div className="mt-0.5 shrink-0">
              {tab.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {tab.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {tab.description}
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getIndicatorValue(indicators: Indicator[], name: string): string {
  const indicator = indicators?.find(i =>
    i.name?.toLowerCase().includes(name.toLowerCase())
  )
  return indicator?.value || '0'
}

function setIndicatorValue(indicators: Indicator[], name: string, value: string): Indicator[] {
  const existing = indicators.findIndex(i =>
    i.name?.toLowerCase().includes(name.toLowerCase())
  )
  if (existing >= 0) {
    const updated = [...indicators]
    updated[existing] = { ...updated[existing], value }
    return updated
  }
  return indicators
}

const flowTypeLabels: Record<FlowType, string> = {
  [FlowType.PUSH]: 'PUSH (Poussé)',
  [FlowType.PULL]: 'PULL (Tiré)',
  [FlowType.FIFO_LANE]: 'FIFO',
  [FlowType.KANBAN]: 'Kanban'
}

const transmissionTypeLabels: Record<TransmissionType, string> = {
  [TransmissionType.ELECTRONIC]: 'Électronique',
  [TransmissionType.MANUAL]: 'Manuel',
  [TransmissionType.KANBAN]: 'Kanban',
  [TransmissionType.SCHEDULE]: 'Planning'
}

const deliveryFrequencyLabels: Record<DeliveryFrequency, string> = {
  [DeliveryFrequency.DAILY]: 'Quotidienne',
  [DeliveryFrequency.WEEKLY]: 'Hebdomadaire',
  [DeliveryFrequency.MONTHLY]: 'Mensuelle',
  [DeliveryFrequency.CUSTOM]: 'Personnalisée'
}

// ============================================
// MAIN DIALOG COMPONENT
// ============================================

export const FutureStateDialog: React.FC<FutureStateDialogProps> = ({
  open,
  onOpenChange,
  currentStateDiagram,
  onCreateFutureState
}) => {
  const [activeTab, setActiveTab] = useState<FutureStateTab>('general')
  const [localDiagram, setLocalDiagram] = useState<VSMDiagram | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Initialiser le diagramme local quand le dialogue s'ouvre
  useEffect(() => {
    if (open && currentStateDiagram) {
      // Deep clone du diagramme actuel
      const cloned = JSON.parse(JSON.stringify(currentStateDiagram)) as VSMDiagram

      // Configurer comme état futur
      cloned.id = generateId('future')
      cloned.diagramType = DiagramType.FUTURE
      cloned.currentStateId = currentStateDiagram.id

      if (cloned.metaData) {
        cloned.metaData.name = `${cloned.metaData.name} - État Futur`
        cloned.metaData.description = `État futur basé sur: ${currentStateDiagram.metaData?.name || 'État actuel'}`
        cloned.metaData.createdDate = new Date().toISOString()
        cloned.metaData.modifiedDate = new Date().toISOString()
      }

      // Forcer tous les indicateurs en mode Statique
      cloned.nodes = cloned.nodes.map(node => ({
        ...node,
        indicators: node.indicators.map(ind => ({
          ...ind,
          mode: 'Statique' as const
        }))
      }))

      // Vider les sources de données (pas de dynamique)
      cloned.dataSources = []

      setLocalDiagram(cloned)
      setHasChanges(false)
      setActiveTab('general')
    }
  }, [open, currentStateDiagram])

  const updateLocalDiagram = (updates: Partial<VSMDiagram>) => {
    if (!localDiagram) return
    setLocalDiagram({ ...localDiagram, ...updates })
    setHasChanges(true)
  }

  const handleCreate = async () => {
    if (!localDiagram) return

    setIsCreating(true)
    try {
      await onCreateFutureState(localDiagram)
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur création état futur:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?'
      )
      if (!confirmed) return
    }
    onOpenChange(false)
  }

  // ============================================
  // TAB CONTENT RENDERERS
  // ============================================

  const renderGeneralTab = () => {
    if (!localDiagram) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations de l'État Futur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={localDiagram.metaData?.name || ''}
                  onChange={(e) => updateLocalDiagram({
                    metaData: { ...localDiagram.metaData!, name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={localDiagram.metaData?.version || '1.0'}
                  onChange={(e) => updateLocalDiagram({
                    metaData: { ...localDiagram.metaData!, version: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={localDiagram.metaData?.description || ''}
                onChange={(e) => updateLocalDiagram({
                  metaData: { ...localDiagram.metaData!, description: e.target.value }
                })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auteur</Label>
                <Input
                  value={localDiagram.metaData?.author || ''}
                  onChange={(e) => updateLocalDiagram({
                    metaData: { ...localDiagram.metaData!, author: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Basé sur (État Actuel)</Label>
                <Input
                  value={currentStateDiagram.metaData?.name || currentStateDiagram.id}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Comparaison avec l'État Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentStateDiagram.nodes.length}
                </div>
                <div className="text-sm text-muted-foreground">Étapes (Actuel)</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {localDiagram?.nodes.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Étapes (Futur)</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {((localDiagram?.nodes.length || 0) - currentStateDiagram.nodes.length)}
                </div>
                <div className="text-sm text-muted-foreground">Différence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderActorsTab = () => {
    if (!localDiagram) return null

    return (
      <div className="space-y-6">
        {/* Fournisseur */}
        <Card>
          <CardHeader>
            <CardTitle>Fournisseur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={localDiagram.actors?.supplier?.name || ''}
                  onChange={(e) => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      supplier: { ...localDiagram.actors?.supplier!, name: e.target.value }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fréquence de Livraison</Label>
                <Select
                  value={localDiagram.actors?.supplier?.deliveryFrequency || DeliveryFrequency.DAILY}
                  onValueChange={(v) => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      supplier: { ...localDiagram.actors?.supplier!, deliveryFrequency: v as DeliveryFrequency }
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(deliveryFrequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Délai de Livraison (jours)</Label>
              <Input
                type="number"
                value={localDiagram.actors?.supplier?.leadTime || 0}
                onChange={(e) => updateLocalDiagram({
                  actors: {
                    ...localDiagram.actors,
                    supplier: { ...localDiagram.actors?.supplier!, leadTime: parseInt(e.target.value) || 0 }
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={localDiagram.actors?.customer?.name || ''}
                  onChange={(e) => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      customer: { ...localDiagram.actors?.customer!, name: e.target.value }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Demande Journalière</Label>
                <Input
                  type="number"
                  value={localDiagram.actors?.customer?.dailyDemand || 0}
                  onChange={(e) => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      customer: { ...localDiagram.actors?.customer!, dailyDemand: parseInt(e.target.value) || 0 }
                    }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Takt Time (secondes)</Label>
              <Input
                type="number"
                value={localDiagram.actors?.customer?.taktTime || 0}
                onChange={(e) => updateLocalDiagram({
                  actors: {
                    ...localDiagram.actors,
                    customer: { ...localDiagram.actors?.customer!, taktTime: parseFloat(e.target.value) || 0 }
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Centre de Contrôle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Centre de Contrôle</span>
              {!localDiagram.actors?.controlCenter && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      controlCenter: { name: 'Centre de Contrôle' }
                    }
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          {localDiagram.actors?.controlCenter && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={localDiagram.actors.controlCenter.name || ''}
                  onChange={(e) => updateLocalDiagram({
                    actors: {
                      ...localDiagram.actors,
                      controlCenter: { ...localDiagram.actors.controlCenter!, name: e.target.value }
                    }
                  })}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => updateLocalDiagram({
                  actors: {
                    ...localDiagram.actors,
                    controlCenter: undefined
                  }
                })}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  const renderProcessStepsTab = () => {
    if (!localDiagram) return null

    const processSteps = localDiagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

    const updateNode = (nodeId: string, updates: Partial<Node>) => {
      const newNodes = localDiagram.nodes.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      )
      updateLocalDiagram({ nodes: newNodes })
    }

    const addNode = () => {
      const newNode: Node = {
        id: generateId('step'),
        type: NodeType.PROCESS_STEP,
        name: `Nouvelle Étape ${processSteps.length + 1}`,
        operators: 1,
        indicators: [
          { id: generateId('ind'), name: 'Temps de Cycle', value: '0', unit: 's', mode: 'Statique' },
          { id: generateId('ind'), name: 'Changement Série', value: '0', unit: 'min', mode: 'Statique' },
          { id: generateId('ind'), name: 'Disponibilité', value: '100', unit: '%', mode: 'Statique' }
        ]
      }
      updateLocalDiagram({ nodes: [...localDiagram.nodes, newNode] })
    }

    const deleteNode = (nodeId: string) => {
      updateLocalDiagram({
        nodes: localDiagram.nodes.filter(n => n.id !== nodeId)
      })
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Étapes de Production</h3>
          <Button onClick={addNode}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une étape
          </Button>
        </div>

        <div className="space-y-4">
          {processSteps.map((node, index) => {
            const cycleTime = getIndicatorValue(node.indicators, 'cycle')
            const changeover = getIndicatorValue(node.indicators, 'changement')
            const uptime = getIndicatorValue(node.indicators, 'disponibilité')

            return (
              <Card key={node.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Input
                        value={node.name}
                        onChange={(e) => updateNode(node.id, { name: e.target.value })}
                        className="w-48"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNode(node.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Opérateurs</Label>
                      <Input
                        type="number"
                        value={node.operators || 1}
                        onChange={(e) => updateNode(node.id, { operators: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Temps de Cycle (s)</Label>
                      <Input
                        type="number"
                        value={cycleTime}
                        onChange={(e) => updateNode(node.id, {
                          indicators: setIndicatorValue(node.indicators, 'cycle', e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Changement Série (min)</Label>
                      <Input
                        type="number"
                        value={changeover}
                        onChange={(e) => updateNode(node.id, {
                          indicators: setIndicatorValue(node.indicators, 'changement', e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Disponibilité (%)</Label>
                      <Input
                        type="number"
                        value={uptime}
                        onChange={(e) => updateNode(node.id, {
                          indicators: setIndicatorValue(node.indicators, 'disponibilité', e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {processSteps.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune étape de production. Cliquez sur "Ajouter une étape" pour commencer.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const renderIndicatorsTab = () => {
    if (!localDiagram) return null

    const processSteps = localDiagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Indicateurs par Étape (Valeurs Cibles)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étape</TableHead>
                  <TableHead>CT (s)</TableHead>
                  <TableHead>C/O (min)</TableHead>
                  <TableHead>Uptime (%)</TableHead>
                  <TableHead>Rebut (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processSteps.map(node => (
                  <TableRow key={node.id}>
                    <TableCell className="font-medium">{node.name}</TableCell>
                    <TableCell>{getIndicatorValue(node.indicators, 'cycle')}</TableCell>
                    <TableCell>{getIndicatorValue(node.indicators, 'changement')}</TableCell>
                    <TableCell>{getIndicatorValue(node.indicators, 'disponibilité')}</TableCell>
                    <TableCell>{getIndicatorValue(node.indicators, 'rebut') || '0'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground mt-4">
              Modifiez les indicateurs dans l'onglet "Étapes de Production"
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderInventoriesTab = () => {
    if (!localDiagram) return null

    const updateInventory = (seqIndex: number, elemIndex: number, updates: any) => {
      const newSequences = [...localDiagram.flowSequences]
      const elem = newSequences[seqIndex].intermediateElements?.[elemIndex]
      if (elem?.inventory) {
        elem.inventory = { ...elem.inventory, ...updates }
      }
      updateLocalDiagram({ flowSequences: newSequences })
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Stocks (Niveaux Cibles)</h3>

        {localDiagram.flowSequences.map((seq, seqIndex) => (
          <React.Fragment key={seqIndex}>
            {seq.intermediateElements?.map((elem, elemIndex) => {
              if (elem.type !== 'INVENTORY' || !elem.inventory) return null
              const inv = elem.inventory

              return (
                <Card key={`${seqIndex}-${elemIndex}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <Input
                        value={inv.name || ''}
                        onChange={(e) => updateInventory(seqIndex, elemIndex, { name: e.target.value })}
                        className="w-64"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={inv.type || InventoryType.WIP}
                          onValueChange={(v) => updateInventory(seqIndex, elemIndex, { type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={InventoryType.RAW_MATERIAL}>Matière Première</SelectItem>
                            <SelectItem value={InventoryType.WIP}>En-Cours (WIP)</SelectItem>
                            <SelectItem value={InventoryType.FINISHED_GOODS}>Produit Fini</SelectItem>
                            <SelectItem value={InventoryType.SUPERMARKET}>Supermarché</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantité Cible</Label>
                        <Input
                          type="number"
                          value={inv.quantity || 0}
                          onChange={(e) => updateInventory(seqIndex, elemIndex, { quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Durée Cible (jours)</Label>
                        <Input
                          type="number"
                          value={inv.duration || 0}
                          onChange={(e) => updateInventory(seqIndex, elemIndex, { duration: e.target.value ? parseFloat(e.target.value).toString() : '0' })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderMaterialFlowsTab = () => {
    if (!localDiagram) return null

    const updateMaterialFlow = (seqIndex: number, elemIndex: number, updates: any) => {
      const newSequences = [...localDiagram.flowSequences]
      const elem = newSequences[seqIndex].intermediateElements?.[elemIndex]
      if (elem?.materialFlow) {
        elem.materialFlow = { ...elem.materialFlow, ...updates }
      }
      updateLocalDiagram({ flowSequences: newSequences })
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Flux Matériels (Types Cibles)</h3>

        {localDiagram.flowSequences.map((seq, seqIndex) => (
          <React.Fragment key={seqIndex}>
            {seq.intermediateElements?.map((elem, elemIndex) => {
              if (elem.type !== 'MATERIAL_FLOW' || !elem.materialFlow) return null
              const flow = elem.materialFlow

              return (
                <Card key={`${seqIndex}-${elemIndex}`}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type de Flux</Label>
                        <Select
                          value={flow.flowType || FlowType.PUSH}
                          onValueChange={(v) => updateMaterialFlow(seqIndex, elemIndex, { flowType: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(flowTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Méthode</Label>
                        <Input
                          value={flow.method || ''}
                          onChange={(e) => updateMaterialFlow(seqIndex, elemIndex, { method: e.target.value })}
                          placeholder="Ex: Lot unitaire, Kanban 2 cartes..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const renderInformationFlowsTab = () => {
    if (!localDiagram) return null

    const updateInfoFlow = (flowId: string, updates: Partial<InformationFlow>) => {
      const newFlows = localDiagram.informationFlows.map(f =>
        f.id === flowId ? { ...f, ...updates } : f
      )
      updateLocalDiagram({ informationFlows: newFlows })
    }

    const addInfoFlow = () => {
      const newFlow: InformationFlow = {
        id: generateId('info'),
        sourceNodeId: '',
        targetNodeId: '',
        transmissionType: TransmissionType.ELECTRONIC,
        description: 'Nouveau flux'
      }
      updateLocalDiagram({
        informationFlows: [...localDiagram.informationFlows, newFlow]
      })
    }

    const deleteInfoFlow = (flowId: string) => {
      updateLocalDiagram({
        informationFlows: localDiagram.informationFlows.filter(f => f.id !== flowId)
      })
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Flux d'Information</h3>
          <Button onClick={addInfoFlow}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter un flux
          </Button>
        </div>

        {localDiagram.informationFlows.map(flow => (
          <Card key={flow.id}>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={flow.description || ''}
                    onChange={(e) => updateInfoFlow(flow.id, { description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de Transmission</Label>
                  <Select
                    value={flow.transmissionType || TransmissionType.ELECTRONIC}
                    onValueChange={(v) => updateInfoFlow(flow.id, { transmissionType: v as TransmissionType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transmissionTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fréquence</Label>
                  <Input
                    value={flow.frequency || ''}
                    onChange={(e) => updateInfoFlow(flow.id, { frequency: e.target.value })}
                    placeholder="Ex: Quotidienne, Temps réel..."
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteInfoFlow(flow.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive mr-1" /> Supprimer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderImprovementsTab = () => {
    if (!localDiagram) return null

    const addImprovement = () => {
      const newPoint: ImprovementPoint = {
        id: generateId('kaizen'),
        description: 'Nouvelle amélioration',
        status: ImprovementStatus.IDENTIFIED,
        priority: 'medium' as any,
        x: 0,
        y: 0
      }
      updateLocalDiagram({
        improvementPoints: [...(localDiagram.improvementPoints || []), newPoint]
      })
    }

    const updateImprovement = (id: string, updates: Partial<ImprovementPoint>) => {
      const newPoints = localDiagram.improvementPoints?.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ) || []
      updateLocalDiagram({ improvementPoints: newPoints })
    }

    const deleteImprovement = (id: string) => {
      updateLocalDiagram({
        improvementPoints: localDiagram.improvementPoints?.filter(p => p.id !== id) || []
      })
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Points d'Amélioration (Kaizen)</h3>
          <Button onClick={addImprovement}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>

        {localDiagram.improvementPoints?.map(point => (
          <Card key={point.id}>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={point.description || ''}
                  onChange={(e) => updateImprovement(point.id, { description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select
                    value={String(point.priority || 'medium')}
                    onValueChange={(v) => updateImprovement(point.id, { priority: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={point.status || ImprovementStatus.IDENTIFIED}
                    onValueChange={(v) => updateImprovement(point.id, { status: v as ImprovementStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ImprovementStatus.IDENTIFIED}>Identifié</SelectItem>
                      <SelectItem value={ImprovementStatus.IN_PROGRESS}>En cours</SelectItem>
                      <SelectItem value={ImprovementStatus.RESOLVED}>Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteImprovement(point.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive mr-1" /> Supprimer
              </Button>
            </CardContent>
          </Card>
        ))}

        {(!localDiagram.improvementPoints || localDiagram.improvementPoints.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun point d'amélioration. Cliquez sur "Ajouter" pour définir les Kaizen.
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab()
      case 'actors': return renderActorsTab()
      case 'processSteps': return renderProcessStepsTab()
      case 'indicators': return renderIndicatorsTab()
      case 'inventories': return renderInventoriesTab()
      case 'materialFlows': return renderMaterialFlowsTab()
      case 'informationFlows': return renderInformationFlowsTab()
      case 'improvements': return renderImprovementsTab()
      default: return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel()
    }}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            Créer l'État Futur
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <ScrollArea className="flex-1">
            <div className="p-6">
              {renderActiveTab()}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="text-amber-600">
                  • Modifications non sauvegardées
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Création...' : 'Créer l\'État Futur'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FutureStateDialog
