import Razorpay from "razorpay";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

export function getRazorpayClient() {
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (KEY_ID and KEY_SECRET) are required");
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
