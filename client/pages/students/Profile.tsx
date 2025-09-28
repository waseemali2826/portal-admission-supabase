import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudentRecord } from "./types";
import {
  ensureAttendance,
  markInstallmentPaid,
  nextUnpaidInstallment,
  paymentStatus,
} from "./types";

export function Profile({
  student,
  onChange,
}: {
  student: StudentRecord;
  onChange: (next: StudentRecord) => void;
}) {
  const { toast } = useToast();
  const [batch, setBatch] = useState(student.admission.batch);
  const [campus, setCampus] = useState(student.admission.campus);
  const CITY_OPTIONS = ["Faisalabad", "Lahore", "Islamabad"] as const;
  const campusOptions = Array.from(
    new Set([student.admission.campus, ...CITY_OPTIONS]),
  );
  const [newCourse, setNewCourse] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  const collectFee = () => {
    const inst = nextUnpaidInstallment(student);
    if (!inst) return toast({ title: "All installments paid" });
    const next = markInstallmentPaid(student, inst.id);
    onChange(next);
    toast({ title: `Collected ₨${inst.amount.toLocaleString()} (${inst.id})` });
  };

  const transferBatch = () => {
    onChange({ ...student, admission: { ...student.admission, batch } });
    toast({ title: "Batch transferred" });
  };

  const transferCampus = () => {
    onChange({ ...student, admission: { ...student.admission, campus } });
    toast({ title: "Campus transferred" });
  };

  const enrollCourse = () => {
    if (!newCourse.trim()) return;
    const courses = Array.from(
      new Set([...(student.enrolledCourses || []), newCourse.trim()]),
    );
    onChange({ ...student, enrolledCourses: courses });
    setNewCourse("");
    toast({ title: "Enrolled in another course" });
  };

  const freeze = () => onChange({ ...student, status: "Freeze" });
  const resume = () => onChange({ ...student, status: "Current" });
  const suspend = () => onChange({ ...student, status: "Suspended" });
  const conclude = () => onChange({ ...student, status: "Alumni" });
  const dropout = () => onChange({ ...student, status: "Not Completed" });

  const markAttendance = (present: boolean) => {
    onChange(ensureAttendance(student, date, present));
    toast({ title: present ? "Marked Present" : "Marked Absent" });
  };

  const requestCertificate = () => {
    toast({ title: "Certificate approval requested" });
  };

  const notify = (chan: "SMS" | "Email" | "WhatsApp") => {
    onChange({
      ...student,
      communications: [
        {
          id: `m-${Date.now()}`,
          channel: chan,
          message: `Admin message via ${chan}`,
          at: new Date().toISOString(),
        },
        ...student.communications,
      ],
    });
    toast({ title: `${chan} sent` });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">{student.name}</div>
        <div className="text-xs text-muted-foreground">
          {student.email} • {student.phone}
        </div>
        <div className="pt-2 flex items-center gap-2">
          <Badge>{student.status}</Badge>
          <Badge
            variant={
              paymentStatus(student) === "Overdue"
                ? "destructive"
                : paymentStatus(student) === "Paid"
                  ? "default"
                  : "secondary"
            }
          >
            {paymentStatus(student)}
          </Badge>
        </div>
      </div>
      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Admission Details</div>
          <div className="font-medium">{student.admission.course}</div>
          <div className="text-xs text-muted-foreground">
            Batch: {student.admission.batch} • Campus:{" "}
            {student.admission.campus}
          </div>
          <div className="text-xs">
            Date: {new Date(student.admission.date).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Fee Structure</div>
          <div className="text-xs">
            Total: ₨{student.fee.total.toLocaleString()}
          </div>
          <div className="rounded border p-2 text-xs space-y-1">
            {student.fee.installments.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>
                  {i.id} • ₨{i.amount.toLocaleString()} • Due{" "}
                  {new Date(i.dueDate).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">
                  {i.paidAt
                    ? `Paid ${new Date(i.paidAt).toLocaleDateString()}`
                    : "Unpaid"}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button size="sm" onClick={collectFee}>
              Collect Fee Installment
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Transfers</div>
          <Label>Batch</Label>
          <Input value={batch} onChange={(e) => setBatch(e.target.value)} />
          <Button variant="outline" onClick={transferBatch}>
            Transfer Batch
          </Button>
          <Label>Campus</Label>
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {campusOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={transferCampus}>
            Transfer Campus
          </Button>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Cross-enrollment</div>
          <Label>New Course</Label>
          <Input
            placeholder="Course"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />
          <Button variant="outline" onClick={enrollCourse}>
            Enroll
          </Button>
          <div className="text-xs text-muted-foreground">
            Enrolled: {(student.enrolledCourses || []).join(", ") || "-"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Documents</div>
        <div className="space-y-1 text-sm">
          {student.documents.map((d, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <a
                href={d.url}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {d.name}
              </a>
              <div className="space-x-2">
                <Badge variant={d.verified ? "default" : "secondary"}>
                  {d.verified ? "Verified" : "Pending"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onChange({
                      ...student,
                      documents: student.documents.map((x, i) =>
                        i === idx ? { ...x, verified: !x.verified } : x,
                      ),
                    })
                  }
                >
                  Toggle Verify
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Mark Attendance</div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="space-x-2">
            <Button size="sm" onClick={() => markAttendance(true)}>
              Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAttendance(false)}
            >
              Absent
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Communications</div>
          <div className="space-x-2">
            <Button size="sm" variant="outline" onClick={() => notify("SMS")}>
              Send SMS
            </Button>
            <Button size="sm" variant="outline" onClick={() => notify("Email")}>
              Send Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => notify("WhatsApp")}
            >
              Send WhatsApp
            </Button>
          </div>
          <div className="rounded border p-2 text-xs space-y-1 max-h-40 overflow-auto">
            {student.communications.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span>
                  {c.channel} • {new Date(c.at).toLocaleString()}
                </span>
                <span className="text-muted-foreground">{c.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex flex-wrap gap-2">
        <Button onClick={freeze}>Course Freeze</Button>
        <Button variant="outline" onClick={resume}>
          Resume
        </Button>
        <Button variant="outline" onClick={suspend}>
          Suspend
        </Button>
        <Button variant="outline" onClick={conclude}>
          Conclude (Alumni)
        </Button>
        <Button variant="destructive" onClick={dropout}>
          Not Completed
        </Button>
        <Button variant="outline" onClick={requestCertificate}>
          Request Certificate Approval
        </Button>
      </div>
    </div>
  );
}
