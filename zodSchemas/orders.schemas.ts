import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

export const orderIdParamSchema = z.object({
  id: z
    .string()
    .uuid({ message: "Order ID harus berupa UUID yang valid" }),
});

export const checkoutFromCartSchema = z.object({
  cartItemId: z.array(z.string().uuid({ message: "Cart item ID harus UUID valid" }))
  .min(1, { message: "Minimal 1 cart item harus dipilih" }),
});

export const checkoutNowSchema = z.object({
  productId: z.string().uuid({ message: "Product ID harus UUID valid" }),
  quantity: z.number({error: "Quantity wajib diisi dan harus angka"})
  .int({ message: "Quantity harus bilangan bulat" })
  .positive({ message: "Quantity harus lebih dari 0" }),
});

export const updateOrderSchema = z.object({
  shippingStatus: z
    .enum([
      "NOT_SHIPPED",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELLED",
    ]).optional(),

  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  
});