import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Banknote,
  Users2,
  BookOpen,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
  ClipboardCheck,
  CalendarClock,
  Award,
  Building2,
  Briefcase,
  UserCog,
  PartyPopper,
  Wallet,
  BarChart2,
} from "lucide-react";
import { getStoredCourses } from "@/lib/courseStore";
import { supabase } from "@/lib/supabaseClient";


type Course = {
  name: string;
  duration: string;
  fees: number;
  students: number;
};
const seedCourses: Course[] = [
  { name: "Full-Stack", duration: "6 mo", fees: 60000, students: 32 },
  { name: "UI/UX", duration: "4 mo", fees: 45000, students: 18 },
  { name: "Data Science", duration: "8 mo", fees: 80000, students: 12 },
  { name: "Digital Marketing", duration: "3 mo", fees: 40000, students: 22 },
];



export default function Index() {
  const [coursesVersion, setCoursesVersion] = useState(0);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [applicationsPendingCount, setApplicationsPendingCount] = useState(0);

  useEffect(() => {
    const onChange = () => setCoursesVersion((v) => v + 1);
    window.addEventListener("courses:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("courses:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const liveCourses = useMemo(() => {
    const base: Course[] = seedCourses.map((c) => ({ ...c }));
    try {
      const stored = getStoredCourses();
      const names = new Set(base.map((c) => c.name));
      for (const sc of stored) {
        if (!names.has(sc.name)) {
          base.push({
            name: sc.name,
            duration: sc.duration,
            fees: sc.fees,
            students: 0,
          });
        }
      }
    } catch {}
    return base;
  }, [coursesVersion]);

  useEffect(() => {
    (async () => {
      try {
        const { data, count } = await supabase
          .from("enquiries")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentEnquiries(data || []);
        setEnquiriesCount(count || 0);
      } catch {}
      try {
        const { count } = await supabase
          .from("applications")
          .select("*", { count: "exact" })
          .eq("status", "Pending");
        setApplicationsPendingCount(count || 0);
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of students, courses, fees and enquiries
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admission-form">
            <Button className="gap-1">
              <ArrowUpRight className="h-4 w-4" /> New Admission
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI title="Total Enquiries" value={`${enquiriesCount}`} icon={<ClipboardCheck className="h-5 w-5" />} />
        <KPI title="Pending Applications" value={`${applicationsPendingCount}`} icon={<Users2 className="h-5 w-5" />} />
      </div>


      <div className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.contact || e.phone}</TableCell>
                      <TableCell>{e.course}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={e.status === "Pending" ? "secondary" : "default"}>
                          {e.status || "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Management Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {/* Owner sees everything; limited sees only Admissions, Students, Enquiries */}
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/roles"
              title="User Roles"
              subtitle="Manage permissions"
              icon={<ShieldCheck className="h-5 w-5" />}
              stat="3 roles"
            />
          </RoleShow>
          <FeatureCard
            to="/dashboard/admissions"
            title="Admissions"
            subtitle="Convert & enroll"
            icon={<ClipboardCheck className="h-5 w-5" />}
            stat={`${applicationsPendingCount}`}
          />
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/batches"
              title="Batch & Time Table"
              subtitle="Schedules"
              icon={<CalendarClock className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/certificates"
              title="Certificates"
              subtitle="Issue & verify"
              icon={<Award className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/campuses"
              title="Campuses"
              subtitle="Locations"
              icon={<Building2 className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/employees"
              title="Employees"
              subtitle="Team"
              icon={<Briefcase className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/users"
              title="Users"
              subtitle="Accounts"
              icon={<UserCog className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/events"
              title="Events"
              subtitle="Activities"
              icon={<PartyPopper className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/expenses"
              title="Expenses"
              subtitle="Spending"
              icon={<Wallet className="h-5 w-5" />}
            />
          </RoleShow>
          <RoleShow owner>
            <FeatureCard
              to="/dashboard/reports"
              title="Reports"
              subtitle="Analytics"
              icon={<BarChart2 className="h-5 w-5" />}
              stat="All"
            />
          </RoleShow>
          {/* Ensure Students and Enquiries are present for limited */}
          <FeatureCard
            to="/dashboard/students"
            title="Students"
            subtitle="Directory"
            icon={<Users2 className="h-5 w-5" />}
            stat={`${totalStudents}`}
          />
          <FeatureCard
            to="/dashboard/enquiries"
            title="Enquiries"
            subtitle="Leads"
            icon={<ClipboardCheck className="h-5 w-5" />}
            stat={`${enquiriesCount}`}
          />
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
function FeatureCard({
  to,
  title,
  subtitle,
  icon,
  stat,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stat?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">{stat || "—"}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div className="pt-3">
          <Link to={to}>
            <Button size="sm" variant="outline">
              Open
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleShow({
  children,
  owner = false,
}: {
  children: React.ReactNode;
  owner?: boolean;
}) {
  const { role } = useAuth();
  if (owner) return role === "owner" ? <>{children}</> : null;
  return role !== "owner" ? <>{children}</> : null;
}

function KPI({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
