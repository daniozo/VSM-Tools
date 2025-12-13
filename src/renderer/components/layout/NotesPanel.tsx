/**
 * NotesPanel - Liste des notes dans le panneau gauche
 */

import React, { useState } from 'react';
import { Plus, FileText, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
import { Input } from '@/renderer/components/ui/input';
import { cn } from '@/lib/utils';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NotesPanelProps {
  width: number;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onRenameNote?: (noteId: string, newTitle: string) => void;
  onDeleteNote?: (noteId: string) => void;
  canCreate?: boolean;
  className?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  width,
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onRenameNote,
  onDeleteNote,
  canCreate = true,
  className
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
  };

  const handleConfirmRename = (noteId: string) => {
    if (editingTitle.trim() && onRenameNote) {
      onRenameNote(noteId, editingTitle.trim());
    }
    setEditingNoteId(null);
    setEditingTitle('');
  };

  const handleCancelRename = () => {
    setEditingNoteId(null);
    setEditingTitle('');
  };

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (onDeleteNote) {
      onDeleteNote(noteId);
    }
  };

  return (
    <div
      className={cn('flex flex-col bg-background border-r overflow-hidden', className)}
      style={{ width: `${width}px` }}
    >
      <div className="h-9 px-3 border-b flex items-center justify-between bg-muted/30">
        <span className="text-sm font-medium">Notes</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onCreateNote}
          disabled={!canCreate}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notes.map(note => (
            <div
              key={note.id}
              className={cn(
                'group flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted',
                selectedNoteId === note.id && 'bg-muted'
              )}
              onClick={() => editingNoteId !== note.id && onSelectNote(note.id)}
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {editingNoteId === note.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(note.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      className="h-6 text-sm px-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={(e) => { e.stopPropagation(); handleConfirmRename(note.id); }}
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={(e) => { e.stopPropagation(); handleCancelRename(); }}
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate text-sm break-words line-clamp-2">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.updatedAt.toLocaleDateString('fr-FR')}
                    </p>
                  </>
                )}
              </div>
              {editingNoteId !== note.id && (
                <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onRenameNote && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleStartRename(e, note)}
                      title="Renommer"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {onDeleteNote && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:text-destructive"
                      onClick={(e) => handleDelete(e, note.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground text-sm">
              <p>Aucune note</p>
              <p className="text-xs mt-1">Cliquez sur + pour créer</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotesPanel;
