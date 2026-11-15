"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Underline } from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { TextAlign } from "@tiptap/extension-text-align"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extension-placeholder"
import { CharacterCount } from "@tiptap/extension-character-count"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"
import { Typography } from "@tiptap/extension-typography"
import { CodeBlock } from "@tiptap/extension-code-block"
import { useEffect } from "react"
import { EditorToolbar } from "./editor-toolbar"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
    content?: object | null
    onUpdate?: (json: object) => void
    placeholder?: string
    editable?: boolean
    className?: string
}

export function RichTextEditor({
    content,
    onUpdate,
    placeholder = "Start writing…",
    editable = true,
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            CodeBlock.configure({ HTMLAttributes: { class: "code-block" } }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "editor-link" } }),
            Image.configure({ allowBase64: true }),
            Typography,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            CharacterCount,
            Placeholder.configure({ placeholder }),
        ],
        content: content ?? {},
        editable,
        onUpdate({ editor }) {
            onUpdate?.(editor.getJSON())
        },
    })

    // Sync external content changes (e.g. loading note from server)
    useEffect(() => {
        if (!editor || !content) return
        const currentJson = JSON.stringify(editor.getJSON())
        const incomingJson = JSON.stringify(content)
        if (currentJson !== incomingJson) {
            editor.commands.setContent(content, false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content])

    // Update editability
    useEffect(() => {
        if (!editor) return
        editor.setEditable(editable)
    }, [editor, editable])

    const charCount = editor?.storage.characterCount?.characters?.() ?? 0
    const wordCount = editor?.storage.characterCount?.words?.() ?? 0

    return (
        <div className={cn("rich-text-editor flex flex-col h-full", className)}>
            {editable && editor && <EditorToolbar editor={editor} />}
            <EditorContent
                editor={editor}
                className="editor-content flex-1 overflow-y-auto"
            />
            {editable && (
                <div className="editor-footer">
                    <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
                    <span className="mx-1">·</span>
                    <span>{charCount} char{charCount !== 1 ? "s" : ""}</span>
                </div>
            )}
        </div>
    )
}
