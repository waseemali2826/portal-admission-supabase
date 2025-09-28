export const preloadHome = () => import("../pages/Home");
export const preloadCourses = () => import("../pages/CourseCatalog");
export const preloadAdmissionForm = () => import("../pages/AdmissionForm");
export const preloadContact = () => import("../pages/Contact");

export type PreloadKey = "home" | "courses" | "admission" | "contact";
export const preloads: Record<PreloadKey, () => Promise<unknown>> = {
  home: preloadHome,
  courses: preloadCourses,
  admission: preloadAdmissionForm,
  contact: preloadContact,
};
