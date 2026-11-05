import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your RIAF order and delivery details.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
