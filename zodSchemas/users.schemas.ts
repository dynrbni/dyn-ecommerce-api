import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password setidaknya harus 6 karakter"),
})

export const updateUserSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong").optional(),
    email: z.string().email("Email tidak valid").optional(),
    password: z.string().min(6, "Password setidaknya harus 6 karakter").optional(),
})

export const loginUserSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password setidaknya harus 6 karakter"),
})
