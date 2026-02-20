import z from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori tidak boleh kosong"),
})

export const updateCategorySchema = z.object({
    name: z.string().min(1, "Nama kategori tidak boleh kosong").optional(),
})