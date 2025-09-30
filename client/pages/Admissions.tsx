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
import { useCallback, useEffect, useState } from "react";
import type { AdmissionRecord } from "./admissions/types";
import { ApplicationsTab } from "./admissions/Applications";
import { ReportsTab } from "./admissions/Reports";
import { supabase } from "@/lib/supabaseClient";
import { getPublicApplications } from "@/lib/publicStore";

export default function Admissions() {
  const [items, setItems] = useState<AdmissionRecord[]>([]);

  const fetchApplications = useCallback(async () => {
    const records = new Map<string, AdmissionRecord>();

    if (supabase) {
      try {
        const { data, error } = await supabase.from("applications").select("*");
        if (!error && Array.isArray(data)) {
          for (const entry of data) {
            const rawId =
              entry.app_id ??
              entry.id ??
              entry.appId ??
              entry.appID ??
              entry.uuid;
            if (!rawId) continue;
            const id = String(rawId);
            const created =
              entry.created_at ?? entry.createdAt ?? new Date().toISOString();
            const installments =
              Array.isArray(entry.fee_installments) &&
              entry.fee_installments.length > 0
                ? entry.fee_installments.map((inst: any, index: number) => ({
                    id: String(inst.id ?? `I${index + 1}`),
                    amount: Number(inst.amount ?? 0) || 0,
                    dueDate: inst.due_date ?? inst.dueDate ?? created,
                    paidAt: inst.paid_at ?? inst.paidAt ?? undefined,
                  }))
                : [
                    {
                      id: "due",
                      amount: Number(entry.fee_total ?? 0) || 0,
                      dueDate:
                        entry.next_due_date ??
                        new Date(
                          Date.now() + 7 * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                    },
                  ];
            const documents = Array.isArray(entry.documents)
              ? entry.documents.map((doc: any, index: number) => ({
                  name: String(doc.name ?? `Document ${index + 1}`),
                  url: String(doc.url ?? "#"),
                  verified: Boolean(doc.verified),
                }))
              : [];
            records.set(id, {
              id,
              createdAt: String(created),
              status: (entry.status as AdmissionRecord["status"]) ?? "Pending",
              student: {
                name: String(entry.name ?? ""),
                email: String(entry.email ?? ""),
                phone: String(entry.phone ?? ""),
                dob: entry.dob ?? undefined,
                address: entry.address ?? undefined,
              },
              course: String(entry.course ?? ""),
              batch: String(entry.batch ?? "TBD"),
              campus: String(entry.campus ?? "Main"),
              fee: {
                total: Number(entry.fee_total ?? 0) || 0,
                installments,
              },
              documents,
              notes: entry.notes ?? undefined,
              studentId: entry.student_id ?? entry.studentId ?? undefined,
              rejectedReason:
                entry.rejected_reason ?? entry.rejectedReason ?? undefined,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching applications from Supabase:", error);
      }
    }

    try {
      // Try to fetch from server API; if it fails, fallback to local stored public applications
      const response = await fetch("/api/public/applications");
      if (response.ok) {
        const payload = await response.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        for (const entry of items) {
          const rawId = entry.id ?? entry.app_id ?? entry.appId;
          if (!rawId) continue;
          const id = String(rawId);
          if (records.has(id)) continue;
          const created = entry.createdAt ?? new Date().toISOString();
          const dueDate =
            entry.preferredStart ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          records.set(id, {
            id,
            createdAt: String(created),
            status: "Pending",
            student: {
              name: String(entry.name ?? ""),
              email: String(entry.email ?? ""),
              phone: String(entry.phone ?? ""),
            },
            course: String(entry.course ?? ""),
            batch: "TBD",
            campus: "Main",
            fee: {
              total: 0,
              installments: [
                {
                  id: "due",
                  amount: 0,
                  dueDate,
                },
              ],
            },
            documents: [],
            notes: entry.preferredStart
              ? `Preferred start: ${entry.preferredStart}`
              : undefined,
          });
        }
      } else {
        // non-OK response, fallback to local storage
        const items = getPublicApplications();
        for (const entry of items) {
          const rawId = entry.id ?? entry.app_id ?? entry.appId;
          if (!rawId) continue;
          const id = String(rawId);
          if (records.has(id)) continue;
          const created = entry.createdAt ?? new Date().toISOString();
          const dueDate =
            entry.preferredStart ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          records.set(id, {
            id,
            createdAt: String(created),
            status: "Pending",
            student: {
              name: String(entry.name ?? ""),
              email: String(entry.email ?? ""),
              phone: String(entry.phone ?? ""),
            },
            course: String(entry.course ?? ""),
            batch: "TBD",
            campus: "Main",
            fee: {
              total: 0,
              installments: [
                {
                  id: "due",
                  amount: 0,
                  dueDate,
                },
              ],
            },
            documents: [],
            notes: entry.preferredStart
              ? `Preferred start: ${entry.preferredStart}`
              : undefined,
          });
        }
      }
    } catch (error) {
      // network or other failure: fallback to local stored public applications
      try {
        const items = getPublicApplications();
        for (const entry of items) {
          const rawId = entry.id ?? entry.app_id ?? entry.appId;
          if (!rawId) continue;
          const id = String(rawId);
          if (records.has(id)) continue;
          const created = entry.createdAt ?? new Date().toISOString();
          const dueDate =
            entry.preferredStart ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          records.set(id, {
            id,
            createdAt: String(created),
            status: "Pending",
            student: {
              name: String(entry.name ?? ""),
              email: String(entry.email ?? ""),
              phone: String(entry.phone ?? ""),
            },
            course: String(entry.course ?? ""),
            batch: "TBD",
            campus: "Main",
            fee: {
              total: 0,
              installments: [
                {
                  id: "due",
                  amount: 0,
                  dueDate,
                },
              ],
            },
            documents: [],
            notes: entry.preferredStart
              ? `Preferred start: ${entry.preferredStart}`
              : undefined,
          });
        }
      } catch (e) {
        // swallow
      }
    }

    const ordered = Array.from(records.values()).sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
    setItems(ordered);
  }, [supabase]);

  useEffect(() => {
    void fetchApplications();
    const interval = setInterval(() => {
      void fetchApplications();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchApplications]);

  const upsert = async (next: AdmissionRecord) => {
    setItems((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    if (!supabase) return;
    const numericId = Number(next.id);
    const candidateValues = Number.isFinite(numericId)
      ? [numericId, next.id]
      : [next.id];
    const payload: Record<string, unknown> = {
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

    for (const column of ["app_id", "id"]) {
      for (const value of candidateValues) {
        try {
          const { error } = await supabase
            .from("applications")
            .update(payload)
            .eq(column, value as any);
          if (!error) return;
        } catch (error) {
          console.error("Failed to persist application update", error);
        }
      }
    }
  };

  const handleDeleted = useCallback(
    async (id: string) => {
      // Remove from UI immediately for fast feedback
      setItems((prev) => prev.filter((item) => item.id !== id));

      // Try server-side delete first (recommended)
      try {
        const resp = await fetch("/api/public/applications/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (resp.ok) {
          const payload = await resp.json();
          if (payload?.ok) {
            // Successfully deleted on server
            return;
          }
        }
      } catch (e) {
        // continue to try direct Supabase delete
        console.debug("Server delete failed, falling back to Supabase client", e);
      }

      // Fallback: try direct Supabase deletion (tries both app_id and id)
      if (supabase) {
        try {
          const numeric = Number(id);
          const values = Number.isFinite(numeric) ? [numeric, id] : [id];
          const columns: Array<"app_id" | "id"> = ["app_id", "id"];

          for (const column of columns) {
            for (const value of values) {
              try {
                const { data, error } = await supabase
                  .from("applications")
                  .delete()
                  .eq(column, value as any)
                  .select("*")
                  .limit(1);
                if (!error && Array.isArray(data) && data.length > 0) {
                  // deleted
                  return;
                }
              } catch (innerErr) {
                console.debug("Supabase deletion attempt failed", innerErr);
              }
            }
          }
        } catch (err) {
          console.error("Supabase deletion error", err);
        }
      }

      // Final fallback: remove from local public applications store
      try {
        const raw = getPublicApplications();
        if (Array.isArray(raw)) {
          const next = raw.filter((it: any) => String(it.id) !== String(id));
          localStorage.setItem("public.applications", JSON.stringify(next));
        }
      } catch (e) {
        console.error("Failed fallback local deletion", e);
      }

      // Refresh list to ensure consistency
      void fetchApplications();
    },
    [fetchApplications],
  );

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
          <ApplicationsTab
            data={items}
            onUpdate={upsert}
            onDeleted={handleDeleted}
          />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
