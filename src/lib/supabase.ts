import { createClient } from "@supabase/supabase-js";
import { TournamentStoreData } from "./tournament-store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("your-project") &&
      !supabaseKey.includes("your-anon-key")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

const STATE_ROW_ID = "CLUTCH_MANGALORE_2026";

/**
 * Fetch tournament data directly from Supabase
 */
export async function fetchStoreFromSupabase(): Promise<TournamentStoreData | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("tournament_state")
      .select("data, updated_at")
      .eq("id", STATE_ROW_ID)
      .single();

    if (error) {
      // Table might not exist yet or row not initialized
      console.warn("Notice from Supabase query:", error.message);
      return null;
    }

    if (data && data.data) {
      return data.data as TournamentStoreData;
    }
  } catch (err) {
    console.warn("Failed to fetch from Supabase:", err);
  }

  return null;
}

/**
 * Persist tournament data atomically to Supabase
 */
export async function persistStoreToSupabase(storeData: TournamentStoreData): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("tournament_state").upsert(
      {
        id: STATE_ROW_ID,
        data: storeData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase upsert error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to persist to Supabase:", err);
    return false;
  }
}
