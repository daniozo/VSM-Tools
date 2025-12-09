/**
 * AnalysisPanel - Panneau d'affichage des résultats d'analyse
 * 
 * Affiche les problèmes détectés (goulots, gaspillages, opportunités)
 * avec possibilité de filtrage et navigation vers les éléments concernés
 */

import React, { useState } from 'react';
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
  Lightbulb,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';

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

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  onIssueClick
}) => {
  const [filterType, setFilterType] = useState<'all' | 'bottleneck' | 'waste' | 'opportunity'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  if (!analysis) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertCircle className="mx-auto mb-2" size={48} />
        <p>Aucune analyse disponible</p>
        <p className="text-sm mt-1">Configurez votre diagramme et lancez l'analyse</p>
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
              className={`h-2 rounded-full transition-all ${
                analysis.summary.score >= 80 ? 'bg-green-600' :
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
                        <span>Actuel: {bottleneck.metrics.current}</span>
                        {bottleneck.metrics.optimal && (
                          <span>Optimal: {bottleneck.metrics.optimal}</span>
                        )}
                      </div>
                      <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                        💡 {bottleneck.recommendation}
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
                        <div className="text-xs text-green-700 dark:text-green-400 mb-2">
                          💰 Économie potentielle: {waste.potentialSavings.timeReduction} min
                        </div>
                      )}
                      <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
                        💡 {waste.suggestion}
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
    </div>
  );
};
