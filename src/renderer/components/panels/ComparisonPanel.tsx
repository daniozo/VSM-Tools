import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  Package,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { VSMDiagram, NodeType, Indicator, ImprovementPoint } from '@/shared/types/vsm-model';
import { useProjectsStore } from '@/store/projectsStore';

interface ComparisonPanelProps {
  currentDiagramId?: string;
  futureDiagramId?: string;
  currentDiagram?: VSMDiagram;
  futureDiagram?: VSMDiagram;
}

interface MetricComparison {
  name: string;
  icon: React.ReactNode;
  current: number | string;
  future: number | string;
  unit: string;
  improvement: 'better' | 'worse' | 'neutral';
  percentChange?: number;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  currentDiagramId,
  futureDiagramId,
  currentDiagram: currentDiagramProp,
  futureDiagram: futureDiagramProp
}) => {
  const [currentDiagram, setCurrentDiagram] = useState<VSMDiagram | null>(currentDiagramProp || null);
  const [futureDiagram, setFutureDiagram] = useState<VSMDiagram | null>(futureDiagramProp || null);
  const [loading, setLoading] = useState(!currentDiagramProp || !futureDiagramProp);
  const { loadDiagram } = useProjectsStore();
  const currentProject = useProjectsStore(state => state.currentProject);

  useEffect(() => {
    // Si les diagrammes sont déjà fournis, on les utilise directement
    if (currentDiagramProp && futureDiagramProp) {
      setCurrentDiagram(currentDiagramProp);
      setFutureDiagram(futureDiagramProp);
      setLoading(false);
      return;
    }

    // Sinon, on charge depuis l'API avec les IDs
    const loadDiagrams = async () => {
      if (!currentDiagramId || !futureDiagramId) return;

      try {
        setLoading(true);
        const [current, future] = await Promise.all([
          loadDiagram(currentDiagramId),
          loadDiagram(futureDiagramId)
        ]);
        if (current?.data) setCurrentDiagram(current.data as VSMDiagram);
        if (future?.data) setFutureDiagram(future.data as VSMDiagram);
      } catch (error) {
        console.error('Error loading diagrams for comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiagrams();
  }, [currentDiagramId, futureDiagramId, currentDiagramProp, futureDiagramProp, loadDiagram]);

  /**
   * Helper pour extraire une valeur d'indicateur
   */
  const getIndicatorValue = (indicators: Indicator[], name: string): number => {
    const indicator = indicators?.find((i: Indicator) =>
      i.name?.toLowerCase().includes(name.toLowerCase())
    );
    return indicator?.value ? parseFloat(indicator.value) || 0 : 0;
  };

  const calculateMetrics = (diagram: VSMDiagram | null) => {
    if (!diagram) return {
      totalCT: 0,
      totalWT: 0,
      totalLT: 0,
      stockCount: 0,
      totalStock: 0,
      processCount: 0,
      operatorCount: 0,
      problemCount: 0
    };

    let totalCT = 0;
    let totalWT = 0;
    let stockCount = 0;
    let totalStock = 0;
    let processCount = 0;
    let operatorCount = 0;
    let problemCount = 0;

    // Analyser les nœuds de type PROCESS_STEP
    const processSteps = diagram.nodes?.filter(n => n.type === NodeType.PROCESS_STEP) || [];

    processSteps.forEach(node => {
      processCount++;
      operatorCount += node.operators || 0;

      // Extraire les temps depuis les indicateurs
      const cycleTime = getIndicatorValue(node.indicators || [], 'cycle');
      const waitTime = getIndicatorValue(node.indicators || [], 'attente') ||
        getIndicatorValue(node.indicators || [], 'wait');

      totalCT += cycleTime;
      totalWT += waitTime;
    });

    // Analyser les stocks dans les flowSequences
    diagram.flowSequences?.forEach(seq => {
      seq.intermediateElements?.forEach(elem => {
        if (elem.type === 'INVENTORY' && elem.inventory) {
          stockCount++;
          totalStock += elem.inventory.quantity || 0;
          // Le temps d'attente inclut la durée des stocks
          totalWT += (elem.inventory.duration || 0) * 24 * 60; // jours -> minutes
        }
      });
    });

    // Comptabiliser les points d'amélioration comme "problèmes"
    problemCount = diagram.improvementPoints?.length || 0;

    const totalLT = totalCT + totalWT;

    return {
      totalCT,
      totalWT,
      totalLT,
      stockCount,
      totalStock,
      processCount,
      operatorCount,
      problemCount
    };
  };

  const currentMetrics = calculateMetrics(currentDiagram);
  const futureMetrics = calculateMetrics(futureDiagram);

  const getImprovement = (current: number, future: number, lowerIsBetter: boolean): 'better' | 'worse' | 'neutral' => {
    if (current === future) return 'neutral';
    if (lowerIsBetter) {
      return future < current ? 'better' : 'worse';
    }
    return future > current ? 'better' : 'worse';
  };

  const getPercentChange = (current: number, future: number): number => {
    if (current === 0) return future === 0 ? 0 : 100;
    return Math.round(((future - current) / current) * 100);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const comparisons: MetricComparison[] = [
    {
      name: 'Lead Time Total',
      icon: <Clock className="w-4 h-4" />,
      current: formatTime(currentMetrics.totalLT),
      future: formatTime(futureMetrics.totalLT),
      unit: '',
      improvement: getImprovement(currentMetrics.totalLT, futureMetrics.totalLT, true),
      percentChange: getPercentChange(currentMetrics.totalLT, futureMetrics.totalLT)
    },
    {
      name: 'Temps de Cycle',
      icon: <Clock className="w-4 h-4" />,
      current: formatTime(currentMetrics.totalCT),
      future: formatTime(futureMetrics.totalCT),
      unit: '',
      improvement: getImprovement(currentMetrics.totalCT, futureMetrics.totalCT, true),
      percentChange: getPercentChange(currentMetrics.totalCT, futureMetrics.totalCT)
    },
    {
      name: 'Temps d\'Attente',
      icon: <Clock className="w-4 h-4" />,
      current: formatTime(currentMetrics.totalWT),
      future: formatTime(futureMetrics.totalWT),
      unit: '',
      improvement: getImprovement(currentMetrics.totalWT, futureMetrics.totalWT, true),
      percentChange: getPercentChange(currentMetrics.totalWT, futureMetrics.totalWT)
    },
    {
      name: 'Stock Total',
      icon: <Package className="w-4 h-4" />,
      current: currentMetrics.totalStock,
      future: futureMetrics.totalStock,
      unit: 'unités',
      improvement: getImprovement(currentMetrics.totalStock, futureMetrics.totalStock, true),
      percentChange: getPercentChange(currentMetrics.totalStock, futureMetrics.totalStock)
    },
    {
      name: 'Nombre de Stocks',
      icon: <Truck className="w-4 h-4" />,
      current: currentMetrics.stockCount,
      future: futureMetrics.stockCount,
      unit: '',
      improvement: getImprovement(currentMetrics.stockCount, futureMetrics.stockCount, true),
      percentChange: getPercentChange(currentMetrics.stockCount, futureMetrics.stockCount)
    },
    {
      name: 'Opérateurs',
      icon: <Users className="w-4 h-4" />,
      current: currentMetrics.operatorCount,
      future: futureMetrics.operatorCount,
      unit: '',
      improvement: getImprovement(currentMetrics.operatorCount, futureMetrics.operatorCount, true),
      percentChange: getPercentChange(currentMetrics.operatorCount, futureMetrics.operatorCount)
    },
    {
      name: 'Problèmes Identifiés',
      icon: <AlertTriangle className="w-4 h-4" />,
      current: currentMetrics.problemCount,
      future: futureMetrics.problemCount,
      unit: '',
      improvement: getImprovement(currentMetrics.problemCount, futureMetrics.problemCount, true),
      percentChange: getPercentChange(currentMetrics.problemCount, futureMetrics.problemCount)
    }
  ];

  const ImprovementBadge: React.FC<{ improvement: 'better' | 'worse' | 'neutral'; percent?: number }> = ({
    improvement,
    percent
  }) => {
    if (improvement === 'neutral') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Minus className="w-3 h-3" />
          Identique
        </Badge>
      );
    }
    if (improvement === 'better') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          {percent !== undefined ? `${Math.abs(percent)}%` : 'Amélioration'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {percent !== undefined ? `+${Math.abs(percent)}%` : 'Dégradation'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement de la comparaison...</div>
      </div>
    );
  }

  const improvements = comparisons.filter(c => c.improvement === 'better').length;
  const degradations = comparisons.filter(c => c.improvement === 'worse').length;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comparaison État Actuel vs État Futur</h2>
          <p className="text-muted-foreground">
            Projet: {currentProject?.name || 'Non sélectionné'}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {improvements} améliorations
          </Badge>
          {degradations > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {degradations} dégradations
            </Badge>
          )}
        </div>
      </div>

      {/* Résumé rapide */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">État Actuel</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(currentMetrics.totalLT)}
              </div>
              <div className="text-xs text-muted-foreground">Lead Time</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">État Futur</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatTime(futureMetrics.totalLT)}
              </div>
              <div className="text-xs text-muted-foreground">Lead Time</div>
            </div>
          </div>
          {currentMetrics.totalLT > 0 && futureMetrics.totalLT < currentMetrics.totalLT && (
            <div className="text-center mt-4 text-green-600 dark:text-green-400 font-medium">
              Réduction de {Math.round(((currentMetrics.totalLT - futureMetrics.totalLT) / currentMetrics.totalLT) * 100)}% du Lead Time
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau comparatif */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Métriques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background">
                    {metric.icon}
                  </div>
                  <span className="font-medium">{metric.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right min-w-[80px]">
                    <div className="font-mono text-sm">{metric.current}</div>
                    <div className="text-xs text-muted-foreground">Actuel</div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground" />

                  <div className="text-right min-w-[80px]">
                    <div className="font-mono text-sm">{metric.future}</div>
                    <div className="text-xs text-muted-foreground">Futur</div>
                  </div>

                  <div className="min-w-[100px]">
                    <ImprovementBadge
                      improvement={metric.improvement}
                      percent={metric.percentChange}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions recommandées */}
      {futureDiagram?.improvementPoints && futureDiagram.improvementPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions d'Amélioration Planifiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {futureDiagram.improvementPoints.map((improvement: ImprovementPoint, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{improvement.description}</div>
                    {improvement.owner && (
                      <div className="text-sm text-muted-foreground">Responsable: {improvement.owner}</div>
                    )}
                    {improvement.dueDate && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Échéance: {new Date(improvement.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonPanel;
