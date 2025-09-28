import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMemo, useState } from "react";
import type { StudentRecord, StudentStatus } from "./types";
import { paymentStatus } from "./types";
import { Profile } from "./Profile";
import { COURSES } from "@/data/courses";
import { getStoredCourses } from "@/lib/courseStore";

const statuses: StudentStatus[] = [
  "Current",
  "Freeze",
  "Concluded",
  "Not Completed",
  "Suspended",
  "Alumni",
];

export function Directory({
  data,
  onChange,
}: {
  data: StudentRecord[];
  onChange: (rec: StudentRecord) => void;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [batch, setBatch] = useState<string>("");
  const [campus, setCampus] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const courses = useMemo(() => {
    const fromData = data.map((d) => d.admission.course);
    const base = COURSES.map((c) => c.name);
    const stored = getStoredCourses().map((c) => c.name);
    return Array.from(new Set([...fromData, ...base, ...stored])).sort();
  }, [data]);
  const batches = Array.from(
    new Set(data.map((d) => d.admission.batch)),
  ).sort();
  const campuses = Array.from(
    new Set(data.map((d) => d.admission.campus)),
  ).sort();

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter(
      (d) =>
        (!s ||
          d.name.toLowerCase().includes(s) ||
          d.id.toLowerCase().includes(s) ||
          d.admission.course.toLowerCase().includes(s)) &&
        (!status || d.status === status) &&
        (!course || d.admission.course === course) &&
        (!batch || d.admission.batch === batch) &&
        (!campus || d.admission.campus === campus),
    );
  }, [data, q, status, course, batch, campus]);

  const rec = data.find((d) => d.id === openId) || null;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          placeholder="Search by name, ID, course…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v === "__all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={course}
          onValueChange={(v) => setCourse(v === "__all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={batch}
          onValueChange={(v) => setBatch(v === "__all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Batches</SelectItem>
            {batches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={campus}
          onValueChange={(v) => setCampus(v === "__all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Campuses</SelectItem>
            {campuses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setQ("");
            setStatus("");
            setCourse("");
            setBatch("");
            setCampus("");
          }}
        >
          Reset
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course / Batch</TableHead>
            <TableHead>Campus</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.id}</div>
              </TableCell>
              <TableCell>
                <div>{s.admission.course}</div>
                <div className="text-xs text-muted-foreground">
                  {s.admission.batch}
                </div>
              </TableCell>
              <TableCell>{s.admission.campus}</TableCell>
              <TableCell>
                <Badge>{s.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    paymentStatus(s) === "Overdue"
                      ? "destructive"
                      : paymentStatus(s) === "Paid"
                        ? "default"
                        : "secondary"
                  }
                >
                  {paymentStatus(s)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => setOpenId(s.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!rec} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-[90vw] sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
          </SheetHeader>
          {rec && <Profile student={rec} onChange={onChange} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
