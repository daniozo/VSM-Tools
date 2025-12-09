/**
 * ConnectionStatus - Indicateur de connexion au backend
 */

import React from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectsStore, ConnectionStatus as Status } from '@/store/projectsStore';
import { Button } from '@/renderer/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/renderer/components/ui/tooltip';

const statusConfig: Record<Status, { icon: React.ReactNode; label: string; className: string }> = {
  disconnected: {
    icon: <WifiOff className="h-4 w-4" />,
    label: 'Déconnecté',
    className: 'text-muted-foreground',
  },
  connecting: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    label: 'Connexion...',
    className: 'text-yellow-500',
  },
  connected: {
    icon: <Wifi className="h-4 w-4" />,
    label: 'Connecté',
    className: 'text-green-500',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Erreur',
    className: 'text-red-500',
  },
};

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function ConnectionStatusIndicator({ className, showLabel = false }: ConnectionStatusProps) {
  const { connectionStatus, connectionError, connect } = useProjectsStore();
  const config = statusConfig[connectionStatus];

  const handleClick = async () => {
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      try {
        await connect();
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 gap-2', config.className, className)}
            onClick={handleClick}
            disabled={connectionStatus === 'connecting'}
          >
            {config.icon}
            {showLabel && <span className="text-xs">{config.label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {connectionError && <p className="text-xs text-red-400">{connectionError}</p>}
          {connectionStatus === 'disconnected' && (
            <p className="text-xs text-muted-foreground">Cliquez pour connecter</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
