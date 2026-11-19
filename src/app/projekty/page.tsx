import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectIndex } from "@/components/ProjectIndex";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projekty",
  description: "Stavby, interiéry a krajina ateliéru po celé České republice.",
  alternates: { canonical: "/projekty" },
};

export default function ProjectsPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(96px, 12vw, 200px)" }}>
      <header className="page-head">
        <Reveal as="h1" className="mega" immediate>
          Projekty
        </Reveal>
      </header>
      <Suspense fallback={null}>
        <ProjectIndex projects={projects} />
      </Suspense>
    </div>
  );
}
