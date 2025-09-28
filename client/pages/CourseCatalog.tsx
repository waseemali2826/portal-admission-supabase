import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COURSES } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { getStoredCourses } from "@/lib/courseStore";

export default function CourseCatalog() {
  const list = useMemo(() => {
    const stored = getStoredCourses();
    // Merge stored + defaults; avoid duplicates by name
    const map = new Map<string, any>();
    for (const c of COURSES) map.set(c.name, c);
    for (const s of stored) map.set(s.name, { id: s.id, name: s.name, duration: s.duration, fees: s.fees, description: s.description || "" });
    return Array.from(map.values());
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">Courses</h2>
      <p className="mt-1 text-sm text-muted-foreground">Course Name, Duration, Fees, and descriptions.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Duration: <span className="text-muted-foreground">{c.duration}</span></div>
              <div className="text-sm">Fees: <span className="text-muted-foreground">₨ {Number(c.fees).toLocaleString()}</span></div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <Button asChild className="mt-2 w-full"><Link to={`/admission-form?course=${encodeURIComponent(c.name)}`}>Apply Now</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
