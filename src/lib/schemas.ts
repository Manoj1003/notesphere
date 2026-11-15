import { z } from "zod"

// Notebooks
export const createNotebookSchema = z.object({
    title: z.string().min(1, "Title required").max(200),
    description: z.string().max(1000).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366f1"),
    folderId: z.string().uuid().optional(),
    coverImage: z.string().url().optional(),
})

export const updateNotebookSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    folderId: z.string().uuid().nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
    isArchived: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
})

// Folders
export const createFolderSchema = z.object({
    name: z.string().min(1).max(200),
    parentId: z.string().uuid().optional(),
})

export const updateFolderSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    parentId: z.string().uuid().nullable().optional(),
})

// Notes
export const createNoteSchema = z.object({
    title: z.string().max(500).optional().default("Untitled"),
    notebookId: z.string().uuid().optional(),
    docType: z.enum(["RICH_TEXT", "CANVAS", "MIXED", "PDF"]).optional().default("RICH_TEXT"),
    content: z.any().optional(),
})

export const updateNoteSchema = z.object({
    title: z.string().max(500).optional(),
    content: z.any().optional(),
    notebookId: z.string().uuid().nullable().optional(),
    docType: z.enum(["RICH_TEXT", "CANVAS", "MIXED", "PDF"]).optional(),
    isFavorite: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
})

// Pages
export const createPageSchema = z.object({
    title: z.string().max(200).optional(),
    template: z.string().default("blank"),
    settings: z.any().optional(),
    content: z.any().optional(),
})

export const updatePageSchema = z.object({
    title: z.string().max(200).optional(),
    pageOrder: z.number().int().optional(),
    template: z.string().optional(),
    settings: z.any().optional(),
    content: z.any().optional(),
})

// Search
export const searchSchema = z.object({
    q: z.string().min(1).max(500),
    notebookId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z.string().optional(),
})

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>
export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type SearchInput = z.infer<typeof searchSchema>
