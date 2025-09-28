// import { useEffect, useState, FormEvent } from "react";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { COURSES } from "@/data/courses";
// import { addPublicApplication, addPublicEnquiry } from "@/lib/publicStore";
// import { createApplication, createEnquiry } from "@/lib/publicApi";
// import { getStoredCourses } from "@/lib/courseStore";
// import { addStudent } from "@/lib/studentStore";

// export default function AdmissionForm() {
//   const { toast } = useToast();

//   const [courseOptions, setCourseOptions] = useState<
//     { id: string; name: string }[]
//   >(() => {
//     const base = COURSES.map((c) => ({ id: c.id, name: c.name }));
//     try {
//       const stored = getStoredCourses().map((c) => ({
//         id: c.id,
//         name: c.name,
//       }));
//       const m = new Map<string, { id: string; name: string }>();
//       [...base, ...stored].forEach((it) => {
//         if (!m.has(it.name)) m.set(it.name, it);
//       });
//       return Array.from(m.values());
//     } catch {
//       return base;
//     }
//   });

//   const params = new URLSearchParams(location.search);
//   const preCourse =
//     params.get("course") || (courseOptions[0]?.name ?? COURSES[0].name);

//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [course, setCourse] = useState(preCourse);
//   const [startDate, setStartDate] = useState("");
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     // keep URL param selection in state if query changes
//     const c = new URLSearchParams(location.search).get("course");
//     if (c) setCourse(c);
//   }, [location.search]);

//   useEffect(() => {
//     const update = () => {
//       const base = COURSES.map((c) => ({ id: c.id, name: c.name }));
//       const stored = getStoredCourses().map((c) => ({
//         id: c.id,
//         name: c.name,
//       }));
//       const m = new Map<string, { id: string; name: string }>();
//       [...base, ...stored].forEach((it) => {
//         if (!m.has(it.name)) m.set(it.name, it);
//       });
//       const next = Array.from(m.values());
//       setCourseOptions(next);
//       if (!next.find((o) => o.name === course)) {
//         setCourse(next[0]?.name ?? "");
//       }
//     };
//     window.addEventListener("courses:changed", update as EventListener);
//     window.addEventListener("storage", update as EventListener);
//     return () => {
//       window.removeEventListener("courses:changed", update as EventListener);
//       window.removeEventListener("storage", update as EventListener);
//     };
//   }, [course]);

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     await new Promise((r) => setTimeout(r, 300));

//     try {
//       await Promise.all([
//         createEnquiry({
//           name: fullName,
//           course,
//           contact: phone,
//           email,
//           preferredStart: startDate,
//         }),
//         createApplication({
//           name: fullName,
//           email,
//           phone,
//           course,
//           preferredStart: startDate,
//         }),
//       ]);
//     } catch {
//       // Fallback to local storage if server not reachable
//       addPublicEnquiry({
//         name: fullName,
//         course,
//         contact: phone,
//         email,
//         preferredStart: startDate,
//       });
//       addPublicApplication({
//         name: fullName,
//         email,
//         phone,
//         course,
//         preferredStart: startDate,
//       });
//     }

//     addStudent({
//       name: fullName,
//       email,
//       phone,
//       course,
//       preferredStart: startDate,
//     });

//     setSubmitting(false);
//     toast({
//       title: "Application submitted",
//       description: "Admin panel me record add ho gaya hai.",
//     });
//     setFullName("");
//     setEmail("");
//     setPhone("");
//     setCourse(courseOptions[0]?.name ?? COURSES[0].name);
//     setStartDate("");
//     setMessage("");
//   };

//   return (
//     <div className="mx-auto w-full max-w-xl">
//       <h2 className="text-2xl font-bold">Admission Form</h2>
//       <p className="mt-1 text-sm text-muted-foreground">
//         Student Name, Email, Phone, Course select, Starting Date preference.
//       </p>
//       <form className="mt-6 space-y-4" onSubmit={onSubmit}>
//         <div className="space-y-1.5">
//           <Label htmlFor="fullName">Student Name</Label>
//           <Input
//             id="fullName"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             required
//           />
//         </div>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="space-y-1.5">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-1.5">
//             <Label htmlFor="phone">Phone</Label>
//             <Input
//               id="phone"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               required
//             />
//           </div>
//         </div>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="space-y-1.5">
//             <Label htmlFor="course">Select Course</Label>
//             <select
//               id="course"
//               className="h-10 w-full rounded-md border bg-background px-3 text-sm"
//               value={course}
//               onChange={(e) => setCourse(e.target.value)}
//             >
//               {courseOptions.map((c) => (
//                 <option key={c.id} value={c.name}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="space-y-1.5">
//             <Label htmlFor="start">Starting Date Preference</Label>
//             <Input
//               id="start"
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className="space-y-1.5">
//           <Label htmlFor="message">Message (optional)</Label>
//           <Textarea
//             id="message"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Any notes or questions"
//           />
//         </div>
//         <Button type="submit" disabled={submitting} className="w-full">
//           {submitting ? "Submitting…" : "Submit"}
//         </Button>
//       </form>
//     </div>
//   );
// }


// import { useState, FormEvent } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/lib/supabaseClient";
// import { COURSES } from "@/data/courses";
// import { useNavigate } from "react-router-dom";

// export default function AdmissionForm() {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [course, setCourse] = useState(COURSES[0]?.name || "");
//   const [startDate, setStartDate] = useState("");
//   const [message, setMessage] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [voucher, setVoucher] = useState<null | {
//     id: string;
//     amount: number;
//     course: string;
//   }>(null);

//   const courseFee = (name: string) => COURSES.find((c) => c.name === name)?.fees || 0;

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const amount = courseFee(course);

//     const { error } = await supabase.from("applications").insert([
//       {
//         name: fullName,
//         email,
//         phone,
//         course,
//         start_date: startDate || null,
//         message: message || null,
//         batch: "TBD",
//         campus: "Main",
//         fee_total: amount,
//         fee_installments: [{ id: "V1", amount, dueDate: new Date().toISOString() }],
//         documents: [],
//       },
//     ]);

//     setSubmitting(false);

//     if (error) {
//       toast({ title: "Error", description: error.message });
//       return;
//     }

//     setVoucher({ id: `VCH-${Date.now()}`, amount, course });
//     toast({ title: "Fee voucher generated", description: `Amount ₨ ${amount.toLocaleString()}` });
//   };

//   async function markPaid() {
//     if (!voucher) return;
//     const studentId = `STU-${Date.now()}`;
//     const record = {
//       id: studentId,
//       record: {
//         id: studentId,
//         name: fullName,
//         email,
//         phone,
//         status: "Current",
//         admission: {
//           course,
//           batch: "UNASSIGNED",
//           campus: "Main",
//           date: new Date().toISOString(),
//         },
//         fee: {
//           total: voucher.amount,
//           installments: [
//             {
//               id: "V1",
//               amount: voucher.amount,
//               dueDate: new Date().toISOString(),
//               paidAt: new Date().toISOString(),
//             },
//           ],
//         },
//         attendance: [],
//         documents: [],
//         communications: [],
//       },
//     } as any;
//     try {
//       const { error } = await supabase
//         .from("students")
//         .upsert(record, { onConflict: "id" });
//       if (error) throw error;
//     } catch {
//       try {
//         const { upsertStudent } = await import("@/lib/studentStore");
//         upsertStudent(record.record);
//       } catch {}
//     }
//     toast({ title: "Fee received", description: "Student added to directory." });
//     navigate("/dashboard/students");
//   }

//   function printVoucher(v: { id: string; amount: number; course: string }, name: string) {
//     const w = window.open("", "_blank");
//     if (!w) return;
//     const html = `<!doctype html><html><head><meta charset='utf-8'><title>Voucher ${v.id}</title>
//       <style>body{font-family:ui-sans-serif,system-ui;line-height:1.5;padding:24px}h1{font-size:18px;margin:0 0 8px}table{border-collapse:collapse;width:100%}td{padding:6px 8px;border:1px solid #e5e7eb}</style>
//       </head><body>
//       <h1>Fee Voucher</h1>
//       <table><tr><td>Voucher #</td><td>${v.id}</td></tr>
//       <tr><td>Student</td><td>${name}</td></tr>
//       <tr><td>Course</td><td>${v.course}</td></tr>
//       <tr><td>Amount</td><td>₨ ${v.amount.toLocaleString()}</td></tr></table>
//       <script>window.print()<\/script></body></html>`;
//     w.document.write(html);
//     w.document.close();
//   }

//   return (
//     <div className="mx-auto w-full max-w-xl">
//       <h2 className="text-2xl font-bold">Admission Form</h2>
//       {!voucher ? (
//         <form className="mt-6 space-y-4" onSubmit={onSubmit}>
//           <div>
//             <Label htmlFor="fullName">Student Name</Label>
//             <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
//           </div>
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//           </div>
//           <div>
//             <Label htmlFor="phone">Phone</Label>
//             <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
//           </div>
//           <div>
//             <Label htmlFor="course">Select Course</Label>
//             <select id="course" className="w-full rounded-md border px-3 py-2" value={course} onChange={(e) => setCourse(e.target.value)}>
//               {COURSES.map((c) => (
//                 <option key={c.id} value={c.name}>
//                   {c.name} — ₨ {c.fees.toLocaleString()}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <Label htmlFor="start">Starting Date Preference</Label>
//             <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//           </div>
//           <div>
//             <Label htmlFor="message">Message (optional)</Label>
//             <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
//           </div>
//           <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Generate Fee Voucher"}</Button>
//         </form>
//       ) : (
//         <div className="mt-6 space-y-4 rounded-md border p-4">
//           <div className="text-lg font-semibold">Fee Voucher</div>
//           <div className="text-sm text-muted-foreground">Voucher #: {voucher.id}</div>
//           <div className="text-sm">Student: {fullName}</div>
//           <div className="text-sm">Course: {voucher.course}</div>
//           <div className="text-sm">Amount: ₨ {voucher.amount.toLocaleString()}</div>
//           <div className="flex gap-2 pt-2">
//             <Button onClick={markPaid}>Mark Fee as Paid</Button>
//             <Button variant="outline" onClick={() => setVoucher(null)}>Edit Details</Button>
//             <Button variant="outline" onClick={() => printVoucher(voucher, fullName)}>Print Voucher</Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// Same Course type as in admin panel
type Course = {
  id: string;
  name: string;
  category: "Development" | "Design" | "Data" | "Marketing";
  duration: string;
  fees: number;
  description?: string;
  featured: boolean;
  status: "live" | "upcoming";
  start_date?: string | null;
  created_at: string;
};

export default function AdmissionForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voucher, setVoucher] = useState<null | { id: string; amount: number; course: string }>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses dynamically from Supabase
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from<Course, Course>("courses")
      .select("*")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error.message);
    } else if (data?.length) {
      setCourses(data);
      setCourse(data[0].name); // set first course as default
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const courseFee = (name: string) => courses.find((c) => c.name === name)?.fees || 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const amount = courseFee(course);

    const { error } = await supabase.from("applications").insert([
      {
        name: fullName,
        email,
        phone,
        course,
        start_date: startDate || null,
        message: message || null,
        batch: "TBD",
        campus: "Main",
        fee_total: amount,
        fee_installments: [{ id: "V1", amount, dueDate: new Date().toISOString() }],
        documents: [],
      },
    ]);

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    setVoucher({ id: `VCH-${Date.now()}`, amount, course });
    toast({ title: "Fee voucher generated", description: `Amount ₨ ${amount.toLocaleString()}` });
  };

  async function markPaid() {
    if (!voucher) return;
    const studentId = `STU-${Date.now()}`;
    const record = {
      id: studentId,
      record: {
        id: studentId,
        name: fullName,
        email,
        phone,
        status: "Current",
        admission: {
          course,
          batch: "UNASSIGNED",
          campus: "Main",
          date: new Date().toISOString(),
        },
        fee: {
          total: voucher.amount,
          installments: [
            { id: "V1", amount: voucher.amount, dueDate: new Date().toISOString(), paidAt: new Date().toISOString() },
          ],
        },
        attendance: [],
        documents: [],
        communications: [],
      },
    } as any;

    try {
      const { error } = await supabase.from("students").upsert(record, { onConflict: "id" });
      if (error) throw error;
    } catch {
      try {
        const { upsertStudent } = await import("@/lib/studentStore");
        upsertStudent(record.record);
      } catch {}
    }

    toast({ title: "Fee received", description: "Student added to directory." });
    navigate("/dashboard/students");
  }

  function printVoucher(v: { id: string; amount: number; course: string }, name: string) {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>Voucher ${v.id}</title>
      <style>body{font-family:ui-sans-serif,system-ui;line-height:1.5;padding:24px}h1{font-size:18px;margin:0 0 8px}table{border-collapse:collapse;width:100%}td{padding:6px 8px;border:1px solid #e5e7eb}</style>
      </head><body>
      <h1>Fee Voucher</h1>
      <table><tr><td>Voucher #</td><td>${v.id}</td></tr>
      <tr><td>Student</td><td>${name}</td></tr>
      <tr><td>Course</td><td>${v.course}</td></tr>
      <tr><td>Amount</td><td>₨ ${v.amount.toLocaleString()}</td></tr></table>
      <script>window.print()<\/script></body></html>`;
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h2 className="text-2xl font-bold">Admission Form</h2>
      {!voucher ? (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="fullName">Student Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="course">Select Course</Label>
            <select
              id="course"
              className="w-full rounded-md border px-3 py-2"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} — ₨ {c.fees.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="start">Starting Date Preference</Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Generate Fee Voucher"}
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-4 rounded-md border p-4">
          <div className="text-lg font-semibold">Fee Voucher</div>
          <div className="text-sm text-muted-foreground">Voucher #: {voucher.id}</div>
          <div className="text-sm">Student: {fullName}</div>
          <div className="text-sm">Course: {voucher.course}</div>
          <div className="text-sm">Amount: ₨ {voucher.amount.toLocaleString()}</div>
          <div className="flex gap-2 pt-2">
            <Button onClick={markPaid}>Mark Fee as Paid</Button>
            <Button variant="outline" onClick={() => setVoucher(null)}>Edit Details</Button>
            <Button variant="outline" onClick={() => printVoucher(voucher, fullName)}>Print Voucher</Button>
          </div>
        </div>
      )}
    </div>
  );
}
