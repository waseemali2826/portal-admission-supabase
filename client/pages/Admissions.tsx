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
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("app_id", { ascending: true });

    if (error) {
      console.error("Error fetching applications:", error);
      return;
    }

    const mapped: AdmissionRecord[] = (data ?? []).map((p: any) => ({
      id: p.app_id?.toString() ?? "",
      student: { name: p.name, email: p.email, phone: p.phone },
      course: p.course,
      batch: p.batch,
      campus: p.campus,
      startDate: p.start_date || undefined,
      message: p.message || undefined,
      fee: { total: p.fee_total ?? 0, installments: p.fee_installments || [] },
      documents: p.documents || [],
      notes: p.notes || undefined,
      status: p.status || "Pending",
      studentId: p.student_id,
      rejectedReason: p.rejected_reason,
      createdAt: p.created_at,
    }));

    setItems(mapped);
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 5000);
    return () => clearInterval(interval);
  }, []);

  const upsert = (next: AdmissionRecord) => {
    setItems((prev) => prev.map((r) => (r.id === next.id ? next : r)));
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
