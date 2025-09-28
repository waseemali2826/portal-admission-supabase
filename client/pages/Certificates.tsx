import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { CertificateRequest, CertificateStatus } from "./certificates/types";
import { mockRequests } from "./certificates/data";
import { RequestsTab } from "./certificates/Requests";
import { ApprovalsTab } from "./certificates/Approvals";
import { ProcessingTab } from "./certificates/Processing";
import { TypesTab } from "./certificates/TypesTab";
import { ReportsTab } from "./certificates/Reports";

export default function Certificates() {
  const [items, setItems] = useState<CertificateRequest[]>(mockRequests);

  const upsert = (next: CertificateRequest | ((prev: CertificateRequest[]) => CertificateRequest[])) => {
    if (typeof next === "function") {
      setItems(next as any);
    } else {
      setItems((prev) => [next, ...prev]);
    }
  };

  const approve = (id: string, approver: string) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved", approvedBy: approver } : r)));

  const reject = (id: string, reason: string) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected", rejectedReason: reason } : r)));

  const updateStatus = (id: string, status: CertificateStatus) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const setTracking = (id: string, trackingId: string) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, courierTrackingId: trackingId } : r)));

  const reprint = (id: string) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Reprinting" } : r)));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Certificate Management</h1>
        <p className="text-sm text-muted-foreground">Requests, approvals, processing, types and reports.</p>
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
          <ProcessingTab data={items} onUpdateStatus={updateStatus} onSetTracking={setTracking} onReprint={reprint} />
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
