import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import type { StudentRecord } from "./students/types";
import { studentsMock } from "./students/data";
import { Directory } from "./students/Directory";
import { AttendanceTab } from "./students/Attendance";
import { StatusTab } from "./students/Status";
import { StudentsReports } from "./students/Reports";
import { getStudents, upsertStudent } from "@/lib/studentStore";

export default function Students() {
  const [items, setItems] = useState<StudentRecord[]>(() => {
    const stored = getStudents();
    const map = new Map<string, StudentRecord>();
    for (const s of studentsMock) map.set(s.id, s);
    for (const s of stored) map.set(s.id, s); // stored overrides
    return Array.from(map.values());
  });

  const upsert = (next: StudentRecord) => {
    upsertStudent(next);
    setItems((prev) => {
      const map = new Map<string, StudentRecord>();
      for (const s of prev) map.set(s.id, s);
      map.set(next.id, next);
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    const refresh = () => {
      const stored = getStudents();
      const map = new Map<string, StudentRecord>();
      for (const s of studentsMock) map.set(s.id, s);
      for (const s of stored) map.set(s.id, s);
      setItems(Array.from(map.values()));
    };
    window.addEventListener("students:changed", refresh as EventListener);
    window.addEventListener("storage", refresh as EventListener);
    return () => {
      window.removeEventListener("students:changed", refresh as EventListener);
      window.removeEventListener("storage", refresh as EventListener);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Directory, actions, attendance, status tracking, and reports.
        </p>
      </div>
      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <Directory data={items} onChange={upsert} />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTab data={items} onChange={upsert} />
        </TabsContent>
        <TabsContent value="status">
          <StatusTab data={items} />
        </TabsContent>
        <TabsContent value="reports">
          <StudentsReports data={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
