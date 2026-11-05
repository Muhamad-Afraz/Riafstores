import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your RIAF cart before checkout.",
};

export default function CartPage() {
  return <CartView />;
}
