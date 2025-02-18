'use client'

import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
})

interface RichTextEditorWrapperProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditorWrapper(props: RichTextEditorWrapperProps) {
  return <RichTextEditor {...props} />
}
