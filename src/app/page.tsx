import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import { Chakra } from "./lib/chakra-provider";
import PageLoader from "./UI/Loader";
import { supabase } from "./lib/Supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <Chakra>
      <Toaster />
      <PageLoader />
      {children}
    </Chakra>
  );
}
