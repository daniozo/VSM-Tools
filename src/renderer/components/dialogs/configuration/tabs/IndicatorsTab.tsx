/**
 * Onglet 5 : Indicateurs
 * 
 * Gère les indicateurs (KPIs) attachés aux nœuds et stocks
 * Vue master-detail : sélection du nœud à gauche, gestion des indicateurs à droite
 * 
 * Fonctionnalités :
 * - Ajouter un indicateur standard depuis la bibliothèque
 * - Créer un indicateur personnalisé
 */

import React, { useState } from 'react'
import {
  VSMDiagram,
  Node,
  Indicator,
  NodeType,
  DataSourceType,
  generateId
} from '@/shared/types/vsm-model'
import { StandardIndicator } from '@/shared/data/standardIndicators'
import { FormTable, Column } from '../shared/FormTable'
import { Card } from '@/renderer/components/ui/card'
import { Button } from '@/renderer/components/ui/button'
import { IndicatorDialog, IndicatorData } from '../IndicatorDialog'
import { StandardIndicatorDialog } from '../StandardIndicatorDialog'

interface IndicatorsTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const IndicatorsTab: React.FC<IndicatorsTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    diagram.nodes.length > 0 ? diagram.nodes[0].id : null
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStandardDialogOpen, setIsStandardDialogOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)

  // Filtrer uniquement les étapes de production (pas les acteurs)
  const processSteps = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP)

  const selectedNode = processSteps.find(n => n.id === selectedNodeId)
  const indicators = selectedNode?.indicators || []

  // Sources de données disponibles (SQL, REST)
  const availableDataSources = diagram.dataSources.filter(
    ds => ds.type === DataSourceType.SQL || ds.type === DataSourceType.REST
  )

  const columns: Column<Indicator>[] = [
    {
      key: 'name',
      label: 'Nom',
      width: '30%'
    },
    {
      key: 'unit',
      label: 'Unité',
      width: '15%'
    },
    {
      key: 'mode',
      label: 'Mode',
      width: '20%',
      render: (ind) => (
        <span className="text-sm">{ind.mode}</span>
      )
    },
    {
      key: 'value',
      label: 'Valeur',
      width: '20%',
      render: (ind) => {
        if (ind.mode === 'Statique' && ind.value) {
          return <span className="text-sm">{ind.value} {ind.unit}</span>
        }
        if (ind.mode === 'Dynamique' && ind.dataConnection) {
          const ds = diagram.dataSources.find(d => d.id === ind.dataConnection?.dataSourceId)
          return <span className="text-sm text-muted-foreground">{ds?.name || 'Source'}</span>
        }
        return <span className="text-sm text-muted-foreground">—</span>
      }
    }
  ]

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId)
  }

  const handleAdd = () => {
    setEditingIndicator(null)
    setIsDialogOpen(true)
  }

  const handleAddFromStandard = () => {
    setIsStandardDialogOpen(true)
  }

  const handleStandardSelect = (standard: StandardIndicator) => {
    if (!selectedNode) {
      alert('Aucune étape sélectionnée')
      return
    }

    // Créer un nouvel indicateur à partir du standard
    const newIndicator: Indicator = {
      id: generateId('ind'),
      name: standard.name,
      unit: standard.unit,
      mode: standard.defaultMode,
      value: standard.defaultMode === 'Statique' ? '' : undefined,
      dataConnection: undefined,
      lastUpdated: new Date().toISOString()
    }

    const updatedNode: Node = {
      ...selectedNode,
      indicators: [...selectedNode.indicators, newIndicator]
    }

    onUpdate({
      nodes: diagram.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
    })
  }

  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator)
    setIsDialogOpen(true)
  }

  const handleDelete = (indicator: Indicator) => {
    const confirmed = window.confirm(`Supprimer l'indicateur "${indicator.name}" ?`)
    if (confirmed && selectedNode) {
      const updatedNode: Node = {
        ...selectedNode,
        indicators: selectedNode.indicators.filter(ind => ind.id !== indicator.id)
      }

      onUpdate({
        nodes: diagram.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
      })
    }
  }

  const handleSave = (data: IndicatorData) => {
    if (!selectedNode) {
      alert('Aucune étape sélectionnée')
      return
    }

    const newIndicator: Indicator = {
      id: data.id,
      name: data.name,
      unit: data.unit,
      mode: data.mode,
      value: data.value,
      dataConnection: data.dataConnection,
      lastUpdated: new Date().toISOString()
    }

    let updatedIndicators: Indicator[]
    if (editingIndicator) {
      // Mode édition : remplacer l'indicateur existant
      updatedIndicators = selectedNode.indicators.map(ind =>
        ind.id === editingIndicator.id ? newIndicator : ind
      )
    } else {
      // Mode ajout : ajouter à la fin
      updatedIndicators = [...selectedNode.indicators, newIndicator]
    }

    const updatedNode: Node = {
      ...selectedNode,
      indicators: updatedIndicators
    }

    onUpdate({
      nodes: diagram.nodes.map(n => n.id === selectedNode.id ? updatedNode : n)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Indicateurs
        </h3>
        <p className="text-sm text-muted-foreground">
          Configurez les indicateurs pour chaque étape de production.
          Sélectionnez une étape à gauche, puis gérez ses indicateurs à droite.
        </p>
      </div>

      {/* Layout Master-Detail */}
      <div className="grid grid-cols-12 gap-4">
        {/* Liste des étapes */}
        <Card className="col-span-4 p-4">
          <h4 className="font-semibold mb-3">Étapes de Production</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {processSteps.map(node => (
              <button
                key={node.id}
                onClick={() => handleNodeSelect(node.id)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${selectedNodeId === node.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                <div className="font-medium text-sm">{node.name}</div>
                <div className="text-xs opacity-80">
                  {node.indicators.length} indicateur(s)
                </div>
              </button>
            ))}
            {processSteps.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Aucune étape disponible.<br />
                Créez d'abord des étapes dans l'onglet Étapes de Production.
              </div>
            )}
          </div>
        </Card>

        {/* Indicateurs de l'étape sélectionnée */}
        <div className="col-span-8">
          {selectedNode ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">
                  Indicateurs de : <span className="text-primary">{selectedNode.name}</span>
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFromStandard}
                  >
                    Ajouter depuis Standards
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAdd}
                  >
                    + Personnalisé
                  </Button>
                </div>
              </div>
              <FormTable
                columns={columns}
                data={indicators}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Aucun indicateur configuré pour cette étape"
                keyExtractor={(ind) => ind.id}
              />
            </Card>
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                Sélectionnez une étape pour gérer ses indicateurs
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Ajouter/Modifier Indicateur */}
      <IndicatorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        availableDataSources={availableDataSources}
        initialData={editingIndicator ? {
          id: editingIndicator.id,
          name: editingIndicator.name,
          unit: editingIndicator.unit,
          mode: editingIndicator.mode,
          value: editingIndicator.value,
          dataConnection: editingIndicator.dataConnection
        } : undefined}
        onSave={handleSave}
      />

      {/* Dialog Sélection Indicateur Standard */}
      <StandardIndicatorDialog
        open={isStandardDialogOpen}
        onOpenChange={setIsStandardDialogOpen}
        onSelect={handleStandardSelect}
      />
    </div>
  )
}
