/**
 * PropertiesPanel - Panneau des Propriétés
 * 
 * Selon conception_vsm_studio.md :
 * - Affiche les attributs de l'objet actuellement sélectionné
 * - Lit les données réelles depuis le vsmStore
 * - Formulaire en lecture seule pour les propriétés principales
 * - Les propriétés structurelles se modifient via le Dialogue de Configuration
 */

import React, { useMemo } from 'react'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Label } from '@/renderer/components/ui/label'
import { Input } from '@/renderer/components/ui/input'
import { Badge } from '@/renderer/components/ui/badge'
import { Button } from '@/renderer/components/ui/button'
import { Separator } from '@/renderer/components/ui/separator'
import {
  Settings2,
  Info,
  Factory,
  Package,
  Users,
  Truck,
  ArrowRight,
  Activity,
  Lightbulb,
  Radio,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVsmStore } from '@/store/vsmStore'
import {
  NodeType,
  InventoryType,
  FlowType,
  TransmissionType,
  ImprovementStatus,
  DeliveryFrequency,
  Node,
  Inventory,
  ImprovementPoint,
  TextAnnotation,
  Supplier,
  Customer,
  ControlCenter,
  InformationFlow,
  FlowSequence
} from '@/shared/types/vsm-model'

interface PropertiesPanelProps {
  width: number
  selectedElementId: string | null
  className?: string
}

// Labels lisibles pour les enums
const nodeTypeLabels: Record<NodeType, string> = {
  [NodeType.SUPPLIER]: 'Fournisseur',
  [NodeType.PROCESS_STEP]: 'Étape de Processus',
  [NodeType.CUSTOMER]: 'Client',
  [NodeType.CONTROL_CENTER]: 'Centre de Contrôle'
}

const inventoryTypeLabels: Record<InventoryType, string> = {
  [InventoryType.RAW_MATERIAL]: 'Matière Première',
  [InventoryType.WIP]: 'En-cours (WIP)',
  [InventoryType.FINISHED_GOODS]: 'Produits Finis',
  [InventoryType.SUPERMARKET]: 'Supermarché'
}

const flowTypeLabels: Record<FlowType, string> = {
  [FlowType.PUSH]: 'Flux Poussé',
  [FlowType.PULL]: 'Flux Tiré',
  [FlowType.FIFO_LANE]: 'File FIFO',
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

const improvementStatusLabels: Record<ImprovementStatus, string> = {
  [ImprovementStatus.IDENTIFIED]: 'Identifié',
  [ImprovementStatus.IN_PROGRESS]: 'En cours',
  [ImprovementStatus.RESOLVED]: 'Résolu'
}

// Icônes par type d'élément
const getIconForType = (type: string): React.ReactNode => {
  switch (type) {
    case 'node':
    case NodeType.PROCESS_STEP:
      return <Factory className="h-5 w-5" />
    case 'supplier':
    case NodeType.SUPPLIER:
      return <Truck className="h-5 w-5" />
    case 'customer':
    case NodeType.CUSTOMER:
      return <Users className="h-5 w-5" />
    case 'controlCenter':
    case NodeType.CONTROL_CENTER:
      return <Building2 className="h-5 w-5" />
    case 'inventory':
      return <Package className="h-5 w-5" />
    case 'improvementPoint':
      return <Lightbulb className="h-5 w-5" />
    case 'materialFlow':
      return <ArrowRight className="h-5 w-5" />
    case 'informationFlow':
      return <Radio className="h-5 w-5" />
    default:
      return <Info className="h-5 w-5" />
  }
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  width,
  // selectedElementId est conservé pour compatibilité mais on utilise selectedElement du store
  className
}) => {
  const { diagram, selectedElement } = useVsmStore()

  // Trouver l'élément sélectionné dans le diagramme
  const elementData = useMemo(() => {
    if (!diagram || !selectedElement) return null

    switch (selectedElement.type) {
      case 'node': {
        const node = diagram.nodes.find(n => n.id === selectedElement.id)
        if (!node) return null
        return {
          type: 'node' as const,
          data: node,
          name: node.name,
          typeLabel: nodeTypeLabels[node.type] || node.type,
          icon: getIconForType(node.type)
        }
      }
      case 'supplier': {
        if (!diagram.actors?.supplier) return null
        return {
          type: 'supplier' as const,
          data: diagram.actors.supplier,
          name: diagram.actors.supplier.name || 'Fournisseur',
          typeLabel: 'Fournisseur',
          icon: getIconForType('supplier')
        }
      }
      case 'customer': {
        if (!diagram.actors?.customer) return null
        return {
          type: 'customer' as const,
          data: diagram.actors.customer,
          name: diagram.actors.customer.name || 'Client',
          typeLabel: 'Client',
          icon: getIconForType('customer')
        }
      }
      case 'controlCenter': {
        if (!diagram.actors?.controlCenter) return null
        return {
          type: 'controlCenter' as const,
          data: diagram.actors.controlCenter,
          name: diagram.actors.controlCenter.name || 'Centre de Contrôle',
          typeLabel: 'Centre de Contrôle',
          icon: getIconForType('controlCenter')
        }
      }
      case 'inventory': {
        const sequence = diagram.flowSequences.find(
          s => s.order === selectedElement.sequenceOrder
        )
        if (!sequence) return null
        const element = sequence.intermediateElements.find(
          e => e.order === selectedElement.elementOrder && e.type === 'INVENTORY'
        )
        if (!element?.inventory) return null
        return {
          type: 'inventory' as const,
          data: element.inventory,
          name: element.inventory.name,
          typeLabel: inventoryTypeLabels[element.inventory.type] || element.inventory.type,
          icon: getIconForType('inventory')
        }
      }
      case 'informationFlow': {
        const flow = diagram.informationFlows.find(f => f.id === selectedElement.id)
        if (!flow) return null
        return {
          type: 'informationFlow' as const,
          data: flow,
          name: flow.description || 'Flux d\'information',
          typeLabel: 'Flux d\'Information',
          icon: getIconForType('informationFlow')
        }
      }
      case 'materialFlow': {
        const sequence = diagram.flowSequences.find(s => s.order === selectedElement.sequenceOrder)
        if (!sequence) return null
        // Récupérer le flux matériel depuis la séquence
        const materialFlow = sequence.intermediateElements.find(e => e.type === 'MATERIAL_FLOW')?.materialFlow
        const fromNode = diagram.nodes.find(n => n.id === sequence.fromNodeId)
        const toNode = diagram.nodes.find(n => n.id === sequence.toNodeId)
        return {
          type: 'materialFlow' as const,
          data: { sequence, materialFlow, fromNode, toNode },
          name: `${fromNode?.name || '?'} → ${toNode?.name || '?'}`,
          typeLabel: 'Flux Matériel',
          icon: getIconForType('materialFlow')
        }
      }
      case 'improvementPoint': {
        const point = diagram.improvementPoints.find(p => p.id === selectedElement.id)
        if (!point) return null
        return {
          type: 'improvementPoint' as const,
          data: point,
          name: point.description.substring(0, 30) + (point.description.length > 30 ? '...' : ''),
          typeLabel: 'Point d\'Amélioration',
          icon: getIconForType('improvementPoint')
        }
      }
      case 'textAnnotation': {
        const annotation = diagram.textAnnotations.find(a => a.id === selectedElement.id)
        if (!annotation) return null
        return {
          type: 'textAnnotation' as const,
          data: annotation,
          name: annotation.content.substring(0, 30) + (annotation.content.length > 30 ? '...' : ''),
          typeLabel: 'Annotation',
          icon: <Info className="h-5 w-5" />
        }
      }
      default:
        return null
    }
  }, [diagram, selectedElement])

  // Render des propriétés d'un nœud
  const renderNodeProperties = (node: Node) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ID</Label>
          <Input value={node.id} readOnly className="h-8 bg-muted/50 cursor-not-allowed font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input value={node.name} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Input value={nodeTypeLabels[node.type] || node.type} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        {node.type === NodeType.PROCESS_STEP && node.operators !== undefined && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Opérateurs</Label>
            <Input value={node.operators.toString()} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}
      </div>

      {/* Indicateurs du nœud */}
      {node.indicators && node.indicators.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Indicateurs ({node.indicators.length})</span>
            </div>

            <div className="space-y-2">
              {node.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{ind.name}</span>
                    <span className="text-xs text-muted-foreground">{ind.mode}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {ind.value || '—'} <span className="text-muted-foreground">{ind.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )

  // Render des propriétés du fournisseur
  const renderSupplierProperties = (supplier: Supplier) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input value={supplier.name} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        {supplier.contact && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Contact</Label>
            <Input value={supplier.contact} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fréquence de livraison</Label>
          <Input
            value={deliveryFrequencyLabels[supplier.deliveryFrequency] || supplier.deliveryFrequency}
            readOnly
            className="h-8 text-sm bg-muted/50 cursor-not-allowed"
          />
        </div>

        {supplier.customFrequency && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fréquence personnalisée</Label>
            <Input value={supplier.customFrequency} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Délai de livraison</Label>
          <Input value={`${supplier.leadTime} jours`} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>
      </div>
    </>
  )

  // Render des propriétés du client
  const renderCustomerProperties = (customer: Customer) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input value={customer.name} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        {customer.contact && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Contact</Label>
            <Input value={customer.contact} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Demande</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <span className="text-sm">Demande quotidienne</span>
          <span className="text-sm font-medium">{customer.dailyDemand} <span className="text-muted-foreground">unités/jour</span></span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <span className="text-sm">Takt Time</span>
          <span className="text-sm font-medium">{customer.taktTime} <span className="text-muted-foreground">sec/unité</span></span>
        </div>

        {customer.workingHoursPerDay && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm">Heures de travail</span>
            <span className="text-sm font-medium">{customer.workingHoursPerDay} <span className="text-muted-foreground">h/jour</span></span>
          </div>
        )}

        {customer.deliveryFrequency && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm">Fréquence livraison</span>
            <span className="text-sm font-medium">{customer.deliveryFrequency}</span>
          </div>
        )}
      </div>
    </>
  )

  // Render des propriétés du centre de contrôle
  const renderControlCenterProperties = (controlCenter: ControlCenter) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input value={controlCenter.name} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        {controlCenter.description && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <textarea
              value={controlCenter.description}
              readOnly
              className="w-full h-20 p-2 text-sm rounded-md border bg-muted/50 cursor-not-allowed resize-none"
            />
          </div>
        )}
      </div>
    </>
  )

  // Render des propriétés d'un flux d'information
  const renderInformationFlowProperties = (flow: InformationFlow) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ID</Label>
          <Input value={flow.id} readOnly className="h-8 bg-muted/50 cursor-not-allowed font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Input value={flow.description} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Source</Label>
          <Input value={flow.sourceNodeId} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Cible</Label>
          <Input value={flow.targetNodeId} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type de transmission</Label>
          <Input
            value={transmissionTypeLabels[flow.transmissionType] || flow.transmissionType}
            readOnly
            className="h-8 text-sm bg-muted/50 cursor-not-allowed"
          />
        </div>

        {flow.frequency && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fréquence</Label>
            <Input value={flow.frequency} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}
      </div>
    </>
  )

  // Render des propriétés d'un flux matériel
  const renderMaterialFlowProperties = (data: { sequence: FlowSequence; materialFlow?: any; fromNode?: Node; toNode?: Node }) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Source</Label>
          <Input value={data.fromNode?.name || data.sequence.fromNodeId} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Cible</Label>
          <Input value={data.toNode?.name || data.sequence.toNodeId} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        {data.materialFlow && (
          <>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type de flux</Label>
              <Input
                value={data.materialFlow.flowType in flowTypeLabels ? flowTypeLabels[data.materialFlow.flowType as FlowType] : data.materialFlow.flowType}
                readOnly
                className="h-8 text-sm bg-muted/50 cursor-not-allowed"
              />
            </div>            {data.materialFlow.method && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Méthode</Label>
                <Input value={data.materialFlow.method} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Éléments intermédiaires</span>
        </div>

        <div className="text-sm text-muted-foreground">
          {data.sequence.intermediateElements.length} élément(s) dans cette séquence
        </div>
      </div>
    </>
  )

  // Render des propriétés d'un stock
  const renderInventoryProperties = (inventory: Inventory) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ID</Label>
          <Input value={inventory.id} readOnly className="h-8 bg-muted/50 cursor-not-allowed font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nom</Label>
          <Input value={inventory.name} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Input value={inventoryTypeLabels[inventory.type] || inventory.type} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Mode de saisie</Label>
          <Input value={inventory.mode || 'Statique'} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
        </div>
      </div>

      <Separator />

      {/* Métriques du stock */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Métriques</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm">Quantité</span>
            <span className="text-sm font-medium">
              {inventory.quantity} <span className="text-muted-foreground">unités</span>
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm">Durée</span>
            <span className="text-sm font-medium">
              {inventory.duration} <span className="text-muted-foreground">jours</span>
            </span>
          </div>
        </div>
      </div>

      {/* Indicateurs du stock */}
      {inventory.indicators && inventory.indicators.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Indicateurs ({inventory.indicators.length})</span>
            </div>

            <div className="space-y-2">
              {inventory.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{ind.name}</span>
                    <span className="text-xs text-muted-foreground">{ind.mode}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {ind.value || '—'} <span className="text-muted-foreground">{ind.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )

  // Render des propriétés d'un point d'amélioration
  const renderImprovementPointProperties = (point: ImprovementPoint) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ID</Label>
          <Input value={point.id} readOnly className="h-8 bg-muted/50 cursor-not-allowed font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <textarea
            value={point.description}
            readOnly
            className="w-full h-20 p-2 text-sm rounded-md border bg-muted/50 cursor-not-allowed resize-none"
          />
        </div>

        {point.status && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Statut</Label>
            <div>
              <Badge variant={
                point.status === ImprovementStatus.RESOLVED ? 'default' :
                  point.status === ImprovementStatus.IN_PROGRESS ? 'secondary' : 'outline'
              }>
                {improvementStatusLabels[point.status] || point.status}
              </Badge>
            </div>
          </div>
        )}

        {point.priority !== undefined && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Priorité</Label>
            <div>
              <Badge variant={
                point.priority === 1 ? 'destructive' :
                  point.priority === 2 ? 'secondary' : 'outline'
              }>
                {point.priority === 1 ? 'Haute' : point.priority === 2 ? 'Moyenne' : 'Basse'}
              </Badge>
            </div>
          </div>
        )}

        {point.owner && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Responsable</Label>
            <Input value={point.owner} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}

        {point.dueDate && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Échéance</Label>
            <Input value={new Date(point.dueDate).toLocaleDateString('fr-FR')} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Position</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input value={point.x.toString()} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input value={point.y.toString()} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        </div>
      </div>
    </>
  )

  // Render des propriétés d'une annotation
  const renderTextAnnotationProperties = (annotation: TextAnnotation) => (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Informations</span>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ID</Label>
          <Input value={annotation.id} readOnly className="h-8 bg-muted/50 cursor-not-allowed font-mono text-xs" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Texte</Label>
          <textarea
            value={annotation.content}
            readOnly
            className="w-full h-20 p-2 text-sm rounded-md border bg-muted/50 cursor-not-allowed resize-none"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Position</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input value={annotation.x.toString()} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input value={annotation.y.toString()} readOnly className="h-8 text-sm bg-muted/50 cursor-not-allowed" />
          </div>
        </div>
      </div>
    </>
  )

  // Render du contenu selon le type d'élément
  const renderElementContent = () => {
    if (!elementData) return null

    switch (elementData.type) {
      case 'node':
        return renderNodeProperties(elementData.data as Node)
      case 'supplier':
        return renderSupplierProperties(elementData.data as Supplier)
      case 'customer':
        return renderCustomerProperties(elementData.data as Customer)
      case 'controlCenter':
        return renderControlCenterProperties(elementData.data as ControlCenter)
      case 'inventory':
        return renderInventoryProperties(elementData.data as Inventory)
      case 'informationFlow':
        return renderInformationFlowProperties(elementData.data as InformationFlow)
      case 'materialFlow':
        return renderMaterialFlowProperties(elementData.data as { sequence: FlowSequence; materialFlow?: any; fromNode?: Node; toNode?: Node })
      case 'improvementPoint':
        return renderImprovementPointProperties(elementData.data as ImprovementPoint)
      case 'textAnnotation':
        return renderTextAnnotationProperties(elementData.data as TextAnnotation)
      default:
        return null
    }
  }

  return (
    <div
      className={cn('flex flex-col bg-background border-l', className)}
      style={{ width: `${width}px` }}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between h-9 px-3 border-b bg-muted/30">
        <span className="text-sm font-medium">Propriétés</span>
      </div>

      <ScrollArea className="flex-1">
        {elementData ? (
          <div className="p-3 space-y-4">
            {/* Type et icône */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {elementData.icon}
              </div>
              <div>
                <p className="font-medium truncate max-w-[180px]">{elementData.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {elementData.typeLabel}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Contenu spécifique à l'élément */}
            {renderElementContent()}

            <Separator />

            {/* Action pour ouvrir la configuration */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Ouvrir le dialogue de configuration
                useVsmStore.getState().openConfigDialog()
              }}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configurer...
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            {!diagram ? (
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm">Aucun projet ouvert</p>
                <p className="text-xs mt-1">Ouvrez ou créez un projet pour voir ses propriétés</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm">Sélectionnez un élément</p>
                <p className="text-xs mt-1">dans l'explorateur ou sur le canevas</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
