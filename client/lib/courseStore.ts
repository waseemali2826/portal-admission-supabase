const KEY = "admin.courses";

export type StoredCourse = {
  id: string;
  name: string;
  duration: string;
  fees: number;
  description?: string;
  createdAt: string; // ISO
};

export function getStoredCourses(): StoredCourse[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredCourse[]) : [];
  } catch {
    return [];
  }
}

import { COURSES as PUBLIC_COURSES } from "@/data/courses";

export function getAllCourseNames(): string[] {
  try {
    const fromStore = getStoredCourses().map((c) => c.name).filter(Boolean);
    const fromPublic = (PUBLIC_COURSES as Array<{ name: string }>).map((c) => c.name).filter(Boolean);
    return Array.from(new Set([...(fromPublic || []), ...fromStore]));
  } catch {
    return [];
  }
}

export function addStoredCourse(
  course: Omit<StoredCourse, "id" | "createdAt">,
) {
  const list = getStoredCourses();
  const next: StoredCourse = {
    id: `CRS-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...course,
  };
  localStorage.setItem(KEY, JSON.stringify([next, ...list]));
  try {
    window.dispatchEvent(
      new CustomEvent("courses:changed", {
        detail: { type: "add", course: next },
      }),
    );
  } catch {}
  return next;
}
