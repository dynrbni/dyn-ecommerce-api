import { Request, Response } from "express";
import prisma from "../database/prismaClient";

export const midtransWebhookController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { order_id, transaction_status, transaction_id } = payload;

    const isSuccess = transaction_status === "capture" || transaction_status === "settlement";
    const isFailed = transaction_status === "cancel" || transaction_status === "expire";

    const payment = await prisma.payment.findUnique({ where: { orderId: order_id } });

    if (!payment) {
      console.log(`Payment record untuk orderId ${order_id} belum ada!`);
      return res.status(404).json({ msg: "Payment record not found" });
    }

    if (isSuccess) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "PAID" },
      });
      await prisma.payment.update({
        where: { orderId: order_id },
        data: { transactionStatus: "SUCCESS", transactionId: transaction_id },
      });
    } else if (isFailed) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "CANCELLED" },
      });
      await prisma.payment.update({
        where: { orderId: order_id },
        data: { transactionStatus: "FAILED", transactionId: transaction_id },
      });
    }

    res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};