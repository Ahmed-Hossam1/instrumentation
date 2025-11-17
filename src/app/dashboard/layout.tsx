import { redirect } from "next/navigation";
import { supabase } from "../lib/Supabase";
import SidebarWithHeader from "../components/SidebarWithHeader";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import PageLoader from "../UI/Loader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // صححنا طريقة جلب الـ cookie
  const headersList = await headers();
  const cookieHeader = (await headersList.get("cookie")) || "";
  const match = cookieHeader.match(/user_id=([^;]+)/);
  const userId = match ? match[1] : null;

  if (!userId) return redirect("/auth_layout/login");

  // تشيك على وجود المستخدم في جدول users
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user || error) return redirect("/auth_layout/login");

  return (
    <SidebarWithHeader>
      <Toaster />
      <PageLoader />
      {children}
    </SidebarWithHeader>
  );
}
