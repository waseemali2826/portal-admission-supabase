import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Download,
  Upload,
  ChevronDown,
  Phone,
  MessageSquare,
  Mail,
  Bot,
  MessageCircle,
  Footprints,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  UserPlus,
} from "lucide-react";
import { getPublicEnquiries } from "@/lib/publicStore";
import { listEnquiries } from "@/lib/publicApi";
import { getAllCourseNames } from "@/lib/courseStore";

const COUNTRIES = ["Pakistan", "India", "UAE"] as const;
const CITIES = ["Faisalabad", "Lahore", "Islamabad"] as const;
const SOURCES = [
  "Walk-In",
  "Calls",
  "Social Media",
  "Live Chat",
  "Website",
  "Referral",
  "Email Campaign",
] as const;
const CAMPUSES = ["User's Campus", "Main Campus", "City Campus"] as const;
const STAGES = [
  "Prospective",
  "Need Analysis",
  "Proposal",
  "Negotiation",
] as const;

type Enquiry = {
  id: string;
  name: string;
  course: string;
  contact: string;
  email?: string;
  city: (typeof CITIES)[number];
  source: (typeof SOURCES)[number];
  nextFollow?: string; // ISO
  stage: (typeof STAGES)[number];
  status: "Pending" | "Enrolled" | "Not Interested";
};

const BASE_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-1001",
    name: "Ahsan Khan",
    course: "Full-Stack Web Dev",
    contact: "0300-1234567",
    email: "ahsan@example.com",
    city: "Lahore",
    source: "Walk-In",
    nextFollow: "2025-02-20T11:00",
    stage: "Prospective",
    status: "Pending",
  },
  {
    id: "ENQ-1002",
    name: "Sara Ahmed",
    course: "UI/UX Design",
    contact: "0301-7654321",
    city: "Lahore",
    source: "Calls",
    nextFollow: "2025-02-19T15:30",
    stage: "Proposal",
    status: "Pending",
  },
  {
    id: "ENQ-1003",
    name: "Bilal Iqbal",
    course: "Data Science",
    contact: "0321-9988776",
    city: "Islamabad",
    source: "Social Media",
    nextFollow: "2025-02-18T12:00",
    stage: "Negotiation",
    status: "Pending",
  },
  {
    id: "ENQ-1004",
    name: "Ayesha Noor",
    course: "Digital Marketing",
    contact: "0333-1112223",
    email: "ayesha@example.com",
    city: "Faisalabad",
    source: "Website",
    nextFollow: "2025-02-18T10:00",
    stage: "Need Analysis",
    status: "Pending",
  },
];

const VIEWS = [
  "Create New Enquiry",
  "Import Bulk Enquiries",
  "Enquiry Follow-Up",
  "Status Tracking",
] as const;

type View = (typeof VIEWS)[number];

export default function Enquiries() {
  const [view, setView] = useState<View>("Create New Enquiry");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<
    "All" | (typeof STAGES)[number]
  >("All");

  const [serverPub, setServerPub] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const items = await listEnquiries();
        setServerPub(items);
      } catch {}
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const local = getPublicEnquiries();
    const norm = (p: any): Enquiry => ({
      id: p.id,
      name: p.name,
      course: p.course,
      contact: p.contact,
      email: p.email,
      city: "Lahore",
      source: "Website",
      nextFollow: p.preferredStart,
      stage: "Prospective",
      status: "Pending",
    });
    const merged: Enquiry[] = [
      ...serverPub.map(norm),
      ...local.map(norm),
      ...BASE_ENQUIRIES,
    ];
    return merged.filter(
      (e) =>
        (stageFilter === "All" || e.stage === stageFilter) &&
        (e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.course.toLowerCase().includes(q)),
    );
  }, [search, stageFilter, serverPub]);

  const todays = filtered.filter(
    (e) => e.nextFollow?.slice(0, 10) === new Date().toISOString().slice(0, 10),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enquiry Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, import, follow-up and track enquiry status
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-56 justify-between">
                {view}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Go to section</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {VIEWS.map((v) => (
                <DropdownMenuItem key={v} onClick={() => setView(v)}>
                  {v}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            placeholder="Search enquiries or ID���"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56"
          />
          <Select
            value={stageFilter}
            onValueChange={(v) => setStageFilter(v as any)}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "Create New Enquiry" && <CreateEnquiry />}
      {view === "Import Bulk Enquiries" && <ImportBulk />}
      {view === "Enquiry Follow-Up" && (
        <FollowUp enquiries={filtered} todays={todays} />
      )}
      {view === "Status Tracking" && <StatusTracking enquiries={filtered} />}
    </div>
  );
}

function CreateEnquiry() {
  const [probability, setProbability] = useState<number[]>([50]);
  const [sources, setSources] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const courses = useMemo(() => getAllCourseNames(), [version]);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener("courses:changed", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("courses:changed", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" /> Create New Enquiry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const data = Object.fromEntries(new FormData(form).entries());
            toast({
              title: "Enquiry created",
              description: `${data.name} (${data.course}) saved.`,
            });
            form.reset();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Ali Raza"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Course Interested</Label>
            <Select name="course" defaultValue={courses[0] || ""}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {courses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Primary Contact Number</Label>
            <Input
              id="phone"
              name="phone"
              required
              type="tel"
              placeholder="03xx-xxxxxxx"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <RadioGroup
              name="gender"
              defaultValue="Male"
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="g-m" value="Male" />
                <Label htmlFor="g-m">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="g-f" value="Female" />
                <Label htmlFor="g-f">Female</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select name="country" defaultValue="Pakistan">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Select name="city" defaultValue={CITIES[0]}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area">Area</Label>
            <Input id="area" name="area" placeholder="e.g., Gulshan-e-Iqbal" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="join">Possible Joining Date</Label>
            <Input id="join" name="join" type="date" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Marketing Source (select one or more)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {SOURCES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={sources.includes(s)}
                    onCheckedChange={(v) =>
                      setSources((prev) =>
                        v ? [...prev, s] : prev.filter((x) => x !== s),
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Campus</Label>
            <Select name="campus" defaultValue={CAMPUSES[0]}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="follow">Next Follow-up (Date & Time)</Label>
            <Input id="follow" name="follow" type="datetime-local" />
          </div>
          <div className="space-y-1.5">
            <Label>Probability ({probability[0]}%)</Label>
            <Slider
              min={10}
              max={100}
              step={10}
              value={probability}
              onValueChange={setProbability}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              name="remarks"
              rows={3}
              placeholder="Notes about the enquiry..."
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit">Save Enquiry</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ImportBulk() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<string[][]>([
    ["Full Name", "Course Interested", "Contact", "Email", "City", "Source"],
    [
      "Ali Raza",
      "Full-Stack Web Dev",
      "0300-1112223",
      "ali@example.com",
      "Lahore",
      "Walk-In",
    ],
    ["Hira Khan", "UI/UX Design", "0301-3334445", "", "Lahore", "Calls"],
  ]);

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed = lines.map((l) => l.split(",").map((c) => c.trim()));
    if (parsed.length) setRows(parsed);
    toast({
      title: "CSV uploaded",
      description: `${parsed.length - 1} records parsed.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" /> Import Bulk Enquiries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const header = rows[0];
              const sample = [header, ...rows.slice(1, 3)]
                .map((r) => r.join(","))
                .join("\n");
              const blob = new Blob([sample], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "sample-enquiries.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sample CSV
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) parseCSV(file);
            }}
          />
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {rows[0]?.map((h, i) => (
                  <TableHead key={i}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(1).map((r, i) => (
                <TableRow key={i}>
                  {r.map((c, j) => (
                    <TableCell key={j}>{c}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function FollowUp({
  enquiries,
  todays,
}: {
  enquiries: Enquiry[];
  todays: Enquiry[];
}) {
  const [tab, setTab] = useState("todayFollow");
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Today’s Follow Up" value={`${todays.length}`} />
        <Stat title="Today’s Enquiries" value={`${enquiries.length}`} />
        <Stat
          title="Pipeline (Pending)"
          value={`${enquiries.filter((e) => e.status === "Pending").length}`}
        />
        <Stat title="Conversion (dummy)" value={`32%`} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="todayFollow">Today’s Follow Up</TabsTrigger>
          <TabsTrigger value="todayEnquiries">Today’s Enquiries</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          {STAGES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="todayFollow">
          <FollowTable data={todays} />
        </TabsContent>
        <TabsContent value="todayEnquiries">
          <FollowTable data={enquiries} />
        </TabsContent>
        <TabsContent value="pipeline">
          <FollowTable data={enquiries.filter((e) => e.status === "Pending")} />
        </TabsContent>
        {STAGES.map((s) => (
          <TabsContent key={s} value={s}>
            <FollowTable data={enquiries.filter((e) => e.stage === s)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function FollowTable({ data }: { data: Enquiry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enquiries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enquiry</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.name}{" "}
                    <span className="text-muted-foreground">• {e.id}</span>
                  </TableCell>
                  <TableCell>{e.course}</TableCell>
                  <TableCell>{e.city}</TableCell>
                  <TableCell>{e.source}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.stage}</Badge>
                  </TableCell>
                  <TableCell>{e.nextFollow?.replace("T", " ")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Follow-Up Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Contact</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: `Calling ${e.contact}` })
                          }
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Voice Call
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: `SMS to ${e.contact}` })
                          }
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Text Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: `Email to ${e.email || "N/A"}` })
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast({ title: `Live Chat started` })}
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          Live Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: `WhatsApp to ${e.contact}` })
                          }
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast({ title: `Walk-In scheduled` })}
                        >
                          <Footprints className="h-4 w-4 mr-2" />
                          Walk-In
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({ title: `Transferred enquiry ${e.id}` })
                          }
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transfer Enquiry
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Outcome</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({
                              title: `Enroll Now`,
                              description: `Open admission form for ${e.name}`,
                            })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Enroll Now
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const reason =
                              prompt("Reason for not interested?") || "";
                            toast({
                              title: `Marked Not Interested`,
                              description: reason || "No reason specified",
                            });
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Not Interested
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusTracking({ enquiries }: { enquiries: Enquiry[] }) {
  const enrolled = enquiries.filter((e) => e.status === "Enrolled");
  const notInterested = enquiries.filter((e) => e.status === "Not Interested");
  const pending = enquiries.filter((e) => e.status === "Pending");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat title="Successfully Enrolled" value={`${enrolled.length}`} />
        <Stat title="Not Interested" value={`${notInterested.length}`} />
        <Stat title="Pending" value={`${pending.length}`} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detailed Status (Category-wise)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enquiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Last Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.name}{" "}
                      <span className="text-muted-foreground">• {e.id}</span>
                    </TableCell>
                    <TableCell>
                      {e.status === "Enrolled" ? (
                        <Badge>Successfully Enrolled</Badge>
                      ) : e.status === "Not Interested" ? (
                        <Badge variant="destructive">Not Interested</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>{e.stage}</TableCell>
                    <TableCell>{e.source}</TableCell>
                    <TableCell className="text-right">
                      {e.nextFollow?.replace("T", " ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
