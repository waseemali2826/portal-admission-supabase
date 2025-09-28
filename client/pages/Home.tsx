import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">EduAdmin Institute</h1>
        <p className="mt-3 text-muted-foreground md:text-lg">Institute ka intro: modern curriculum, expert faculty, aur hands‑on training ke saath job‑ready skills. Admissions open — apply today.</p>
      </section>


      <section>
        <h2 className="text-2xl font-bold">Admissions Open</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Spring Batch</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Limited seats. Early bird discount available. Apply before 25th.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Weekend Classes</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Working professionals ke liye weekend schedule.</CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
