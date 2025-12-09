/**
 * IssueBadge - Badge visuel pour afficher les problèmes sur le canvas
 * 
 * Affiche un badge coloré avec un nombre de problèmes
 * Utilisé pour visualiser les goulots, gaspillages, etc. directement sur les nœuds
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

export type IssueType = 'bottleneck' | 'waste' | 'opportunity';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

interface IssueBadgeProps {
  type: IssueType;
  severity: IssueSeverity;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const IssueBadge: React.FC<IssueBadgeProps> = ({
  type,
  severity,
  count = 1,
  size = 'md',
  onClick
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-10 h-10 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getColorClasses = () => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-600 text-white';
      case 'high': return 'bg-orange-500 border-orange-600 text-white';
      case 'medium': return 'bg-yellow-500 border-yellow-600 text-white';
      case 'low': return 'bg-blue-500 border-blue-600 text-white';
      default: return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    
    switch (type) {
      case 'bottleneck':
        return <AlertTriangle size={iconSize} />;
      case 'waste':
        return <AlertCircle size={iconSize} />;
      case 'opportunity':
        return <Lightbulb size={iconSize} />;
    }
  };

  return (
    <div
      className={`
        ${getSizeClasses()}
        ${getColorClasses()}
        rounded-full border-2 flex items-center justify-center
        font-bold shadow-lg
        ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
      `}
      onClick={onClick}
      title={`${type}: ${severity} (${count})`}
    >
      {count > 1 ? count : getIcon()}
    </div>
  );
};

/**
 * Fonction helper pour grouper les issues par nœud
 */
export interface NodeIssues {
  nodeId: string;
  bottlenecks: number;
  wastes: number;
  opportunities: number;
  maxSeverity: IssueSeverity;
}

export function groupIssuesByNode(analysis: any): Map<string, NodeIssues> {
  const issuesMap = new Map<string, NodeIssues>();

  if (!analysis) return issuesMap;

  // Traiter les goulots
  analysis.bottlenecks?.forEach((bottleneck: any) => {
    const nodeId = bottleneck.nodeId;
    const existing = issuesMap.get(nodeId) || {
      nodeId,
      bottlenecks: 0,
      wastes: 0,
      opportunities: 0,
      maxSeverity: 'low' as IssueSeverity
    };

    existing.bottlenecks++;
    existing.maxSeverity = getMaxSeverity(existing.maxSeverity, bottleneck.severity);
    issuesMap.set(nodeId, existing);
  });

  // Traiter les gaspillages
  analysis.wastes?.forEach((waste: any) => {
    const nodeId = waste.location; // location peut être un nodeId
    const existing = issuesMap.get(nodeId) || {
      nodeId,
      bottlenecks: 0,
      wastes: 0,
      opportunities: 0,
      maxSeverity: 'low' as IssueSeverity
    };

    existing.wastes++;
    existing.maxSeverity = getMaxSeverity(existing.maxSeverity, waste.severity);
    issuesMap.set(nodeId, existing);
  });

  return issuesMap;
}

function getMaxSeverity(current: IssueSeverity, newSeverity: IssueSeverity): IssueSeverity {
  const severityOrder = ['low', 'medium', 'high', 'critical'];
  const currentIndex = severityOrder.indexOf(current);
  const newIndex = severityOrder.indexOf(newSeverity);
  return severityOrder[Math.max(currentIndex, newIndex)] as IssueSeverity;
}

/**
 * Fonction pour obtenir une couleur de bordure selon la sévérité
 */
export function getBorderColorClass(severity: IssueSeverity): string {
  switch (severity) {
    case 'critical': return 'border-red-500';
    case 'high': return 'border-orange-500';
    case 'medium': return 'border-yellow-500';
    case 'low': return 'border-blue-500';
    default: return 'border-gray-500';
  }
}
