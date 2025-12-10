/**
 * ActionPlanTab - Vue complète du plan d'action (onglet central)
 * 
 * Affiche le plan d'action avec une vue table plus détaillée
 * permettant de gérer toutes les actions du projet
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/renderer/components/ui/card'
import { Badge } from '@/renderer/components/ui/badge'
import { Button } from '@/renderer/components/ui/button'
import { Input } from '@/renderer/components/ui/input'
import { Textarea } from '@/renderer/components/ui/textarea'
import { Checkbox } from '@/renderer/components/ui/checkbox'
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
  AlertCircle,
  Download,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { ActionItem, Priority, ActionStatus } from './ActionPlanPanel'

interface ActionPlanTabProps {
  projectId?: string
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

export const ActionPlanTab: React.FC<ActionPlanTabProps> = ({ projectId }) => {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [sortField, setSortField] = useState<'priority' | 'status' | 'dueDate' | 'createdAt'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formAction, setFormAction] = useState('')
  const [formResponsible, setFormResponsible] = useState('')
  const [formPriority, setFormPriority] = useState<Priority>('medium')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<ActionStatus>('pending')
  const [formDueDate, setFormDueDate] = useState('')

  // Load actions from localStorage
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

  // Filtrage et tri
  const filteredActions = actions
    .filter(action => {
      if (filterStatus !== 'all' && action.status !== filterStatus) return false
      if (filterPriority !== 'all' && action.priority !== filterPriority) return false
      if (searchQuery && !action.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !action.responsible.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'status':
          const statusOrder = { pending: 0, in_progress: 1, completed: 2 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = dateA - dateB
          break
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Statistiques
  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    highPriority: actions.filter(a => a.priority === 'high' && a.status !== 'completed').length,
    completionRate: actions.length > 0 
      ? Math.round((actions.filter(a => a.status === 'completed').length / actions.length) * 100)
      : 0
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
      const updated = actions.filter(a => a.id !== actionId)
      saveActions(updated)
    }
  }

  const handleStatusChange = (actionId: string, newStatus: ActionStatus) => {
    const updated = actions.map(a => 
      a.id === actionId 
        ? { ...a, status: newStatus, updatedAt: new Date() }
        : a
    )
    saveActions(updated)
  }

  const handleExport = () => {
    const data = JSON.stringify(actions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plan-action-${projectId || 'export'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  if (!projectId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">Aucun projet ouvert</h3>
          <p>Ouvrez un projet pour gérer le plan d'action</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plan d'Action</h1>
          <p className="text-muted-foreground">
            Gérez les actions d'amélioration de votre VSM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus size={16} className="mr-2" />
            Nouvelle action
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">À faire</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Terminé</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Avancement</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-40">
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

      {/* Table */}
      <Card className="flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="min-w-[300px]">Action</TableHead>
                <TableHead className="w-32">Responsable</TableHead>
                <TableHead 
                  className="w-28 cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    Priorité
                    {sortField === 'priority' && (
                      sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-28 cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Statut
                    {sortField === 'status' && (
                      sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-28 cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort('dueDate')}
                >
                  <div className="flex items-center gap-1">
                    Échéance
                    {sortField === 'dueDate' && (
                      sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {actions.length === 0 
                      ? "Aucune action définie. Cliquez sur 'Nouvelle action' pour commencer."
                      : "Aucune action ne correspond aux filtres."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredActions.map(action => (
                  <TableRow key={action.id} className={action.status === 'completed' ? 'opacity-60' : ''}>
                    <TableCell>
                      <Checkbox 
                        checked={action.status === 'completed'}
                        onCheckedChange={(checked) => 
                          handleStatusChange(action.id, checked ? 'completed' : 'pending')
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className={action.status === 'completed' ? 'line-through' : ''}>
                        <p className="font-medium">{action.action}</p>
                        {action.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {action.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{action.responsible || '-'}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[action.priority]}>
                        {priorityLabels[action.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={action.status} 
                        onValueChange={(v) => handleStatusChange(action.id, v as ActionStatus)}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">À faire</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {action.dueDate 
                        ? new Date(action.dueDate).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(action)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(action.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialogue de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
              <Textarea
                value={formAction}
                onChange={(e) => setFormAction(e.target.value)}
                placeholder="Décrire l'action à réaliser..."
                rows={2}
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

export default ActionPlanTab
