"use client"

import type { Editor } from "@tiptap/react"
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Code, Code2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, CheckSquare, Quote, Minus, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
    Heading1, Heading2, Heading3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "toolbar-btn",
                isActive && "toolbar-btn-active",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    )
}

function Divider() {
    return <div className="toolbar-divider" />
}

export function EditorToolbar({ editor }: { editor: Editor }) {
    const setLink = () => {
        const prev = editor.getAttributes("link").href as string | undefined
        const url = window.prompt("Link URL", prev ?? "https://")
        if (url === null) return
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }
    }

    const addImage = () => {
        const url = window.prompt("Image URL")
        if (url) editor.chain().focus().setImage({ src: url }).run()
    }

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }

    return (
        <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
            {/* Undo / Redo */}
            <ToolbarButton
                title="Undo (Ctrl+Z)"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Redo (Ctrl+Y)"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
                title="Heading 1"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
            >
                <Heading1 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Heading 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
            >
                <Heading2 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Heading 3"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
            >
                <Heading3 className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Inline formatting */}
            <ToolbarButton
                title="Bold (Ctrl+B)"
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
            >
                <Bold className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Italic (Ctrl+I)"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
            >
                <Italic className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Underline (Ctrl+U)"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
            >
                <UnderlineIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
            >
                <Strikethrough className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
            >
                <Code className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Code block"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
            >
                <Code2 className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
                title="Align left"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                isActive={editor.isActive({ textAlign: "left" })}
            >
                <AlignLeft className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Align center"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                isActive={editor.isActive({ textAlign: "center" })}
            >
                <AlignCenter className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Align right"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                isActive={editor.isActive({ textAlign: "right" })}
            >
                <AlignRight className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Justify"
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                isActive={editor.isActive({ textAlign: "justify" })}
            >
                <AlignJustify className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
                title="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
            >
                <List className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
            >
                <ListOrdered className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Task list"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive("taskList")}
            >
                <CheckSquare className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Blockquote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
            >
                <Quote className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Horizontal rule"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Insert */}
            <ToolbarButton
                title="Link"
                onClick={setLink}
                isActive={editor.isActive("link")}
            >
                <LinkIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Image"
                onClick={addImage}
            >
                <ImageIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
                title="Table"
                onClick={insertTable}
                isActive={editor.isActive("table")}
            >
                <TableIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
        </div>
    )
}
