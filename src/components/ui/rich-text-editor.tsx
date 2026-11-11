import { useEffect } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3,
  List, ListOrdered, ListChecks, Quote, Minus, Undo2, Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toHtml } from "@/lib/rich-text";

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** "full" shows headings/quote/divider; "compact" keeps just inline marks and lists. */
  variant?: "full" | "compact";
  /** Minimum height of the writing area (Tailwind class). */
  minHeightClass?: string;
  className?: string;
}

export function RichTextEditor({
  value, onChange, placeholder, readOnly = false, variant = "full",
  minHeightClass = "min-h-[180px]", className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: readOnly, autolink: true },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: toHtml(value),
    editable: !readOnly,
    immediatelyRender: true,
    editorProps: {
      attributes: { class: cn("journal-prose focus:outline-none px-3 py-2", minHeightClass) },
    },
    onUpdate: ({ editor }) => onChange?.(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Sync external value changes (e.g. switching dates) without clobbering the cursor while typing.
  useEffect(() => {
    if (!editor) return;
    const next = toHtml(value);
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (next !== current) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const ext = editor.extensionManager.extensions.find(e => e.name === "placeholder");
    if (ext) {
      ext.options.placeholder = placeholder ?? "";
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, placeholder]);

  return (
    <div
      className={cn(
        "w-full rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors",
        !readOnly && "focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {!readOnly && editor && <Toolbar editor={editor} variant={variant} />}
      <EditorContent editor={editor} />
    </div>
  );
}

/** Read-only, borderless rendering of rich text (e.g. inside cards). */
export function RichTextView({ value, className }: { value: string; className?: string }) {
  return (
    <RichTextEditor
      value={value}
      readOnly
      minHeightClass="min-h-0"
      className={cn("border-0 shadow-none rounded-none [&_.journal-prose]:p-0", className)}
    />
  );
}

function Toolbar({ editor, variant }: { editor: Editor; variant: "full" | "compact" }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      task: editor.isActive("taskList"),
      quote: editor.isActive("blockquote"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  type Item = { icon: typeof Bold; label: string; active?: boolean; disabled?: boolean; full?: boolean; run: () => void } | "sep";
  const all: Item[] = [
    { icon: Bold, label: "Bold (⌘B)", active: state.bold, run: () => chain().toggleBold().run() },
    { icon: Italic, label: "Italic (⌘I)", active: state.italic, run: () => chain().toggleItalic().run() },
    { icon: Underline, label: "Underline (⌘U)", active: state.underline, run: () => chain().toggleUnderline().run() },
    { icon: Strikethrough, label: "Strikethrough", active: state.strike, run: () => chain().toggleStrike().run() },
    "sep",
    { icon: Heading2, label: "Heading", full: true, active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { icon: Heading3, label: "Subheading", full: true, active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    "sep",
    { icon: List, label: "Bullet list", active: state.bullet, run: () => chain().toggleBulletList().run() },
    { icon: ListOrdered, label: "Numbered list", active: state.ordered, run: () => chain().toggleOrderedList().run() },
    { icon: ListChecks, label: "Checklist", active: state.task, run: () => chain().toggleTaskList().run() },
    { icon: Quote, label: "Quote", full: true, active: state.quote, run: () => chain().toggleBlockquote().run() },
    { icon: Minus, label: "Divider", full: true, run: () => chain().setHorizontalRule().run() },
    "sep",
    { icon: Undo2, label: "Undo (⌘Z)", disabled: !state.canUndo, run: () => chain().undo().run() },
    { icon: Redo2, label: "Redo (⇧⌘Z)", disabled: !state.canRedo, run: () => chain().redo().run() },
  ];
  const items = all
    .filter(i => i === "sep" || variant === "full" || !i.full)
    .filter((i, idx, arr) => !(i === "sep" && arr[idx - 1] === "sep"));

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1.5 py-1">
      {items.map((item, i) =>
        item === "sep" ? (
          <span key={i} className="mx-1 h-4 w-px bg-border" />
        ) : (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={item.active}
            disabled={item.disabled}
            onMouseDown={e => e.preventDefault()}
            onClick={item.run}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
              item.active && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary",
            )}
          >
            <item.icon className="h-4 w-4" />
          </button>
        ),
      )}
    </div>
  );
}
