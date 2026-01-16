import ComingSoonPage from "./components/UnderConstructionPage";

export default async function EntryLayout() {
  // const headersList = await headers();
  // const cookieHeader = headersList.get("cookie") || "";
  // const match = cookieHeader.match(/user_id=([^;]+)/);
  // const userId = match ? match[1] : null;

  // if (!userId) return <ComingSoonPage />;

  // const { data: user, error } = await supabase
  //   .from("users")
  //   .select("*")
  //   .eq("id", userId)
  //   .single();

  

  return <ComingSoonPage />;
}
