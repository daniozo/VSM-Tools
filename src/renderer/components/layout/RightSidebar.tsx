/**
 * RightSidebar - Barre verticale à droite avec icônes
 * 
 * Contient les icônes pour :
 * - Panneau des Propriétés
 * - Assistant Conversationnel
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RightSidebarPanel = 'properties' | 'assistant' | null;

interface RightSidebarProps {
  activePanel: RightSidebarPanel;
  onPanelChange: (panel: RightSidebarPanel) => void;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  activePanel,
  onPanelChange,
  className,
}) => {
  const handlePanelClick = (panel: RightSidebarPanel) => {
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
        'flex flex-col items-center gap-2 w-12 bg-background border-l py-2',
        className
      )}
    >
      <TooltipProvider delayDuration={300}>
        {/* Propriétés */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'properties' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('properties')}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Propriétés</p>
          </TooltipContent>
        </Tooltip>

        {/* Assistant */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activePanel === 'assistant' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10"
              onClick={() => handlePanelClick('assistant')}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
