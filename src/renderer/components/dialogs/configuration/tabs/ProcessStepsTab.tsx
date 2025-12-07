/**
 * Onglet 4 : Étapes de Production
 * 
 * Gère les nœuds de type PROCESS_STEP avec leurs opérateurs
 */

import React, { useState } from 'react'
import { VSMDiagram, Node, NodeType, generateId } from '@/shared/types/vsm-model'
import { FormTable, Column } from '../shared/FormTable'
import { FormField } from '../shared/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

interface ProcessStepsTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

export const ProcessStepsTab: React.FC<ProcessStepsTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Node>>({})

  // Filtrer uniquement les nœuds PROCESS_STEP
  const processSteps = diagram.nodes.filter(node => node.type === NodeType.PROCESS_STEP)

  const columns: Column<Node>[] = [
    {
      key: 'order',
      label: 'Ordre',
      width: '15%',
      render: (node) => {
        const index = processSteps.findIndex(n => n.id === node.id)
        return <span className="text-sm font-mono text-left block">{index + 1}</span>
      }
    },
    {
      key: 'name',
      label: 'Nom de l\'étape',
      width: '60%'
    },
    {
      key: 'operators',
      label: 'Opérateurs',
      width: '25%',
      render: (node) => (
        <span className="text-sm text-left block">
          {node.operators ?? 0}
        </span>
      )
    }
  ]

  const handleAdd = () => {
    setEditingIndex(null)
    setFormData({
      id: generateId('node'),
      name: '',
      type: NodeType.PROCESS_STEP,
      operators: 1,
      indicators: []
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (node: Node, index: number) => {
    setEditingIndex(index)
    setFormData(node)
    setIsDialogOpen(true)
  }

  const handleDelete = (node: Node) => {
    const confirmed = window.confirm(`Supprimer l'étape "${node.name}" ?\n\nAttention : Les flux et stocks liés à cette étape seront également supprimés.`)
    if (confirmed) {
      onUpdate({
        nodes: diagram.nodes.filter(n => n.id !== node.id),
        // Supprimer également les séquences de flux qui référencent ce nœud
        flowSequences: diagram.flowSequences.filter(
          fs => fs.fromNodeId !== node.id && fs.toNodeId !== node.id
        ),
        // Supprimer les flux d'information qui référencent ce nœud
        informationFlows: diagram.informationFlows.filter(
          inf => inf.sourceNodeId !== node.id && inf.targetNodeId !== node.id
        )
      })
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return

    const allNodes = [...diagram.nodes]
    const processStepIndices = allNodes
      .map((node, idx) => ({ node, idx }))
      .filter(({ node }) => node.type === NodeType.PROCESS_STEP)

    const currentGlobalIndex = processStepIndices[index].idx
    const previousGlobalIndex = processStepIndices[index - 1].idx

      // Échanger les positions
      ;[allNodes[currentGlobalIndex], allNodes[previousGlobalIndex]] =
        [allNodes[previousGlobalIndex], allNodes[currentGlobalIndex]]

    onUpdate({ nodes: allNodes })
  }

  const handleMoveDown = (index: number) => {
    if (index === processSteps.length - 1) return

    const allNodes = [...diagram.nodes]
    const processStepIndices = allNodes
      .map((node, idx) => ({ node, idx }))
      .filter(({ node }) => node.type === NodeType.PROCESS_STEP)

    const currentGlobalIndex = processStepIndices[index].idx
    const nextGlobalIndex = processStepIndices[index + 1].idx

      // Échanger les positions
      ;[allNodes[currentGlobalIndex], allNodes[nextGlobalIndex]] =
        [allNodes[nextGlobalIndex], allNodes[currentGlobalIndex]]

    onUpdate({ nodes: allNodes })
  }

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Veuillez saisir un nom pour l\'étape')
      return
    }

    const newNode: Node = {
      id: formData.id || generateId('node'),
      name: formData.name.trim(),
      type: NodeType.PROCESS_STEP,
      operators: formData.operators ?? 1,
      indicators: formData.indicators || []
    }

    if (editingIndex !== null) {
      // Modification : trouver l'index global dans diagram.nodes
      const globalIndex = diagram.nodes.findIndex(n => n.id === newNode.id)
      const updatedNodes = [...diagram.nodes]
      updatedNodes[globalIndex] = newNode
      onUpdate({ nodes: updatedNodes })
    } else {
      // Ajout : ajouter à la fin de diagram.nodes
      onUpdate({
        nodes: [...diagram.nodes, newNode]
      })
    }

    setIsDialogOpen(false)
    setFormData({})
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setFormData({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Étapes de Production
        </h3>
        <p className="text-sm text-muted-foreground">
          Définissez les étapes de votre processus de production.
          L'ordre des étapes peut être modifié avec les boutons ↑↓.
        </p>
      </div>

      {/* Table des étapes */}
      <FormTable
        columns={columns}
        data={processSteps}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        addLabel="Ajouter une étape"
        emptyMessage="Aucune étape de production définie"
        keyExtractor={(node) => node.id}
        showReorder={true}
      />

      {/* Dialog Ajouter/Modifier */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Modifier l\'étape' : 'Ajouter une étape'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Nom de l'étape"
              type="text"
              value={formData.name || ''}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            <FormField
              label="Nombre d'opérateurs"
              type="number"
              value={formData.operators ?? 1}
              onChange={(value) => setFormData({ ...formData, operators: Number(value) })}
              min={0}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingIndex !== null ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
