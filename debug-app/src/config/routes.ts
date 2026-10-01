import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const routes: { path: string; access: "guest" | "protected"; component: LazyExoticComponent<ComponentType> }[] = [
  { path: "/login", access: "guest", component: lazy(() => import("@/pages/login")) },
  { path: "/", access: "protected", component: lazy(() => import("@/pages/diagnostics")) },
];
