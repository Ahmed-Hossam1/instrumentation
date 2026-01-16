import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "./lib/Supabase";
import ComingSoonPage from "./components/UnderConstructionPage";

export default async function EntryLayout() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const match = cookieHeader.match(/user_id=([^;]+)/);
  const userId = match ? match[1] : null;

  if (!userId) return <ComingSoonPage />;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user || error) return <ComingSoonPage />;

  return redirect("/dashboard");
}
