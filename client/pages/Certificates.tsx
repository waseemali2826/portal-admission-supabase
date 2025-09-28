import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import type {
  CertificateRequest,
  CertificateStatus,
} from "./certificates/types";
import { RequestsTab } from "./certificates/Requests";
import { ApprovalsTab } from "./certificates/Approvals";
import { ProcessingTab } from "./certificates/Processing";
import { TypesTab } from "./certificates/TypesTab";
import { ReportsTab } from "./certificates/Reports";
import { supabase } from "@/lib/supabaseClient";

export default function Certificates() {
  const [items, setItems] = useState<CertificateRequest[]>([]);

  const upsert = async (
    next:
      | CertificateRequest
      | ((prev: CertificateRequest[]) => CertificateRequest[]),
  ) => {
    if (typeof next === "function") {
      setItems(next as any);
      return;
    }
    setItems((prev) => [next, ...prev]);
    try {
      await supabase.from("certificates").upsert(
        {
          id: next.id,
          student_id: next.studentId,
          student_name: next.studentName,
          course: next.course,
          batch: next.batch,
          campus: next.campus,
          type: next.type,
          status: next.status,
          requested_at: next.requestedAt,
          approved_by: next.approvedBy || null,
          rejected_reason: next.rejectedReason || null,
          courier_tracking_id: next.courierTrackingId || null,
        },
        { onConflict: "id" },
      );
    } catch {}
  };

  const approve = async (id: string, approver: string) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved", approvedBy: approver } : r,
      ),
    );
    await supabase
      .from("certificates")
      .update({ status: "Approved", approved_by: approver })
      .eq("id", id);
  };

  const reject = async (id: string, reason: string) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected", rejectedReason: reason } : r,
      ),
    );
    await supabase
      .from("certificates")
      .update({ status: "Rejected", rejected_reason: reason })
      .eq("id", id);
  };

  const updateStatus = async (id: string, status: CertificateStatus) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("certificates").update({ status }).eq("id", id);
  };

  const setTracking = async (id: string, trackingId: string) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, courierTrackingId: trackingId } : r,
      ),
    );
    await supabase
      .from("certificates")
      .update({ courier_tracking_id: trackingId })
      .eq("id", id);
  };

  const reprint = async (id: string) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Reprinting" } : r)),
    );
    await supabase
      .from("certificates")
      .update({ status: "Reprinting" })
      .eq("id", id);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .order("requested_at", { ascending: false });
        if (!error && data) {
          const mapped: CertificateRequest[] = data.map((r: any) => ({
            id: String(r.id),
            studentId: String(r.student_id || ""),
            studentName: r.student_name || "",
            course: r.course || "",
            batch: r.batch || "",
            campus: r.campus || "",
            type: r.type,
            status: r.status,
            requestedAt: r.requested_at || new Date().toISOString(),
            approvedBy: r.approved_by || undefined,
            rejectedReason: r.rejected_reason || undefined,
            courierTrackingId: r.courier_tracking_id || undefined,
          }));
          setItems(mapped);
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Certificate Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Requests, approvals, processing, types and reports.
        </p>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <RequestsTab data={items} onCreate={(req) => upsert(req)} />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalsTab data={items} onApprove={approve} onReject={reject} />
        </TabsContent>

        <TabsContent value="processing">
          <ProcessingTab
            data={items}
            onUpdateStatus={updateStatus}
            onSetTracking={setTracking}
            onReprint={reprint}
          />
        </TabsContent>

        <TabsContent value="types">
          <TypesTab data={items} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
