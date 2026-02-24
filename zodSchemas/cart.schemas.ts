import { z } from "zod";

export const cartItemIdParamSchema = z.object({
  id: z
    .string({
      error: "Cart item ID wajib diisi dan harus berupa string",
    })
    .uuid("Cart item ID harus berupa UUID yang valid"),
});

export const addToCartSchema = z.object({
  productId: z
    .string({
      error: "Product ID wajib diisi dan harus berupa string",
    })
    .uuid("Product ID harus berupa UUID yang valid"),

  quantity: z
    .number({
      error: "Quantity wajib diisi dan harus berupa angka",
    })
    .int("Quantity harus berupa bilangan bulat")
    .positive("Quantity harus lebih besar dari 0"),
});

export const updateCartSchema = z.object({
  productId: z
    .string({
      error: "Product ID wajib diisi dan harus berupa string",
    })
    .uuid("Product ID harus berupa UUID yang valid"),

  quantity: z
    .number({
      error: "Quantity wajib diisi dan harus berupa angka",
    })
    .int("Quantity harus berupa bilangan bulat")
    .positive("Quantity harus lebih besar dari 0"),
});

export const removeCartItemSchema = z.object({
  productId: z
    .string({
      error: "Product ID wajib diisi dan harus berupa string",
    })
    .uuid("Product ID harus berupa UUID yang valid"),
});