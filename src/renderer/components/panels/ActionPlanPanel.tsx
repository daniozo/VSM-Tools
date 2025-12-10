/**
 * ActionPlanPanel - Panneau de gestion du plan d'action
 * 
 * Affiche et gère les actions à réaliser pour améliorer le VSM
 * avec priorité, responsable, statut et notes
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/renderer/components/ui/card'
import { Badge } from '@/renderer/components/ui/badge'
import { Button } from '@/renderer/components/ui/button'
import { ScrollArea } from '@/renderer/components/ui/scroll-area'
import { Input } from '@/renderer/components/ui/input'
import { Textarea } from '@/renderer/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog'
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react'

// Types
export type Priority = 'high' | 'medium' | 'low'
export type ActionStatus = 'pending' | 'in_progress' | 'completed'

export interface ActionItem {
  id: string
  action: string
  responsible: string
  priority: Priority
  notes: string
  status: ActionStatus
  dueDate?: string
  createdAt: Date
  updatedAt: Date
}

interface ActionPlanPanelProps {
  projectId?: string
  width?: number
  className?: string
  onActionClick?: (actionId: string) => void
}

// Labels français
const priorityLabels: Record<Priority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse'
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white'
}

const statusIcons: Record<ActionStatus, React.ReactNode> = {
  pending: <Clock size={14} />,
  in_progress: <AlertCircle size={14} />,
  completed: <CheckCircle2 size={14} />
}

export const ActionPlanPanel: React.FC<ActionPlanPanelProps> = ({
  projectId,
  width = 280,
  className,
  onActionClick
}) => {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  // Form state
  const [formAction, setFormAction] = useState('')
  const [formResponsible, setFormResponsible] = useState('')
  const [formPriority, setFormPriority] = useState<Priority>('medium')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<ActionStatus>('pending')
  const [formDueDate, setFormDueDate] = useState('')

  // Load actions from localStorage (à remplacer par API plus tard)
  useEffect(() => {
    const storageKey = projectId ? `vsm-action-plan-${projectId}` : 'vsm-action-plan-default'
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      const withDates = parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }))
      setActions(withDates)
    }
  }, [projectId])

  // Save actions to localStorage
  const saveActions = (updatedActions: ActionItem[]) => {
    const storageKey = projectId ? `vsm-action-plan-${projectId}` : 'vsm-action-plan-default'
    localStorage.setItem(storageKey, JSON.stringify(updatedActions))
    setActions(updatedActions)
  }

  // Filtrage
  const filteredActions = actions.filter(action => {
    if (filterStatus !== 'all' && action.status !== filterStatus) return false
    if (filterPriority !== 'all' && action.priority !== filterPriority) return false
    return true
  })

  // Statistiques
  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    highPriority: actions.filter(a => a.priority === 'high' && a.status !== 'completed').length
  }

  const resetForm = () => {
    setFormAction('')
    setFormResponsible('')
    setFormPriority('medium')
    setFormNotes('')
    setFormStatus('pending')
    setFormDueDate('')
    setEditingAction(null)
  }

  const handleOpenDialog = (action?: ActionItem) => {
    if (action) {
      setEditingAction(action)
      setFormAction(action.action)
      setFormResponsible(action.responsible)
      setFormPriority(action.priority)
      setFormNotes(action.notes)
      setFormStatus(action.status)
      setFormDueDate(action.dueDate || '')
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formAction.trim()) return

    const now = new Date()

    if (editingAction) {
      // Mise à jour
      const updated = actions.map(a => 
        a.id === editingAction.id 
          ? {
              ...a,
              action: formAction.trim(),
              responsible: formResponsible.trim(),
              priority: formPriority,
              notes: formNotes.trim(),
              status: formStatus,
              dueDate: formDueDate || undefined,
              updatedAt: now
            }
          : a
      )
      saveActions(updated)
    } else {
      // Création
      const newAction: ActionItem = {
        id: `action-${Date.now()}`,
        action: formAction.trim(),
        responsible: formResponsible.trim(),
        priority: formPriority,
        notes: formNotes.trim(),
        status: formStatus,
        dueDate: formDueDate || undefined,
        createdAt: now,
        updatedAt: now
      }
      saveActions([...actions, newAction])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (actionId: string) => {
    const updated = actions.filter(a => a.id !== actionId)
    saveActions(updated)
  }

  const handleToggleStatus = (actionId: string) => {
    const updated = actions.map(a => {
      if (a.id === actionId) {
        // Cycle: pending -> in_progress -> completed -> pending
        const nextStatus: ActionStatus = 
          a.status === 'pending' ? 'in_progress' :
          a.status === 'in_progress' ? 'completed' : 'pending'
        return { ...a, status: nextStatus, updatedAt: new Date() }
      }
      return a
    })
    saveActions(updated)
  }

  if (!projectId) {
    return (
      <div
        className={`bg-background border-r overflow-hidden flex flex-col ${className || ''}`}
        style={{ width: `${width}px` }}
      >
        <div className="h-9 px-3 border-b flex items-center bg-muted/30">
          <span className="text-sm font-medium">Plan d'action</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
          <p>Ouvrez un projet pour gérer le plan d'action</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-background border-r overflow-hidden flex flex-col ${className || ''}`}
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="h-9 px-3 border-b flex items-center justify-between bg-muted/30">
        <span className="text-sm font-medium">Plan d'action</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleOpenDialog()}
          title="Nouvelle action"
        >
          <Plus size={14} />
        </Button>
      </div>

      {/* Stats */}
      <div className="p-2 border-b bg-muted/10">
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="text-center">
            <div className="font-semibold">{stats.total}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-500">{stats.pending}</div>
            <div className="text-muted-foreground">À faire</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-500">{stats.inProgress}</div>
            <div className="text-muted-foreground">En cours</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-500">{stats.completed}</div>
            <div className="text-muted-foreground">Fait</div>
          </div>
        </div>
        {stats.highPriority > 0 && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {stats.highPriority} action(s) haute priorité
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="p-2 border-b flex gap-2">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="pending">À faire</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as any)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des actions */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredActions.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {actions.length === 0 
                ? "Aucune action définie" 
                : "Aucune action ne correspond aux filtres"}
            </div>
          ) : (
            filteredActions.map(action => (
              <Card 
                key={action.id} 
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  action.status === 'completed' ? 'opacity-60' : ''
                }`}
                onClick={() => onActionClick?.(action.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStatus(action.id)
                      }}
                      className="mt-0.5"
                    >
                      {action.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : action.status === 'in_progress' ? (
                        <Clock size={16} className="text-orange-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        action.status === 'completed' ? 'line-through' : ''
                      }`}>
                        {action.action}
                      </p>
                      {action.responsible && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <User size={10} />
                          {action.responsible}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[action.priority]}`}>
                          {priorityLabels[action.priority]}
                        </Badge>
                        {action.dueDate && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDialog(action)
                        }}
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(action.id)
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Dialogue de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? 'Modifier l\'action' : 'Nouvelle action'}
            </DialogTitle>
            <DialogDescription>
              {editingAction 
                ? 'Modifiez les détails de cette action' 
                : 'Ajoutez une nouvelle action au plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action *</label>
              <Input
                value={formAction}
                onChange={(e) => setFormAction(e.target.value)}
                placeholder="Décrire l'action à réaliser..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsable</label>
                <Input
                  value={formResponsible}
                  onChange={(e) => setFormResponsible(e.target.value)}
                  placeholder="Nom du responsable"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priorité</label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ActionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">À faire</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Échéance</label>
                <Input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!formAction.trim()}>
              {editingAction ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ActionPlanPanel
