import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The RIAF pieces you have saved for later.",
};

export default function WishlistPage() {
  return <WishlistView />;
}
