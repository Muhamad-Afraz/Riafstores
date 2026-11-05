import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getCatalogProducts } from "@/lib/catalog";
import { AdminLogin } from "@/components/admin/admin-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return <AdminLogin configured={isAdminConfigured()} />;
  }

  const products = await getCatalogProducts();
  return <AdminDashboard initialProducts={products} />;
}
