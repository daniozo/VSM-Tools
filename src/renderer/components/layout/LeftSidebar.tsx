/**
 * LeftSidebar - Barre verticale à gauche avec icônes (style VS Code)
 * 
 * Permet d'ouvrir des panneaux dédiés :
 * - Arborescence du projet
 * - Notes
 * - Plan d'action
 * - Analyse
 */

import React from 'react';
import { Button } from '@/renderer/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/renderer/components/ui/tooltip';
import { FolderTree, StickyNote, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeftSidebarPanel = 'explorer' | 'notes' | 'action-plan' | 'analysis' | null;

interface LeftSidebarProps {
  activePanel: LeftSidebarPanel;
  onPanelChange: (panel: LeftSidebarPanel) => void;
  className?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  activePanel,
  onPanelChange,
  className 
}) => {
  const handlePanelClick = (panel: LeftSidebarPanel) => {
    // Toggle: si le panneau est déjà actif, on le ferme
    if (activePanel === panel) {
      onPanelChange(null);
    } else {
      onPanelChange(panel);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 w-12 bg-background border-r py-2',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Explorateur */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'explorer' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('explorer')}
            >
              <FolderTree className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Explorateur</p>
          </TooltipContent>
        </Tooltip>

        {/* Notes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'notes' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('notes')}
            >
              <StickyNote className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Notes</p>
          </TooltipContent>
        </Tooltip>

        {/* Plan d'action */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'action-plan' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('action-plan')}
            >
              <ClipboardList className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Plan d'action</p>
          </TooltipContent>
        </Tooltip>

        {/* Analyse */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'analysis' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('analysis')}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Analyse</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LeftSidebar;
