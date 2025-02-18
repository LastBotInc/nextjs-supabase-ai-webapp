import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Toolbar } from './Toolbar'

interface EditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function Editor({ id, value, onChange, error }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      <Toolbar editor={editor} />
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="prose prose-slate dark:prose-invert max-w-none min-h-[200px]"
        />
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  )
} 