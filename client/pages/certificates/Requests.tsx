import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { CERTIFICATE_TYPES, REQUEST_KINDS, RequestKind } from "./types";
import type { CertificateRequest } from "./types";
import { genId } from "./data";

export function RequestsTab({
  data,
  onCreate,
}: {
  data: CertificateRequest[];
  onCreate: (req: CertificateRequest) => void;
}) {
  const { toast } = useToast();
  const [kind, setKind] = useState<RequestKind>("student");
  const [student, setStudent] = useState({ id: "", name: "" });
  const [batch, setBatch] = useState("");
  const [course, setCourse] = useState("");
  const [type, setType] = useState(CERTIFICATE_TYPES[0]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(
      (r) =>
        r.studentId.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.batch.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q) ||
        r.campus.toLowerCase().includes(q),
    );
  }, [data, query]);

  const submit = () => {
    let newReq: CertificateRequest | null = null;
    if (kind === "student") {
      if (!student.id && !student.name) return toast({ title: "Enter Student ID or Name" });
      newReq = {
        id: genId(),
        studentId: student.id || "NA",
        studentName: student.name || "Unknown",
        course: course || "General",
        batch: batch || "NA",
        campus: "Main",
        type,
        status: "Pending Approval",
        requestedAt: new Date().toISOString(),
      };
    } else if (kind === "batch") {
      if (!batch) return toast({ title: "Select a batch" });
      newReq = {
        id: genId(),
        studentId: "BATCH",
        studentName: "All Students",
        course: course || "General",
        batch,
        campus: "Main",
        type,
        status: "Pending Approval",
        requestedAt: new Date().toISOString(),
      };
    } else if (kind === "completion") {
      if (!course) return toast({ title: "Select a course" });
      newReq = {
        id: genId(),
        studentId: "AUTO",
        studentName: "Eligible Students",
        course,
        batch: batch || "NA",
        campus: "Main",
        type,
        status: "Pending Approval",
        requestedAt: new Date().toISOString(),
      };
    } else if (kind === "online") {
      newReq = {
        id: genId(),
        studentId: student.id || "ONLINE",
        studentName: student.name || "Portal Submission",
        course: course || "General",
        batch: batch || "NA",
        campus: "Main",
        type,
        status: "Pending Approval",
        requestedAt: new Date().toISOString(),
      };
    }

    if (newReq) {
      onCreate(newReq);
      toast({ title: "Request submitted" });
      setStudent({ id: "", name: "" });
      setBatch("");
      setCourse("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="mb-3 text-sm font-medium">Create Request</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Request Type</Label>
            <Select value={kind} onValueChange={(v: RequestKind) => setKind(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Certificate Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Batch</Label>
            <Input placeholder="e.g., FSWD-2024A" value={batch} onChange={(e) => setBatch(e.target.value)} />
          </div>
          <div>
            <Label>Course</Label>
            <Input placeholder="e.g., Data Science" value={course} onChange={(e) => setCourse(e.target.value)} />
          </div>
          {kind === "student" || kind === "online" ? (
            <>
              <div>
                <Label>Student ID</Label>
                <Input placeholder="e.g., STU-0001" value={student.id} onChange={(e) => setStudent({ ...student, id: e.target.value })} />
              </div>
              <div>
                <Label>Student Name</Label>
                <Input placeholder="e.g., Aarav Sharma" value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })} />
              </div>
            </>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <Button onClick={submit}>Submit Request</Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">All Requests</div>
        <Input className="max-w-xs" placeholder="Search student, batch, course…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Course / Batch</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Requested</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>
                <div className="font-medium">{r.studentName}</div>
                <div className="text-xs text-muted-foreground">{r.studentId}</div>
              </TableCell>
              <TableCell>
                <div>{r.course}</div>
                <div className="text-xs text-muted-foreground">{r.batch}</div>
              </TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell className="text-right text-xs">{new Date(r.requestedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
