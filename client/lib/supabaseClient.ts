// export type EnquiryPayload = {
//   name: string;
//   course: string;
//   contact: string;
//   email?: string;
//   preferredStart?: string;
// };

// export type ApplicationPayload = {
//   name: string;
//   email: string;
//   phone: string;
//   course: string;
//   preferredStart?: string;
// };

// export async function listEnquiries() {
//   const r = await fetch("/api/public/enquiries");
//   if (!r.ok) throw new Error("Failed to load enquiries");
//   return (await r.json()).items as any[];
// }

// export async function createEnquiry(payload: EnquiryPayload) {
//   const r = await fetch("/api/public/enquiries", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!r.ok) throw new Error("Failed to submit enquiry");
//   return (await r.json()).item;
// }

// export async function listApplications() {
//   const r = await fetch("/api/public/applications");
//   if (!r.ok) throw new Error("Failed to load applications");
//   return (await r.json()).items as any[];
// }

// export async function createApplication(payload: ApplicationPayload) {
//   const r = await fetch("/api/public/applications", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!r.ok) throw new Error("Failed to submit application");
//   return (await r.json()).item;
// }



import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

