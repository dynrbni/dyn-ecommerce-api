import z from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Nama produk harus diisi"),
    description: z.string().min(1, "Deskripsi produk harus diisi"),
    price: z.number().positive("Harga produk harus lebih besar dari 0"),
    stock: z.number().int().nonnegative("Stok produk tidak boleh 0"),
    categoryId: z.string().min(1, "ID kategori harus diisi"),
});

export const updateProductSchema = z.object({
    name: z.string().min(1, "Nama produk harus diisi").optional(),
    description: z.string().min(1, "Deskripsi produk harus diisi").optional(),
    price: z.number().positive("Harga produk harus lebih besar dari 0").optional(),
    stock: z.number().int().nonnegative("Stok produk tidak boleh 0").optional(),
    categoryId: z.string().min(1, "ID kategori harus diisi").optional(),
}); 