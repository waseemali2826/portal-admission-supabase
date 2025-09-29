// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
// import { useMemo, useState } from "react";
// import { paymentStatus } from "./types";
// import type { AdmissionRecord, AdmissionStatus } from "./types";
// import { Details } from "./Details";

// export function ApplicationsTab({
//   data,
//   onUpdate,
// }: {
//   data: AdmissionRecord[];
//   onUpdate: (rec: AdmissionRecord) => void;
// }) {
//   const [query, setQuery] = useState("");
//   const [filter, setFilter] = useState<"unpaid" | "paid">("unpaid");
//   const [openId, setOpenId] = useState<string | null>(null);

//   const filtered = useMemo(() => {
//     const q = query.toLowerCase();
//     let rows = data.filter((r) =>
//       !q ||
//       r.student.name.toLowerCase().includes(q) ||
//       r.student.email.toLowerCase().includes(q) ||
//       r.course.toLowerCase().includes(q) ||
//       r.batch.toLowerCase().includes(q) ||
//       r.campus.toLowerCase().includes(q),
//     );
//     const by: Record<typeof filter, AdmissionStatus[]> = {
//       pending: ["Pending"],
//       verified: ["Verified"],
//       blocked: ["Cancelled", "Suspended"],
//     } as const;
//     rows = rows.filter((r) => by[filter].includes(r.status));
//     return rows;
//   }, [data, query, filter]);

//   const record = data.find((r) => r.id === openId) || null;

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center gap-2">
//         <div className="text-sm font-medium">Admission Applications</div>
//         <div className="ml-auto flex items-center gap-2">
//           <Input className="max-w-xs" placeholder="Search name, course, campus…" value={query} onChange={(e) => setQuery(e.target.value)} />
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
//           New Pending
//         </Button>
//         <Button variant={filter === "verified" ? "default" : "outline"} size="sm" onClick={() => setFilter("verified")}>
//           Verified
//         </Button>
//         <Button variant={filter === "blocked" ? "default" : "outline"} size="sm" onClick={() => setFilter("blocked")}>
//           Cancelled/Suspended
//         </Button>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>App ID</TableHead>
//             <TableHead>Student</TableHead>
//             <TableHead>Course / Batch</TableHead>
//             <TableHead>Campus</TableHead>
//             <TableHead>Payment</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filtered.map((r) => (
//             <TableRow key={r.id}>
//               <TableCell>{r.id}</TableCell>
//               <TableCell>
//                 <div className="font-medium">{r.student.name}</div>
//                 <div className="text-xs text-muted-foreground">{r.student.email}</div>
//               </TableCell>
//               <TableCell>
//                 <div>{r.course}</div>
//                 <div className="text-xs text-muted-foreground">{r.batch}</div>
//               </TableCell>
//               <TableCell>{r.campus}</TableCell>
//               <TableCell>
//                 <Badge variant={paymentStatus(r) === "Overdue" ? "destructive" : paymentStatus(r) === "Paid" ? "default" : "secondary"}>
//                   {paymentStatus(r)}
//                 </Badge>
//               </TableCell>
//               <TableCell className="text-right">
//                 <Button size="sm" onClick={() => setOpenId(r.id)}>Review</Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <Sheet open={!!record} onOpenChange={(o) => !o && setOpenId(null)}>
//         <SheetContent className="w-[90vw] sm:max-w-2xl">
//           <SheetHeader>
//             <SheetTitle>Admission Details</SheetTitle>
//           </SheetHeader>
//           {record && <Details rec={record} onChange={onUpdate} />}
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// }

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import { paymentStatus } from "./types";
import type { AdmissionRecord, AdmissionStatus } from "./types";
import { Details } from "./Details";

export function ApplicationsTab({
  data,
  onUpdate,
}: {
  data: AdmissionRecord[];
  onUpdate: (rec: AdmissionRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"unpaid" | "paid">("unpaid");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let rows = data.filter((r) =>
      !q ||
      r.student.name.toLowerCase().includes(q) ||
      r.student.email.toLowerCase().includes(q) ||
      r.course.toLowerCase().includes(q) ||
      r.batch.toLowerCase().includes(q) ||
      r.campus.toLowerCase().includes(q),
    );
    const isPaid = (r: AdmissionRecord) => paymentStatus(r) === "Paid";
    rows = rows.filter((r) => (filter === "paid" ? isPaid(r) : !isPaid(r)));
    return rows;
  }, [data, query, filter]);

  const record = data.find((r) => r.id === openId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium">Admission Applications</div>
        <div className="ml-auto flex items-center gap-2">
          <Input className="max-w-xs" placeholder="Search name, course, campus…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "unpaid" ? "default" : "outline"} size="sm" onClick={() => setFilter("unpaid")}>Unpaid</Button>
        <Button variant={filter === "paid" ? "default" : "outline"} size="sm" onClick={() => setFilter("paid")}>Paid</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App ID</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Course / Batch</TableHead>
            <TableHead>Campus</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>
                <div className="font-medium">{r.student.name}</div>
                <div className="text-xs text-muted-foreground">{r.student.email}</div>
              </TableCell>
              <TableCell>
                <div>{r.course}</div>
                <div className="text-xs text-muted-foreground">{r.batch}</div>
              </TableCell>
              <TableCell>{r.campus}</TableCell>
              <TableCell>
                <Badge variant={paymentStatus(r) === "Paid" ? "default" : "secondary"}>
                  {paymentStatus(r) === "Paid" ? "Paid" : "Unpaid"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => setOpenId(r.id)}>Review</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!record} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-[90vw] sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Admission Details</SheetTitle>
          </SheetHeader>
          {record && onUpdate && <Details rec={record} onChange={onUpdate} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
