import { getCampusGameIds, isCampusGameEnabled } from "./campus-games";
import "server-only";
import { GameId } from "@/types";
import { CAMPUSES_REGISTRY, type CampusPasskeys } from "./tournament-constants";


import { createHash, timingSafeEqual, randomBytes } from "node:crypto";

// No working credentials are shipped in browser bundles or the repository.
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
export function isSuperAdminCredential(password: string): boolean {
  const expected=process.env.ADMIN_PASSWORD_HASH || "";
  if(typeof password !== "string" || !password || password.length>1024 || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  return timingSafeEqual(createHash("sha256").update(password).digest(),Buffer.from(expected,"hex"));
}
export const DEFAULT_CAMPUS_PASSKEYS: Record<string,CampusPasskeys> = (()=>{
  try { const value=JSON.parse(process.env.CLUTCH_DEFAULT_PASSKEYS || "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  catch { return {}; }
})();
export const VALID_GAME_CODES: Record<string, GameId | "ALL"> = {};
export function generateDefaultCampusPasskeys(campusId:string):CampusPasskeys {
  const prefix=campusId.toUpperCase().slice(0,3);
  const key=(kind:string)=>`CLT-${prefix}-${kind}-${randomBytes(6).toString("hex").toUpperCase()}`;
  return {campusAdminKey:key("ADMIN"),gameKeys:Object.fromEntries(getCampusGameIds(campusId).map(game=>[game,key(game)])) as Record<GameId,string>};
}

export function resolveAdminAccess(
  code: string,
  dynamicPasskeys?: Record<string, CampusPasskeys> | null
): {
  isValid: boolean;
  isSuperAdmin: boolean;
  campusId?: string;
  gameId?: GameId | "ALL";
  isLocked: boolean;
  error?: string;
} {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, isSuperAdmin: false, isLocked: false, error: "Please enter an access code." };
  }

  // Super Admin credentials are verified only against the configured server hash.
  if (isSuperAdminCredential(code)) {
    return {
      isValid: true,
      isSuperAdmin: true,
      campusId: undefined, // Super admin can toggle/access all campuses
      gameId: "ALL",
      isLocked: false,
    };
  }

  // A saved campus keyset replaces its defaults. Collect matches first so ambiguous
  // keys fail closed instead of routing to the first campus in object order.
  const matches: { campusId:string; gameId:GameId | "ALL" }[] = [];
  for (const campusId of Object.keys(CAMPUSES_REGISTRY)) {
    const customized = Boolean(dynamicPasskeys && Object.prototype.hasOwnProperty.call(dynamicPasskeys,campusId));
    const keys = customized ? dynamicPasskeys?.[campusId] : DEFAULT_CAMPUS_PASSKEYS[campusId];
    if (keys?.campusAdminKey?.trim().toUpperCase() === cleanCode) matches.push({campusId,gameId:"ALL"});
    for (const [gameId, key] of Object.entries(keys?.gameKeys || {})) {
      if (isCampusGameEnabled(campusId, gameId) && key?.trim().toUpperCase() === cleanCode) matches.push({campusId,gameId:gameId as GameId});
    }
    if (!customized) {
      if (DEFAULT_CAMPUS_PASSKEYS[campusId]?.campusAdminKey?.toUpperCase() === cleanCode && !matches.some(m=>m.campusId === campusId && m.gameId === "ALL")) matches.push({campusId,gameId:"ALL"});
      const legacyGame = campusId === "mangalore" ? VALID_GAME_CODES[cleanCode] : undefined;
      if (legacyGame && !matches.some(m=>m.campusId === campusId && m.gameId === legacyGame)) matches.push({campusId,gameId:legacyGame});
    }
  }
  if (matches.length > 1) return {isValid:false,isSuperAdmin:false,isLocked:false,error:"This key has conflicting assignments. Ask the admin to generate a unique key."};
  if (matches.length === 1) {
    const assignment = matches[0];
    return {isValid:true,isSuperAdmin:false,...assignment,isLocked:CAMPUSES_REGISTRY[assignment.campusId].isLocked};
  }

  return { isValid: false, isSuperAdmin: false, isLocked: false, error: "Invalid access key or room code." };
}
