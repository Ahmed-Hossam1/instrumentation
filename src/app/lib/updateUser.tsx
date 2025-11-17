import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateUserLogin(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({
      last_login: new Date().toISOString(),
      online: true,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user login:", error);
  }
}

export async function updateUserLogout(userId: string) {
  const { error } = await supabase
    .from("users")
    .update({ online: false })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user logout:", error);
  }
}
