/**
 * NotesEditor - Gestionnaire de notes pour le projet VSM
 * Permet de créer, modifier et supprimer des notes avec texte riche
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog';
import { TipTapEditor } from '../editor/TipTapEditor';
import { cn } from '@/lib/utils';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesEditorProps {
  projectId?: string;
  className?: string;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  projectId,
  className
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Charger les notes depuis le localStorage (ou backend dans le futur)
  useEffect(() => {
    const storageKey = projectId ? `vsm-notes-${projectId}` : 'vsm-notes-default';
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      // Convertir les dates
      const notesWithDates = parsed.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(notesWithDates);
      if (notesWithDates.length > 0) {
        setSelectedNote(notesWithDates[0]);
      }
    }
  }, [projectId]);

  // Sauvegarder les notes dans le localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    const storageKey = projectId ? `vsm-notes-${projectId}` : 'vsm-notes-default';
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) {
      return;
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setNewNoteTitle('');
    setIsNewNoteDialogOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    const updatedNotes = notes.filter(n => n.id !== noteId);
    saveNotes(updatedNotes);

    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes[0] || null);
    }
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      content: editedContent,
      updatedAt: new Date(),
    };

    const updatedNotes = notes.map(n => 
      n.id === selectedNote.id ? updatedNote : n
    );

    saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditMode(false);
  };

  const handleStartEdit = () => {
    setEditedContent(selectedNote?.content || '');
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedContent('');
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Liste des notes à gauche */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-3 border-b">
          <Button
            className="w-full"
            onClick={() => setIsNewNoteDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle note
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {notes.map(note => (
              <div
                key={note.id}
                className={cn(
                  'group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted',
                  selectedNote?.id === note.id && 'bg-muted'
                )}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditMode(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {note.updatedAt.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune note</p>
                <p className="text-sm">Créez votre première note</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Contenu de la note à droite */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* En-tête de la note */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Dernière modification : {selectedNote.updatedAt.toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveNote}>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleStartEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </div>

            {/* Éditeur */}
            <div className="flex-1 overflow-auto p-4">
              {isEditMode ? (
                <TipTapEditor
                  content={selectedNote.content}
                  onChange={setEditedContent}
                  placeholder="Écrivez vos notes ici..."
                  editable={true}
                  className="h-full"
                />
              ) : (
                <TipTapEditor
                  content={selectedNote.content}
                  editable={false}
                  className="h-full"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">Aucune note sélectionnée</p>
              <p className="text-sm">Sélectionnez ou créez une note pour commencer</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialog pour créer une nouvelle note */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
            <DialogDescription>
              Donnez un titre à votre nouvelle note
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Titre de la note"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNote();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewNoteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateNote} disabled={!newNoteTitle.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesEditor;
