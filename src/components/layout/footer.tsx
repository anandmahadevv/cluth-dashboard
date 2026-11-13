import { EVENT_DETAILS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-slate-500">
          © 2026 {EVENT_DETAILS.fullName}. {EVENT_DETAILS.venue}.
        </p>
        <p className="text-[11px] text-slate-400">
          Official Public Broadcast • Powered by Google Apps Script & Sheets
        </p>
      </div>
    </footer>
  );
}
