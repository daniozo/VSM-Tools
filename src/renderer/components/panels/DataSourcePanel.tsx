/**
 * DataSourcePanel Component
 * 
 * Panneau pour gérer les sources de données externes
 */

import React, { useState, useEffect } from 'react';
import { Plus, Database, RefreshCw, Trash2, Edit, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { dataSourcesApi } from '../../../services/api';
import { DataSource, DataSourceStatus, DataSourceType } from '../../../shared/types/dataSources';
import { toast } from 'sonner';

interface DataSourcePanelProps {
  diagramId: string;
  onEdit?: (dataSource: DataSource) => void;
  onCreate?: () => void;
}

export const DataSourcePanel: React.FC<DataSourcePanelProps> = ({
  diagramId,
  onEdit,
  onCreate
}) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  // Charger les sources de données
  useEffect(() => {
    loadDataSources();
  }, [diagramId]);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      const sources = await dataSourcesApi.getDataSources(diagramId);
      setDataSources(sources);
    } catch (error) {
      console.error('Failed to load data sources:', error);
      toast.error('Échec du chargement des sources de données');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      setSyncing(prev => ({ ...prev, [id]: true }));
      const result = await dataSourcesApi.syncDataSource(id);
      toast.success('Synchronisation réussie');
      await loadDataSources(); // Recharger pour mettre à jour last_sync
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Échec de la synchronisation');
    } finally {
      setSyncing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source de données ?')) {
      return;
    }

    try {
      await dataSourcesApi.deleteDataSource(id);
      toast.success('Source de données supprimée');
      await loadDataSources();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Échec de la suppression');
    }
  };

  const getStatusBadge = (status: DataSourceStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="secondary">
            Désactivé
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: DataSourceType) => {
    return <Database className="w-4 h-4" />;
  };

  const getTypeLabel = (type: DataSourceType) => {
    switch (type) {
      case 'REST_API':
        return 'API REST';
      case 'DATABASE':
        return 'Base de données';
      case 'FILE':
        return 'Fichier';
      default:
        return type;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Jamais synchronisé';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sources de Données</h3>
          <p className="text-sm text-gray-500">
            Connectez des sources externes pour alimenter vos indicateurs
          </p>
        </div>
        <Button onClick={onCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Source
        </Button>
      </div>

      {/* Liste des sources */}
      {dataSources.length === 0 ? (
        <Card className="p-8 text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium mb-2">Aucune source de données</h4>
          <p className="text-sm text-gray-500 mb-4">
            Ajoutez une source de données pour récupérer automatiquement vos indicateurs
          </p>
          <Button onClick={onCreate} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Créer une source
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dataSources.map(source => (
            <Card key={source.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Icône */}
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getTypeIcon(source.type)}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium truncate">{source.name}</h4>
                      {getStatusBadge(source.status)}
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(source.type)}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Mode: <span className="font-medium">{source.mode}</span></div>
                      <div>Dernière sync: <span className="font-medium">{formatLastSync(source.last_sync)}</span></div>
                      {source.error_message && (
                        <div className="text-red-500 text-xs mt-1">
                          {source.error_message}
                        </div>
                      )}
                      {source.field_mappings.length > 0 && (
                        <div className="text-xs mt-2">
                          {source.field_mappings.length} mapping(s) configuré(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSync(source.id)}
                    disabled={syncing[source.id]}
                  >
                    <RefreshCw 
                      className={`w-4 h-4 ${syncing[source.id] ? 'animate-spin' : ''}`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit?.(source)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Note informative */}
      <div className="p-4 bg-blue-50 rounded-lg text-sm">
        <div className="font-medium mb-1">💡 Mode de synchronisation</div>
        <ul className="text-gray-600 space-y-1 ml-4 list-disc">
          <li><strong>Static:</strong> Valeurs saisies manuellement</li>
          <li><strong>Dynamic:</strong> Récupération automatique depuis la source</li>
          <li><strong>Manual:</strong> Saisie par les opérateurs</li>
        </ul>
      </div>
    </div>
  );
};
