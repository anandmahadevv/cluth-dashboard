import { cn } from "@/lib/utils";
const universityStyle: Record<string,{label:string;short:string;style:string}> = {
 "SIPHER":{label:"SIPHER",short:"SI",style:"border-sky-200 bg-sky-50 text-sky-800"},
 "Yenepoya Bangalore":{label:"Yenepoya",short:"YE",style:"border-teal-200 bg-teal-50 text-teal-800"},
 "S-Vyasa":{label:"S-Vyasa",short:"SV",style:"border-violet-200 bg-violet-50 text-violet-800"},
 "BEST":{label:"BEST IU",short:"BE",style:"border-amber-200 bg-amber-50 text-amber-900"},
};
export function UniversityBadge({university}:{university?:string}) {
 if(!university)return null;
 const badge=universityStyle[university] || {label:university,short:university.slice(0,2).toUpperCase(),style:"border-slate-200 bg-slate-50 text-slate-700"};
 return <span title={university} className={cn("inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold leading-none",badge.style)}><span aria-hidden="true" className="text-[9px] font-bold opacity-60">{badge.short}</span><span className="truncate">{badge.label}</span></span>;
}
