import { createClient } from "@supabase/supabase-js";
import { TournamentStoreData } from "./tournament-store";

const FALLBACK_SUPABASE_URL = "https://iajmrlbvurmblqqysrju.supabase.co";
const FALLBACK_SUPABASE_KEY = "sb_publishable_GLrozB5rnnuzf5iPxWyn2A_OaUIp8OD";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  FALLBACK_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  FALLBACK_SUPABASE_KEY;

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

/** Fresh snapshot for compare-and-swap match writes; never fall back to stale data. */
export async function fetchMatchWriteSnapshot() {
  if (!supabase) throw new Error("Database is not configured.");
  const { data, error } = await supabase.from("tournament_state")
    .select("data, updated_at").eq("id", STATE_ROW_ID).single();
  if (error || !data?.data || !data.updated_at) throw new Error("Could not read tournament state. Please retry.");
  return { store: data.data as TournamentStoreData, revision: data.updated_at as string };
}

/** Only commit if no writer changed the row since the fresh read. */
export async function commitMatchWrite(store: TournamentStoreData, revision: string): Promise<boolean> {
  if (!supabase) throw new Error("Database is not configured.");
  const { data, error } = await supabase.from("tournament_state")
    .update({ data: store, updated_at: new Date(Math.max(Date.now(), Date.parse(revision) + 1)).toISOString() })
    .eq("id", STATE_ROW_ID).eq("updated_at", revision).select("id");
  if (error) throw new Error("Could not save match. Please retry the same submission.");
  return Boolean(data?.length);
}
