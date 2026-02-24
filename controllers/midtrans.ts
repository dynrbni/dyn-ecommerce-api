import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../database/prismaClient";

export const midtransWebhookController = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { order_id, transaction_status, status_code, gross_amount, transaction_id, } = payload;
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const hashedSignature = crypto
     .createHash("sha512")
     .update(order_id + status_code + gross_amount + serverKey)
     .digest("hex");

      if (hashedSignature !== payload.signature_key) {
        console.log("Signature key tidak valid!");
        return res.status(400).json({ msg: "Invalid signature key" });
      }

    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      console.log(`Payment record untuk orderId ${order_id} belum ada!`);
      return res.status(404).json({ msg: "Payment record not found" });
    }

    if (payment.transactionStatus === transaction_status) {
      console.log(`Payment untuk orderId ${order_id} sudah sukses, tidak perlu update.`);
      return res.status(200).json({ msg: "Webhook received successfully" });
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
            fraudStatus: payload.fraud_status || "accept",
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
    } else if (transaction_status === "expire") {
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
    } else if (transaction_status === "pending") {
      await prisma.payment.update({
        where: { orderId: order_id },
        data: {
          transactionStatus: "PENDING",
        },
      });
    } else if (transaction_status === "refund") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: {
            paymentStatus: "REFUND",
            shippingStatus: "CANCELLED",
          },
        }),
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            transactionStatus: "REFUND",
          },
        }),
      ]);
    } else if (transaction_status === "deny") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order_id },
          data: {
            paymentStatus: "FAILED",
            shippingStatus: "CANCELLED",
          },
        }),
        prisma.payment.update({
          where: { orderId: order_id },
          data: {
            transactionStatus: "DENY",
          },
        }),
      ]);
    }    

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};