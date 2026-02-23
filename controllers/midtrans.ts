import { Request, Response } from "express";
import prisma from "../database/prismaClient";

export const midtransWebhookController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { order_id, transaction_status, transaction_id, fraud_status } = payload;

    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      console.log(`Payment record untuk orderId ${order_id} belum ada!`);
      return res.status(404).json({ msg: "Payment record not found" });
    }

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: {
            paymentStatus: "SUCCESS",
            shippingStatus: "PROCESSING", 
          },
        }),
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            transactionStatus: transaction_status,
            transactionId: transaction_id,
            fraudStatus: fraud_status,
          },
        }),
      ]);
    }

    else if (transaction_status === "cancel") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: {
            paymentStatus: "CANCELLED",
            shippingStatus: "CANCELLED",
          },
        }),
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            transactionStatus: transaction_status,
            transactionId: transaction_id,
          },
        }),
      ]);
    }

    else if (transaction_status === "expire") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: {
            paymentStatus: "EXPIRED",
            shippingStatus: "CANCELLED",
          },
        }),
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            transactionStatus: transaction_status,
          },
        }),
      ]);
    }

    else if (transaction_status === "pending") {
      await prisma.payment.update({
        where: { orderId: order_id },
        data: {
          transactionStatus: "PENDING",
        },
      });
    }

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};