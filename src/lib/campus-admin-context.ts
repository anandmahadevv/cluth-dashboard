import { AsyncLocalStorage } from "node:async_hooks";

// Created only by the campus-admin API after verifying a campus-wide key.
export const campusAdminContext = new AsyncLocalStorage<{ campusId: string }>();
export const campusAdminCanManage = (campusId: string) => campusAdminContext.getStore()?.campusId === campusId;
