import Midtrans from "midtrans-client";

export const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.SERVER_KEY as string,
    clientKey: process.env.CLIENT_KEY as string,
})

export const createTransaction = async (orderId: string, totalPrice: number, productName: string) => {
    const parameter = {
        item_details: [
            {
                id: orderId,
                price: totalPrice,
                name: productName,
                quantity: 1,
            }
        ],
        transaction_details: {
            order_id: orderId,
            gross_amount: totalPrice,
        },
        expiry: {
            unit: "minute",
            duration: 1,
          },
    }
    return snap.createTransaction(parameter);
}
