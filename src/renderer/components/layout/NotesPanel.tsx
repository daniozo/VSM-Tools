/**
 * NotesPanel - Liste des notes dans le panneau gauche
 */

import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { ScrollArea } from '@/renderer/components/ui/scroll-area';
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
  className?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  width,
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  className
}) => {
  return (
    <div
      className={cn('flex flex-col bg-background border-r overflow-hidden', className)}
      style={{ width: `${width}px` }}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">NOTES</h2>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onCreateNote}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notes.map(note => (
            <div
              key={note.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted',
                selectedNoteId === note.id && 'bg-muted'
              )}
              onClick={() => onSelectNote(note.id)}
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{note.title}</p>
                <p className="text-xs text-muted-foreground">
                  {note.updatedAt.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
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
