// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { supabase } from "../lib/Supabase";
import SidebarWithHeader from "../components/SidebarWithHeader";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const match = cookieHeader.match(/user_id=([^;]+)/);
  const userId = match ? match[1] : null;

  if (!userId) return redirect("/auth_layout/login");

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user || error) return redirect("/auth_layout/login");

  return <SidebarWithHeader>{children}</SidebarWithHeader>;
}
