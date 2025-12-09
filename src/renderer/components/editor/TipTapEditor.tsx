/**
 * TipTapEditor - Éditeur de texte riche avec TipTap
 * Fonctionnalités : gras, italique, souligné, listes, liens, titres
 */

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Commencez à écrire...',
  editable = true,
  className
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    icon: React.ElementType; 
    title: string;
  }) => (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={cn('flex flex-col border rounded-md bg-background', className)}>
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title="Titre 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title="Titre 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title="Titre 3"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            title="Gras"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            title="Italique"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={Strikethrough}
            title="Barré"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={Code}
            title="Code"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            title="Liste à puces"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            title="Liste numérotée"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            icon={CheckSquare}
            title="Liste de tâches"
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            icon={LinkIcon}
            title="Lien"
          />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className={cn(
          'prose prose-sm max-w-none p-4',
          'focus:outline-none',
          '[&_.ProseMirror]:min-h-[200px]',
          '[&_.ProseMirror]:focus:outline-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_ul]:list-disc',
          '[&_.ProseMirror_ul]:pl-6',
          '[&_.ProseMirror_ol]:list-decimal',
          '[&_.ProseMirror_ol]:pl-6',
          '[&_.ProseMirror_h1]:text-3xl',
          '[&_.ProseMirror_h1]:font-bold',
          '[&_.ProseMirror_h1]:mt-6',
          '[&_.ProseMirror_h1]:mb-4',
          '[&_.ProseMirror_h2]:text-2xl',
          '[&_.ProseMirror_h2]:font-semibold',
          '[&_.ProseMirror_h2]:mt-5',
          '[&_.ProseMirror_h2]:mb-3',
          '[&_.ProseMirror_h3]:text-xl',
          '[&_.ProseMirror_h3]:font-semibold',
          '[&_.ProseMirror_h3]:mt-4',
          '[&_.ProseMirror_h3]:mb-2',
          '[&_.ProseMirror_code]:bg-muted',
          '[&_.ProseMirror_code]:px-1',
          '[&_.ProseMirror_code]:py-0.5',
          '[&_.ProseMirror_code]:rounded',
          '[&_.ProseMirror_pre]:bg-muted',
          '[&_.ProseMirror_pre]:p-4',
          '[&_.ProseMirror_pre]:rounded',
          '[&_.ProseMirror_pre]:overflow-x-auto',
          '[&_.ProseMirror_blockquote]:border-l-4',
          '[&_.ProseMirror_blockquote]:border-border',
          '[&_.ProseMirror_blockquote]:pl-4',
          '[&_.ProseMirror_blockquote]:italic',
          '[&_ul[data-type="taskList"]]:list-none',
          '[&_ul[data-type="taskList"]]:pl-0',
          '[&_li[data-type="taskItem"]]:flex',
          '[&_li[data-type="taskItem"]]:items-start',
          '[&_li[data-type="taskItem"]]:gap-2',
          '[&_li[data-type="taskItem"]>label]:flex',
          '[&_li[data-type="taskItem"]>label]:items-center',
          '[&_li[data-type="taskItem"]>label]:gap-2',
          '[&_li[data-type="taskItem"]>label>input[type="checkbox"]]:mt-1'
        )}
      />
    </div>
  );
};

export default TipTapEditor;
