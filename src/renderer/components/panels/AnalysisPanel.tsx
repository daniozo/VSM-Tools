/**
 * AnalysisPanel - Panneau d'affichage des résultats d'analyse
 * 
 * Affiche les problèmes détectés (goulots, gaspillages, opportunités)
 * avec possibilité de filtrage et navigation vers les éléments concernés.
 * Inclut un bouton pour créer l'état futur.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/renderer/components/ui/card';
import { Badge } from '@/renderer/components/ui/badge';
import { Button } from '@/renderer/components/ui/button';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/renderer/components/ui/select';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  TrendingUp,
  Filter,
  X,
  Plus,
  Pencil,
  GitCompare,
  ExternalLink
} from 'lucide-react';
import { useVsmStore } from '@/store/vsmStore';
import { VSMDiagram, NodeType } from '@/shared/types/vsm-model';
import { FutureStateDialog } from '../dialogs/FutureStateDialog';

interface AnalysisResult {
  timestamp: string;
  summary: {
    totalIssues: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    score: number;
  };
  bottlenecks: Bottleneck[];
  wastes: Waste[];
  opportunities: Opportunity[];
}

interface Bottleneck {
  nodeId: string;
  nodeName: string;
  type: 'cycle_time' | 'uptime' | 'capacity';
  severity: 'medium' | 'high' | 'critical';
  impact: string;
  recommendation: string;
  metrics: {
    current: number;
    optimal?: number;
    difference?: number;
  };
}

interface Waste {
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  potentialSavings?: {
    timeReduction: number;
    costReduction?: number;
  };
}

interface Opportunity {
  type: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
}

interface AnalysisPanelProps {
  analysis?: AnalysisResult;
  onIssueClick?: (nodeId: string) => void;
}

/**
 * Helper pour extraire une valeur d'indicateur
 */
function getIndicatorValue(indicators: any[], name: string): number {
  const indicator = indicators?.find((i: any) =>
    i.name?.toLowerCase().includes(name.toLowerCase())
  )
  return indicator?.value ? parseFloat(indicator.value) || 0 : 0
}

/**
 * Analyse le diagramme et détecte les problèmes
 */
function analyzeDiagram(diagram: VSMDiagram | null): AnalysisResult | null {
  if (!diagram) return null;

  const bottlenecks: Bottleneck[] = [];
  const wastes: Waste[] = [];
  const opportunities: Opportunity[] = [];

  // Récupérer le Takt Time
  const taktTime = diagram.actors?.customer?.taktTime || 0;

  // Analyser les nœuds (étapes de production)
  const processSteps = diagram.nodes.filter(n => n.type === NodeType.PROCESS_STEP);

  processSteps.forEach(node => {
    const cycleTime = getIndicatorValue(node.indicators, 'cycle');
    const uptime = getIndicatorValue(node.indicators, 'uptime') || getIndicatorValue(node.indicators, 'disponibilité');
    const scrapRate = getIndicatorValue(node.indicators, 'rebut') || getIndicatorValue(node.indicators, 'scrap');

    // Détection goulot: temps de cycle > Takt Time
    if (taktTime > 0 && cycleTime > taktTime) {
      const ratio = cycleTime / taktTime;
      bottlenecks.push({
        nodeId: node.id,
        nodeName: node.name,
        type: 'cycle_time',
        severity: ratio > 1.5 ? 'critical' : ratio > 1.2 ? 'high' : 'medium',
        impact: `Temps de cycle (${cycleTime}s) dépasse le Takt Time (${taktTime}s) de ${Math.round((ratio - 1) * 100)}%`,
        recommendation: 'Réduire le temps de cycle par l\'élimination des gaspillages ou ajouter de la capacité',
        metrics: {
          current: cycleTime,
          optimal: taktTime,
          difference: cycleTime - taktTime
        }
      });
    }

    // Détection proche du Takt Time (alerte préventive)
    if (taktTime > 0 && cycleTime >= taktTime * 0.9 && cycleTime <= taktTime) {
      bottlenecks.push({
        nodeId: node.id,
        nodeName: node.name,
        type: 'cycle_time',
        severity: 'medium',
        impact: `Temps de cycle (${cycleTime}s) proche du Takt Time (${taktTime}s) - risque de goulot`,
        recommendation: 'Surveiller cette étape - risque de devenir un goulot en cas de variabilité',
        metrics: {
          current: cycleTime,
          optimal: taktTime
        }
      });
    }

    // Détection faible disponibilité
    if (uptime > 0 && uptime < 85) {
      wastes.push({
        type: 'Pannes/Arrêts',
        location: node.name,
        severity: uptime < 70 ? 'high' : 'medium',
        description: `Disponibilité à ${uptime}%, en dessous de l'objectif de 85%`,
        suggestion: 'Mettre en place un programme de maintenance préventive (TPM)',
        potentialSavings: {
          timeReduction: Math.round((85 - uptime) * 60 / 100) // estimation
        }
      });
    }

    // Détection taux de rebut élevé
    if (scrapRate > 2) {
      wastes.push({
        type: 'Défauts',
        location: node.name,
        severity: scrapRate > 5 ? 'high' : 'medium',
        description: `Taux de rebut à ${scrapRate}%, au-dessus du seuil de 2%`,
        suggestion: 'Analyser les causes racines avec un diagramme Ishikawa et mettre en place le Poka-Yoke'
      });
    }
  });

  // Analyser les stocks
  diagram.flowSequences?.forEach(seq => {
    seq.intermediateElements?.forEach(elem => {
      if (elem.type === 'INVENTORY' && elem.inventory) {
        const inv = elem.inventory;
        const duration = inv.duration || 0;
        const quantity = inv.quantity || 0;

        // Stock excessif en durée
        if (duration > 3) {
          wastes.push({
            type: 'Stock Excessif',
            location: inv.name || 'Stock',
            severity: duration > 7 ? 'high' : 'medium',
            description: `Durée de stockage de ${duration} jours, au-dessus de l'objectif de 3 jours`,
            suggestion: 'Réduire les stocks en implémentant le flux tiré (Kanban) et en réduisant les tailles de lots',
            potentialSavings: {
              timeReduction: Math.round((duration - 3) * 24 * 60) // en minutes
            }
          });
        }

        // Grande quantité en stock
        if (quantity > 500) {
          wastes.push({
            type: 'Surstock',
            location: inv.name || 'Stock',
            severity: quantity > 1000 ? 'high' : 'medium',
            description: `${quantity} unités en stock, capital immobilisé important`,
            suggestion: 'Réduire la taille des lots et mettre en place un supermarché Kanban'
          });
        }
      }
    });
  });

  // Détecter les opportunités
  const allPush = diagram.flowSequences?.every(seq =>
    seq.intermediateElements?.every(elem =>
      elem.type !== 'MATERIAL_FLOW' || elem.materialFlow?.flowType === 'PUSH'
    )
  );

  if (allPush && processSteps.length > 2) {
    opportunities.push({
      type: 'Flux Tiré',
      priority: 'high',
      description: 'Tous les flux sont en mode PUSH. Considérer la mise en place d\'un système PULL.',
      expectedBenefit: 'Réduction des stocks, meilleure réactivité à la demande client',
      effort: 'medium'
    });
  }

  if (!diagram.actors?.controlCenter) {
    opportunities.push({
      type: 'Centre de Contrôle',
      priority: 'medium',
      description: 'Aucun centre de contrôle/planification défini.',
      expectedBenefit: 'Meilleure coordination des flux d\'information et de production',
      effort: 'low'
    });
  }

  // Calculer le score et la sévérité globale
  const totalIssues = bottlenecks.length + wastes.length;
  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length +
    wastes.filter(w => w.severity === 'high').length;
  const highCount = bottlenecks.filter(b => b.severity === 'high').length +
    wastes.filter(w => w.severity === 'medium').length;

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalCount > 0) severity = 'critical';
  else if (highCount > 2) severity = 'high';
  else if (totalIssues > 3) severity = 'medium';

  // Score basé sur les problèmes (100 = parfait)
  const score = Math.max(0, Math.min(100,
    100 - (criticalCount * 20) - (highCount * 10) - ((totalIssues - criticalCount - highCount) * 5)
  ));

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues,
      severity,
      score
    },
    bottlenecks,
    wastes,
    opportunities
  };
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis: externalAnalysis,
  onIssueClick
}) => {
  const { diagram } = useVsmStore();

  const [filterType, setFilterType] = useState<'all' | 'bottleneck' | 'waste' | 'opportunity'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [isFutureStateDialogOpen, setIsFutureStateDialogOpen] = useState(false);
  const [existingFutureDiagram, setExistingFutureDiagram] = useState<any>(null);

  // Analyser le diagramme actuel
  const liveAnalysis = useMemo(() => analyzeDiagram(diagram), [diagram]);

  // Utiliser l'analyse externe si fournie, sinon l'analyse live
  const analysis = externalAnalysis || liveAnalysis;

  // Vérifier si un état futur existe déjà
  useEffect(() => {
    const checkFutureDiagram = async () => {
      if (!diagram || diagram.diagramType === 'FUTURE') return;

      try {
        const { useProjectsStore } = await import('@/store/projectsStore');
        const { currentProject } = useProjectsStore.getState();

        if (currentProject) {
          const { diagramsApi } = await import('@/services/api');
          const diagrams = await diagramsApi.list(currentProject.id);

          // Chercher un diagramme futur lié à celui-ci
          const futureDiagram = diagrams.find((d: any) =>
            d.type === 'future' && d.data?.currentStateId === diagram.id
          );

          setExistingFutureDiagram(futureDiagram || null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'état futur:', error);
      }
    };

    checkFutureDiagram();
  }, [diagram]);

  const handleCreateFutureState = async (futureDiagram: VSMDiagram) => {
    try {
      // Sauvegarder dans la base de données si un projet est actif
      const { useProjectsStore } = await import('@/store/projectsStore');
      const { currentProject } = useProjectsStore.getState();

      let savedId = futureDiagram.id;

      if (currentProject) {
        const { diagramsApi } = await import('@/services/api');

        // Créer le diagramme dans la BD
        const savedDiagram = await diagramsApi.create({
          project_id: currentProject.id,
          name: futureDiagram.metaData.name,
          type: 'future',
          data: futureDiagram
        });

        console.log('État futur sauvegardé dans la BD:', savedDiagram.id);
        savedId = savedDiagram.id;
        futureDiagram.id = savedId;

        // Mettre à jour l'état existant
        setExistingFutureDiagram({
          id: savedId,
          name: futureDiagram.metaData.name,
          data: futureDiagram
        });
      }

      // Ouvrir un nouvel onglet pour l'état futur (utiliser addTab directement)
      const { useTabsStore } = await import('@/store/tabsStore');
      useTabsStore.getState().addTab({
        id: `future-${savedId}`,
        type: 'future-diagram',
        title: `État Futur: ${futureDiagram.metaData.name.replace(' - État Futur', '').slice(0, 20)}`,
        closable: true,
        data: {
          diagram: futureDiagram,
          diagramId: savedId,
          currentStateId: diagram?.id
        }
      });

      console.log('État futur créé et onglet ouvert:', futureDiagram.metaData.name);
    } catch (error) {
      console.error('Erreur lors de la création de l\'état futur:', error);
      alert('Erreur lors de la création de l\'état futur. Voir la console pour plus de détails.');
    }
  };

  const handleOpenFutureDiagram = async () => {
    if (!existingFutureDiagram) return;

    const { useTabsStore } = await import('@/store/tabsStore');
    const tabsStore = useTabsStore.getState();

    // Vérifier si l'onglet existe déjà
    const existingTab = tabsStore.tabs.find(t =>
      t.type === 'future-diagram' && t.data?.diagramId === existingFutureDiagram.id
    );

    if (existingTab) {
      tabsStore.setActiveTab(existingTab.id);
    } else {
      tabsStore.addTab({
        id: `future-${existingFutureDiagram.id}`,
        type: 'future-diagram',
        title: `État Futur: ${existingFutureDiagram.name.replace(' - État Futur', '').slice(0, 20)}`,
        closable: true,
        data: {
          diagram: existingFutureDiagram.data,
          diagramId: existingFutureDiagram.id,
          currentStateId: diagram?.id
        }
      });
    }
  };

  const handleOpenComparison = async () => {
    if (!existingFutureDiagram || !diagram) return;

    const { useTabsStore } = await import('@/store/tabsStore');
    const tabsStore = useTabsStore.getState();

    // Vérifier si l'onglet de comparaison existe déjà
    const existingTab = tabsStore.tabs.find(t => t.type === 'comparison');

    if (existingTab) {
      tabsStore.updateTab(existingTab.id, {
        data: {
          currentState: diagram,
          futureState: existingFutureDiagram.data
        }
      });
      tabsStore.setActiveTab(existingTab.id);
    } else {
      tabsStore.addTab({
        id: `comparison-${Date.now()}`,
        type: 'comparison',
        title: 'Comparaison États',
        closable: true,
        data: {
          currentState: diagram,
          futureState: existingFutureDiagram.data
        }
      });
    }
  };

  if (!diagram) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <Info className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Aucun diagramme ouvert</p>
        <p className="text-xs mt-1">Ouvrez ou créez un projet pour voir l'analyse</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertCircle className="mx-auto mb-2" size={48} />
        <p>Analyse en cours...</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filtrage
  const filteredBottlenecks = filterSeverity === 'all'
    ? analysis.bottlenecks
    : analysis.bottlenecks.filter(b => b.severity === filterSeverity);

  const filteredWastes = filterSeverity === 'all'
    ? analysis.wastes
    : analysis.wastes.filter(w => w.severity === filterSeverity);

  const filteredOpportunities = filterSeverity === 'all'
    ? analysis.opportunities
    : filterSeverity === 'high'
      ? analysis.opportunities.filter(o => o.priority === 'high')
      : filterSeverity === 'medium'
        ? analysis.opportunities.filter(o => o.priority === 'medium')
        : analysis.opportunities.filter(o => o.priority === 'low');

  const showBottlenecks = filterType === 'all' || filterType === 'bottleneck';
  const showWastes = filterType === 'all' || filterType === 'waste';
  const showOpportunities = filterType === 'all' || filterType === 'opportunity';

  return (
    <div className="h-full flex flex-col">
      {/* Header avec score global */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Analyse VSM</CardTitle>
            <Badge variant="outline" className={getSeverityColor(analysis.summary.severity)}>
              {analysis.summary.severity.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Score de performance</span>
            <span className={`text-3xl font-bold ${getScoreColor(analysis.summary.score)}`}>
              {analysis.summary.score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${analysis.summary.score >= 80 ? 'bg-green-600' :
                analysis.summary.score >= 60 ? 'bg-yellow-600' :
                  analysis.summary.score >= 40 ? 'bg-orange-600' : 'bg-red-600'
                }`}
              style={{ width: `${analysis.summary.score}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Problèmes détectés: </span>
              <span className="font-semibold">{analysis.summary.totalIssues}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(analysis.timestamp).toLocaleString('fr-FR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons État Futur */}
      <div className="mb-4 space-y-2">
        {existingFutureDiagram ? (
          <>
            {/* État futur existe - Afficher les 3 boutons */}
            <Button
              className="w-full"
              variant="default"
              onClick={handleOpenFutureDiagram}
            >
              <ExternalLink size={16} className="mr-2" />
              Ouvrir l'État Futur
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleOpenComparison}
            >
              <GitCompare size={16} className="mr-2" />
              Comparer les États
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsFutureStateDialogOpen(true)}
            >
              <Pencil size={16} className="mr-2" />
              Modifier l'État Futur
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setIsFutureStateDialogOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Créer l'État Futur
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="flex-1">
            <Filter size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="bottleneck">Goulots</SelectItem>
            <SelectItem value="waste">Gaspillages</SelectItem>
            <SelectItem value="opportunity">Opportunités</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={(v: any) => setFilterSeverity(v)}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sévérités</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>

        {(filterType !== 'all' || filterSeverity !== 'all') && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setFilterType('all');
              setFilterSeverity('all');
            }}
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Liste des problèmes */}
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Goulots d'étranglement */}
          {showBottlenecks && filteredBottlenecks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-600" />
                Goulots d'étranglement ({filteredBottlenecks.length})
              </h3>
              <div className="space-y-2">
                {filteredBottlenecks.map((bottleneck, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onIssueClick?.(bottleneck.nodeId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{bottleneck.nodeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {bottleneck.type.replace('_', ' ')}
                          </div>
                        </div>
                        <Badge className={getSeverityColor(bottleneck.severity)}>
                          {bottleneck.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{bottleneck.impact}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>Actuel: {bottleneck.metrics.current}s</span>
                        {bottleneck.metrics.optimal && (
                          <span>Optimal: {bottleneck.metrics.optimal}s</span>
                        )}
                      </div>
                      <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded flex items-start gap-2">
                        <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <span>{bottleneck.recommendation}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Gaspillages */}
          {showWastes && filteredWastes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                Gaspillages ({filteredWastes.length})
              </h3>
              <div className="space-y-2">
                {filteredWastes.map((waste, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onIssueClick?.(waste.location)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{waste.type}</div>
                          <div className="text-sm text-muted-foreground">{waste.location}</div>
                        </div>
                        <Badge className={getSeverityColor(waste.severity)}>
                          {waste.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{waste.description}</p>
                      {waste.potentialSavings && (
                        <div className="text-xs text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                          <TrendingUp size={14} className="shrink-0" />
                          Économie potentielle: {waste.potentialSavings.timeReduction} min
                        </div>
                      )}
                      <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded flex items-start gap-2">
                        <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <span>{waste.suggestion}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Opportunités */}
          {showOpportunities && filteredOpportunities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb size={18} className="text-blue-600" />
                Opportunités d'amélioration ({filteredOpportunities.length})
              </h3>
              <div className="space-y-2">
                {filteredOpportunities.map((opportunity, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium capitalize">
                            {opportunity.type.replace('_', ' ')}
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          opportunity.priority === 'high' ? 'border-red-500 text-red-700' :
                            opportunity.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-blue-500 text-blue-700'
                        }>
                          Priorité: {opportunity.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{opportunity.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-green-700 dark:text-green-400">
                          <TrendingUp size={14} className="inline mr-1" />
                          {opportunity.expectedBenefit}
                        </div>
                        <div className="text-muted-foreground">
                          Effort: {opportunity.effort}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucun résultat après filtrage */}
          {((showBottlenecks && filteredBottlenecks.length === 0) &&
            (showWastes && filteredWastes.length === 0) &&
            (showOpportunities && filteredOpportunities.length === 0)) && (
              <div className="text-center text-muted-foreground py-8">
                <Filter size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucun problème trouvé avec ces filtres</p>
              </div>
            )}

          {/* Message si tout est parfait */}
          {analysis.summary.totalIssues === 0 && (
            <div className="text-center text-green-600 py-8">
              <TrendingUp size={48} className="mx-auto mb-2" />
              <p className="font-semibold">Excellent travail !</p>
              <p className="text-sm">Aucun problème détecté dans votre diagramme VSM</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Dialogue État Futur */}
      {diagram && (
        <FutureStateDialog
          open={isFutureStateDialogOpen}
          onOpenChange={setIsFutureStateDialogOpen}
          currentStateDiagram={diagram}
          onCreateFutureState={handleCreateFutureState}
        />
      )}
    </div>
  );
};
