import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import type { StudentRecord } from "./types";
import { ensureAttendance } from "./types";

export function AttendanceTab({
  data,
  onChange,
}: {
  data: StudentRecord[];
  onChange: (rec: StudentRecord) => void;
}) {
  const batches = Array.from(new Set(data.map((d) => d.admission.batch))).sort();
  const [batch, setBatch] = useState<string>(batches[0] || "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!batch && batches.length) setBatch(batches[0]);
  }, [batches, batch]);

  const roster = useMemo(() => data.filter((d) => d.admission.batch === batch), [data, batch]);

  const presentMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of roster) {
      const a = s.attendance.find((x) => x.date === date);
      m.set(s.id, !!a?.present);
    }
    return m;
  }, [roster, date]);

  const toggle = (id: string, value: boolean) => {
    const stu = data.find((d) => d.id === id);
    if (!stu) return;
    onChange(ensureAttendance(stu, date, value));
  };

  const exportCSV = () => {
    const headers = ["Student ID", "Name", "Batch", "Date", "Present"];
    const rows = roster.map((s) => [s.id, s.name, s.admission.batch, date, String(presentMap.get(s.id) || false)]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${batch}-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
      const [sid, _name, _batch, d, pres] = lines[i].split(",");
      const stu = data.find((x) => x.id === sid);
      if (stu && d) onChange(ensureAttendance(stu, d, pres.trim().toLowerCase() === "true"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <Select value={batch} onValueChange={setBatch}>
          <SelectTrigger><SelectValue placeholder="Batch" /></SelectTrigger>
          <SelectContent>
            {batches.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>Export</Button>
          <label className="inline-flex items-center gap-2 text-sm">
            <span>Import</span>
            <input type="file" accept=".csv" onChange={(e) => e.target.files && e.target.files[0] && importCSV(e.target.files[0])} />
          </label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Present</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.id}</div>
              </TableCell>
              <TableCell className="text-right">
                <Checkbox checked={!!presentMap.get(s.id)} onCheckedChange={(v) => toggle(s.id, !!v)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
