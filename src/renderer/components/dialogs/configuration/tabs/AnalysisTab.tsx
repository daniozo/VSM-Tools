/**
 * Onglet 9 : Analyse & Détection
 * 
 * Permet à l'utilisateur de configurer les règles de détection automatique :
 * - Goulots d'étranglement
 * - Gaspillages (7 types du Lean)
 * - Opportunités d'amélioration
 */

import React, { useState } from 'react'
import {
  VSMDiagram,
  AnalysisRule,
  AnalysisType,
  WasteType,
  AnalysisConfig,
  generateId
} from '@/shared/types/vsm-model'
import { STANDARD_ANALYSIS_RULES } from '@/shared/data/standardAnalysisRules'
import { STANDARD_INDICATORS } from '@/shared/data/standardIndicators'
import { Card, CardContent, CardHeader, CardTitle } from '@/renderer/components/ui/card'
import { Button } from '@/renderer/components/ui/button'
import { Switch } from '@/renderer/components/ui/switch'
import { Badge } from '@/renderer/components/ui/badge'
import { Label } from '@/renderer/components/ui/label'
import { Input } from '@/renderer/components/ui/input'
import { Textarea } from '@/renderer/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/renderer/components/ui/accordion'
import { AlertTriangle, AlertCircle, Lightbulb, Pencil, Trash2 } from 'lucide-react'

interface AnalysisTabProps {
  diagram: VSMDiagram
  onUpdate: (updates: Partial<VSMDiagram>) => void
}

// Initialiser la config d'analyse si elle n'existe pas
function getAnalysisConfig(diagram: VSMDiagram): AnalysisConfig {
  if ((diagram as any).analysisConfig) {
    return (diagram as any).analysisConfig
  }
  // Créer une config par défaut avec les règles standards
  return {
    rules: STANDARD_ANALYSIS_RULES.map(rule => ({
      ...rule,
      id: generateId('rule')
    })),
    autoAnalyzeOnLoad: true,
    showAlertsOnDiagram: true
  }
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  diagram,
  onUpdate
}) => {
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>(
    getAnalysisConfig(diagram)
  )
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AnalysisRule | null>(null)

  // Grouper les règles par type
  const bottleneckRules = analysisConfig.rules.filter(r => r.type === AnalysisType.BOTTLENECK)
  const wasteRules = analysisConfig.rules.filter(r => r.type === AnalysisType.WASTE)
  const opportunityRules = analysisConfig.rules.filter(r => r.type === AnalysisType.OPPORTUNITY)

  const updateConfig = (updates: Partial<AnalysisConfig>) => {
    const newConfig = { ...analysisConfig, ...updates }
    setAnalysisConfig(newConfig)
    onUpdate({ ...diagram, analysisConfig: newConfig } as any)
  }

  const toggleRule = (ruleId: string) => {
    const updatedRules = analysisConfig.rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    )
    updateConfig({ rules: updatedRules })
  }

  const handleAddRule = () => {
    setEditingRule(null)
    setIsRuleDialogOpen(true)
  }

  const handleEditRule = (rule: AnalysisRule) => {
    setEditingRule(rule)
    setIsRuleDialogOpen(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    const rule = analysisConfig.rules.find(r => r.id === ruleId)
    if (rule?.isSystemRule) {
      alert('Les règles système ne peuvent pas être supprimées')
      return
    }
    const confirmed = window.confirm('Supprimer cette règle ?')
    if (confirmed) {
      updateConfig({
        rules: analysisConfig.rules.filter(r => r.id !== ruleId)
      })
    }
  }

  const handleSaveRule = (rule: AnalysisRule) => {
    if (editingRule) {
      updateConfig({
        rules: analysisConfig.rules.map(r => r.id === editingRule.id ? rule : r)
      })
    } else {
      updateConfig({
        rules: [...analysisConfig.rules, rule]
      })
    }
    setIsRuleDialogOpen(false)
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Haute'
      case 2: return 'Moyenne'
      case 3: return 'Basse'
      default: return 'Moyenne'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Analyse & Détection
        </h3>
        <p className="text-sm text-muted-foreground">
          Configurez les règles pour détecter automatiquement les goulots d'étranglement,
          les gaspillages et les opportunités d'amélioration
        </p>
      </div>

      {/* Règles de détection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Règles de Détection</CardTitle>
            <Button size="sm" onClick={handleAddRule}>
              + Ajouter une Règle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['bottleneck', 'waste', 'opportunity']}>
            {/* Goulots d'étranglement */}
            <AccordionItem value="bottleneck">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">Goulots d'Étranglement</span>
                  <Badge variant="outline" className="ml-2">
                    {bottleneckRules.filter(r => r.enabled).length}/{bottleneckRules.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {bottleneckRules.map(rule => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={() => toggleRule(rule.id)}
                      onEdit={() => handleEditRule(rule)}
                      onDelete={() => handleDeleteRule(rule.id)}
                      getPriorityLabel={getPriorityLabel}
                    />
                  ))}
                  {bottleneckRules.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune règle de détection de goulot
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Gaspillages */}
            <AccordionItem value="waste">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">Gaspillages (Muda)</span>
                  <Badge variant="outline" className="ml-2">
                    {wasteRules.filter(r => r.enabled).length}/{wasteRules.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {wasteRules.map(rule => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={() => toggleRule(rule.id)}
                      onEdit={() => handleEditRule(rule)}
                      onDelete={() => handleDeleteRule(rule.id)}
                      getPriorityLabel={getPriorityLabel}
                    />
                  ))}
                  {wasteRules.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune règle de détection de gaspillage
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Opportunités */}
            <AccordionItem value="opportunity">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Opportunités d'Amélioration</span>
                  <Badge variant="outline" className="ml-2">
                    {opportunityRules.filter(r => r.enabled).length}/{opportunityRules.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {opportunityRules.map(rule => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={() => toggleRule(rule.id)}
                      onEdit={() => handleEditRule(rule)}
                      onDelete={() => handleDeleteRule(rule.id)}
                      getPriorityLabel={getPriorityLabel}
                    />
                  ))}
                  {opportunityRules.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune règle de détection d'opportunité
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Dialog d'édition de règle */}
      <RuleDialog
        open={isRuleDialogOpen}
        onOpenChange={setIsRuleDialogOpen}
        initialRule={editingRule}
        onSave={handleSaveRule}
      />
    </div>
  )
}

// ============================================================================
// COMPOSANT CARTE DE RÈGLE
// ============================================================================

interface RuleCardProps {
  rule: AnalysisRule
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  getPriorityLabel: (priority: number) => string
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onToggle,
  onEdit,
  onDelete,
  getPriorityLabel
}) => {
  const getWasteTypeLabel = (wasteType?: WasteType) => {
    switch (wasteType) {
      case WasteType.OVERPRODUCTION: return 'Surproduction'
      case WasteType.WAITING: return 'Attente'
      case WasteType.TRANSPORT: return 'Transport'
      case WasteType.OVERPROCESSING: return 'Sur-traitement'
      case WasteType.INVENTORY: return 'Stocks'
      case WasteType.MOTION: return 'Mouvements'
      case WasteType.DEFECTS: return 'Défauts'
      case WasteType.SKILLS: return 'Compétences'
      default: return ''
    }
  }

  return (
    <Card className={`transition-opacity ${!rule.enabled ? 'opacity-60' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Switch
            checked={rule.enabled}
            onCheckedChange={onToggle}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{rule.name}</span>
              {rule.wasteType && (
                <Badge variant="outline" className="text-xs">
                  {getWasteTypeLabel(rule.wasteType)}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-xs ${rule.priority === 1 ? 'bg-red-50' : rule.priority === 3 ? 'bg-gray-50' : ''}`}
              >
                {getPriorityLabel(rule.priority)}
              </Badge>
              {rule.isSystemRule && (
                <Badge variant="secondary" className="text-xs">
                  Système
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{rule.description}</p>
            {rule.condition.indicatorName && (
              <p className="text-xs mt-1">
                <span className="text-muted-foreground">Condition : </span>
                {rule.condition.indicatorName} {rule.condition.operator}{' '}
                {rule.condition.compareToTaktTime
                  ? `${rule.condition.taktTimePercentage}% du Takt Time`
                  : `${rule.condition.value} ${rule.condition.indicatorName.includes('%') ? '' : ''}`}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            {!rule.isSystemRule && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// DIALOGUE D'ÉDITION DE RÈGLE
// ============================================================================

interface RuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRule: AnalysisRule | null
  onSave: (rule: AnalysisRule) => void
}

const RuleDialog: React.FC<RuleDialogProps> = ({
  open,
  onOpenChange,
  initialRule,
  onSave
}) => {
  const isEditMode = !!initialRule

  // États du formulaire
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<AnalysisType>(AnalysisType.BOTTLENECK)
  const [wasteType, setWasteType] = useState<WasteType | ''>('')
  const [indicatorName, setIndicatorName] = useState('')
  const [operator, setOperator] = useState<string>('>')
  const [value, setValue] = useState<number>(0)
  const [compareToTaktTime, setCompareToTaktTime] = useState(false)
  const [taktTimePercentage, setTaktTimePercentage] = useState(100)
  const [priority, setPriority] = useState<number>(2)
  const [suggestedAction, setSuggestedAction] = useState('')

  // Charger les données initiales
  React.useEffect(() => {
    if (initialRule && open) {
      setName(initialRule.name)
      setDescription(initialRule.description)
      setType(initialRule.type)
      setWasteType(initialRule.wasteType || '')
      setIndicatorName(initialRule.condition.indicatorName || '')
      setOperator(initialRule.condition.operator)
      setValue(initialRule.condition.value)
      setCompareToTaktTime(initialRule.condition.compareToTaktTime || false)
      setTaktTimePercentage(initialRule.condition.taktTimePercentage || 100)
      setPriority(initialRule.priority)
      setSuggestedAction(initialRule.suggestedAction || '')
    } else if (!initialRule && open) {
      // Réinitialiser
      setName('')
      setDescription('')
      setType(AnalysisType.BOTTLENECK)
      setWasteType('')
      setIndicatorName('')
      setOperator('>')
      setValue(0)
      setCompareToTaktTime(false)
      setTaktTimePercentage(100)
      setPriority(2)
      setSuggestedAction('')
    }
  }, [initialRule, open])

  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez saisir un nom pour la règle')
      return
    }

    if (!indicatorName) {
      alert('Veuillez sélectionner un indicateur')
      return
    }

    const rule: AnalysisRule = {
      id: initialRule?.id || generateId('rule'),
      name: name.trim(),
      description: description.trim(),
      type,
      wasteType: type === AnalysisType.WASTE ? (wasteType as WasteType) : undefined,
      condition: {
        indicatorName,
        operator: operator as any,
        value,
        compareToTaktTime,
        taktTimePercentage: compareToTaktTime ? taktTimePercentage : undefined
      },
      enabled: initialRule?.enabled ?? true,
      priority,
      suggestedAction: suggestedAction.trim() || undefined,
      isSystemRule: initialRule?.isSystemRule || false
    }

    onSave(rule)
  }

  // Liste des indicateurs pour le Select
  const indicatorOptions = STANDARD_INDICATORS.map(ind => ind.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Modifier la Règle' : 'Créer une Règle Personnalisée'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom et Description */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Nom de la règle *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Goulot Temps de Cycle"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez ce que cette règle détecte..."
                rows={2}
              />
            </div>
          </div>

          {/* Type et Sous-type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de détection *</Label>
              <Select value={type} onValueChange={(v) => setType(v as AnalysisType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AnalysisType.BOTTLENECK}>Goulot d'étranglement</SelectItem>
                  <SelectItem value={AnalysisType.WASTE}>Gaspillage</SelectItem>
                  <SelectItem value={AnalysisType.OPPORTUNITY}>Opportunité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === AnalysisType.WASTE && (
              <div className="space-y-2">
                <Label>Type de gaspillage</Label>
                <Select value={wasteType} onValueChange={(v) => setWasteType(v as WasteType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WasteType.OVERPRODUCTION}>Surproduction</SelectItem>
                    <SelectItem value={WasteType.WAITING}>Attente</SelectItem>
                    <SelectItem value={WasteType.TRANSPORT}>Transport</SelectItem>
                    <SelectItem value={WasteType.OVERPROCESSING}>Sur-traitement</SelectItem>
                    <SelectItem value={WasteType.INVENTORY}>Stocks</SelectItem>
                    <SelectItem value={WasteType.MOTION}>Mouvements</SelectItem>
                    <SelectItem value={WasteType.DEFECTS}>Défauts</SelectItem>
                    <SelectItem value={WasteType.SKILLS}>Compétences</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type !== AnalysisType.WASTE && (
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Haute</SelectItem>
                    <SelectItem value="2">Moyenne</SelectItem>
                    <SelectItem value="3">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {type === AnalysisType.WASTE && (
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Haute</SelectItem>
                  <SelectItem value="2">Moyenne</SelectItem>
                  <SelectItem value="3">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Condition */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-semibold text-sm">Condition de Déclenchement</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Indicateur *</Label>
                <Select value={indicatorName} onValueChange={setIndicatorName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {indicatorOptions.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opérateur</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">&gt; (supérieur)</SelectItem>
                    <SelectItem value=">=">&gt;= (supérieur ou égal)</SelectItem>
                    <SelectItem value="<">&lt; (inférieur)</SelectItem>
                    <SelectItem value="<=">&lt;= (inférieur ou égal)</SelectItem>
                    <SelectItem value="==">== (égal)</SelectItem>
                    <SelectItem value="!=">!= (différent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valeur</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  disabled={compareToTaktTime}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={compareToTaktTime}
                  onCheckedChange={setCompareToTaktTime}
                />
                <Label>Comparer au Takt Time</Label>
              </div>

              {compareToTaktTime && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={taktTimePercentage}
                    onChange={(e) => setTaktTimePercentage(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">% du Takt Time</span>
                </div>
              )}
            </div>
          </div>

          {/* Action suggérée */}
          <div className="space-y-2">
            <Label>Action suggérée (optionnel)</Label>
            <Textarea
              value={suggestedAction}
              onChange={(e) => setSuggestedAction(e.target.value)}
              placeholder="Quelle action recommander si cette règle se déclenche ?"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isEditMode ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
