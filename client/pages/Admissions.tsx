// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useEffect, useState } from "react";
// import type { AdmissionRecord } from "./admissions/types";
// import { mockAdmissions } from "./admissions/data";
// import { ApplicationsTab } from "./admissions/Applications";
// import { ReportsTab } from "./admissions/Reports";
// import { getPublicApplications } from "@/lib/publicStore";
// import { listApplications } from "@/lib/publicApi";

// export default function Admissions() {
//   const [items, setItems] = useState<AdmissionRecord[]>(mockAdmissions);

//   useEffect(() => {
//     const mergeFromPublic = async () => {
//       const [local, server] = await Promise.allSettled([
//         Promise.resolve(getPublicApplications()),
//         listApplications(),
//       ]);
//       const all = [
//         ...(server.status === "fulfilled" ? server.value : []),
//         ...(local.status === "fulfilled" ? local.value : []),
//       ];
//       if (all.length) {
//         const mapped: AdmissionRecord[] = all.map((p: any) => ({
//           id: p.id,
//           createdAt: p.createdAt,
//           status: "Pending",
//           student: { name: p.name, email: p.email, phone: p.phone },
//           course: p.course,
//           batch: "TBD",
//           campus: "Main",
//           fee: { total: 0, installments: [] },
//           documents: [],
//           notes: p.preferredStart
//             ? `Preferred start: ${p.preferredStart}`
//             : undefined,
//         }));
//         setItems((prev) => {
//           const byId = new Map(prev.map((x) => [x.id, x] as const));
//           for (const m of mapped) if (!byId.has(m.id)) byId.set(m.id, m);
//           return Array.from(byId.values());
//         });
//       }
//     };

//     mergeFromPublic();

//     const onStorage = (e: StorageEvent) => {
//       if (e.key === "public.applications") mergeFromPublic();
//     };
//     window.addEventListener("storage", onStorage);

//     const iv = setInterval(() => {
//       void mergeFromPublic();
//     }, 2000);
//     return () => {
//       window.removeEventListener("storage", onStorage);
//       clearInterval(iv);
//     };
//   }, []);

//   const upsert = (next: AdmissionRecord) => {
//     setItems((prev) => prev.map((r) => (r.id === next.id ? next : r)));
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <h1 className="text-xl font-semibold tracking-tight">Admissions</h1>
//         <p className="text-sm text-muted-foreground">
//           Review, approve, transfer, and report on admissions.
//         </p>
//       </div>
//       <Tabs defaultValue="applications">
//         <TabsList>
//           <TabsTrigger value="applications">Applications</TabsTrigger>
//           <TabsTrigger value="reports">Reports</TabsTrigger>
//         </TabsList>
//         <TabsContent value="applications">
//           <ApplicationsTab data={items} onUpdate={upsert} />
//         </TabsContent>
//         <TabsContent value="reports">
//           <ReportsTab data={items} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import type { AdmissionRecord } from "./admissions/types";
import { ApplicationsTab } from "./admissions/Applications";
import { ReportsTab } from "./admissions/Reports";
import { supabase } from "@/lib/supabaseClient";

export default function Admissions() {
  const [items, setItems] = useState<AdmissionRecord[]>([]);

  const fetchApplications = async () => {
    // Avoid relying on a specific PK name; different setups may use app_id, id, or uuid
    const { data, error } = await supabase.from("applications").select("*");
    if (error) {
      console.error("Error fetching applications:", error);
      return;
    }
    const mapped: AdmissionRecord[] = (data ?? []).map((p: any) => {
      const anyId = p.app_id ?? p.id ?? p.appId ?? p.appID;
      const created = p.created_at ?? p.createdAt ?? new Date().toISOString();
      return {
        id: String(anyId ?? ""),
        student: { name: p.name, email: p.email, phone: p.phone },
        course: p.course,
        batch: p.batch ?? "TBD",
        campus: p.campus ?? "Main",
        startDate: p.start_date || undefined,
        message: p.message || undefined,
        fee: {
          total: p.fee_total ?? 0,
          installments: p.fee_installments || [],
        },
        documents: p.documents || [],
        notes: p.notes || undefined,
        status: p.status || "Pending",
        studentId: p.student_id ?? undefined,
        rejectedReason: p.rejected_reason ?? undefined,
        createdAt: created,
      };
    });
    setItems(mapped);
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 5000);
    return () => clearInterval(interval);
  }, []);

  const upsert = async (next: AdmissionRecord) => {
    setItems((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    const idNum = Number(next.id);
    const payload: any = {
      status: next.status,
      student_id: next.studentId || null,
      batch: next.batch,
      campus: next.campus,
      rejected_reason: next.rejectedReason || null,
      fee_total: next.fee?.total ?? null,
      fee_installments: next.fee?.installments ?? null,
      documents: next.documents ?? null,
      notes: next.notes ?? null,
    };
    // Try updating by app_id, then fall back to id
    try {
      const byAppId = await supabase
        .from("applications")
        .update(payload)
        .eq("app_id", Number.isFinite(idNum) ? idNum : next.id as any);
      if (!byAppId.error) return;
    } catch {}
    try {
      await supabase
        .from("applications")
        .update(payload)
        .eq("id", Number.isFinite(idNum) ? idNum : next.id as any);
    } catch (e) {
      console.error("Failed to persist application update", e);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Admissions</h1>
        <p className="text-sm text-muted-foreground">
          Review, approve, transfer, and report on admissions.
        </p>
      </div>
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsTab data={items} onUpdate={upsert} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
