/**
 * DataSourceDialog Component
 * 
 * Dialogue pour créer/éditer une source de données externe
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataSourcesApi } from '@/services/api';
import {
  DataSource,
  CreateDataSourceRequest,
  RestApiConfig,
  AuthType,
  DataSourceType,
  DataSourceMode,
  FieldMapping
} from '@/shared/types/dataSources';
import { toast } from 'sonner';
import { Loader2, TestTube, Plus, Trash2 } from 'lucide-react';

interface DataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagramId: string;
  dataSource?: DataSource; // Si défini, on est en mode édition
  onSaved?: () => void;
}

export const DataSourceDialog: React.FC<DataSourceDialogProps> = ({
  open,
  onOpenChange,
  diagramId,
  dataSource,
  onSaved
}) => {
  const isEdit = !!dataSource;

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<DataSourceType>('REST_API');
  const [mode, setMode] = useState<DataSourceMode>('dynamic');
  
  // REST API config
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [authType, setAuthType] = useState<AuthType>('none');
  const [credentials, setCredentials] = useState('');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  
  // Field mappings
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  
  // UI state
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form with existing data source
  useEffect(() => {
    if (open && dataSource) {
      setName(dataSource.name);
      setType(dataSource.type);
      setMode(dataSource.mode);
      
      if (dataSource.type === 'REST_API') {
        const config = dataSource.config as RestApiConfig;
        setUrl(config.url);
        setMethod(config.method);
        setAuthType(config.auth?.type || 'none');
        setCredentials(config.auth?.credentials || '');
        setHeaders(config.headers || {});
      }
      
      setMappings(dataSource.field_mappings);
    } else if (open) {
      // Reset form
      setName('');
      setType('REST_API');
      setMode('dynamic');
      setUrl('');
      setMethod('GET');
      setAuthType('none');
      setCredentials('');
      setHeaders({});
      setMappings([]);
    }
  }, [open, dataSource]);

  const handleTest = async () => {
    if (!url) {
      toast.error('Veuillez renseigner l\'URL');
      return;
    }

    setTesting(true);
    try {
      // Create temporary data source for testing
      const tempConfig: RestApiConfig = {
        url,
        method,
        headers,
        auth: authType !== 'none' ? { type: authType, credentials } : undefined
      };

      const tempSource: CreateDataSourceRequest = {
        diagram_id: diagramId,
        name: name || 'Test',
        type,
        mode,
        config: tempConfig,
        field_mappings: []
      };

      // Create temp source
      const created = await dataSourcesApi.createDataSource(tempSource);
      
      // Test connection
      const result = await dataSourcesApi.testDataSourceConnection(created.id);
      
      // Delete temp source
      await dataSourcesApi.deleteDataSource(created.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Erreur lors du test de connexion');
      console.error(error);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!name || !url) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setSaving(true);
    try {
      const config: RestApiConfig = {
        url,
        method,
        headers,
        auth: authType !== 'none' ? { type: authType, credentials } : undefined
      };

      if (isEdit && dataSource) {
        // Update existing
        await dataSourcesApi.updateDataSource(dataSource.id, {
          name,
          mode,
          config,
          field_mappings: mappings
        });
        toast.success('Source de données modifiée');
      } else {
        // Create new
        const request: CreateDataSourceRequest = {
          diagram_id: diagramId,
          name,
          type,
          mode,
          config,
          field_mappings: mappings
        };
        await dataSourcesApi.createDataSource(request);
        toast.success('Source de données créée');
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addMapping = () => {
    setMappings([
      ...mappings,
      {
        sourceField: '',
        targetIndicator: '',
        targetType: 'indicator',
        transformation: 'last'
      }
    ]);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, updates: Partial<FieldMapping>) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], ...updates };
    setMappings(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier' : 'Créer'} une Source de Données
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="mappings">Mappings ({mappings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: API ERP Production"
              />
            </div>

            {/* Type (disabled en édition) */}
            <div className="space-y-2">
              <Label>Type de Source</Label>
              <Select value={type} onValueChange={(v) => setType(v as DataSourceType)} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REST_API">API REST</SelectItem>
                  <SelectItem value="DATABASE" disabled>Base de données (Phase 2)</SelectItem>
                  <SelectItem value="FILE" disabled>Fichier (Phase 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as DataSourceMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static - Saisie manuelle</SelectItem>
                  <SelectItem value="dynamic">Dynamic - Récupération automatique</SelectItem>
                  <SelectItem value="manual">Manual - Saisie opérateur (Phase 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* REST API Configuration */}
            {type === 'REST_API' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Méthode HTTP</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as 'GET' | 'POST')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Authentification</Label>
                  <Select value={authType} onValueChange={(v) => setAuthType(v as AuthType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authType !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="credentials">
                      {authType === 'bearer' ? 'Token' : authType === 'apikey' ? 'API Key' : 'Mot de passe'}
                    </Label>
                    <Input
                      id="credentials"
                      type="password"
                      value={credentials}
                      onChange={(e) => setCredentials(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <Button variant="outline" onClick={handleTest} disabled={testing}>
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Tester la connexion
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="mappings" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mapping des champs</Label>
                <Button size="sm" variant="outline" onClick={addMapping}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Associez les champs de la source aux indicateurs du diagramme
              </p>
            </div>

            {mappings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun mapping configuré. Cliquez sur "Ajouter" pour commencer.
              </div>
            ) : (
              <div className="space-y-3">
                {mappings.map((mapping, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mapping {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMapping(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Champ source</Label>
                        <Input
                          value={mapping.sourceField}
                          onChange={(e) => updateMapping(index, { sourceField: e.target.value })}
                          placeholder="data.cycleTime"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Indicateur cible</Label>
                        <Input
                          value={mapping.targetIndicator}
                          onChange={(e) => updateMapping(index, { targetIndicator: e.target.value })}
                          placeholder="node-1.cycleTime"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={mapping.targetType}
                          onValueChange={(v) => updateMapping(index, { targetType: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indicator">Indicateur</SelectItem>
                            <SelectItem value="inventory">Stock</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Transformation</Label>
                        <Select
                          value={mapping.transformation}
                          onValueChange={(v) => updateMapping(index, { transformation: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last">Dernière valeur</SelectItem>
                            <SelectItem value="avg">Moyenne</SelectItem>
                            <SelectItem value="sum">Somme</SelectItem>
                            <SelectItem value="count">Comptage</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              isEdit ? 'Modifier' : 'Créer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
