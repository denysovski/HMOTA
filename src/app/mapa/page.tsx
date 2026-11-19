import type { Metadata } from "next";
import { Suspense } from "react";
import { MapExplorer } from "@/components/map/MapExplorer";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Mapa",
  description: "Trojrozměrná mapa České republiky se stavbami ateliéru.",
  alternates: { canonical: "/mapa" },
};

export default function MapPage() {
  return (
    <Suspense fallback={<div className="map-page" />}>
      <MapExplorer projects={projects} />
    </Suspense>
  );
}
