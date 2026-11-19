import { z } from "zod";

export const REGIONS = [
  "Praha",
  "Středočeský",
  "Jihočeský",
  "Plzeňský",
  "Karlovarský",
  "Ústecký",
  "Liberecký",
  "Královéhradecký",
  "Pardubický",
  "Vysočina",
  "Jihomoravský",
  "Olomoucký",
  "Zlínský",
  "Moravskoslezský",
] as const;

export const TYPES = {
  bydleni: "Bydlení",
  kultura: "Kultura",
  komerce: "Komerce",
  verejne: "Veřejné stavby",
  interier: "Interiér",
  krajina: "Krajina",
} as const;

export const STATUSES = {
  realizace: "Realizováno",
  vystavba: "Ve výstavbě",
  soutez: "Soutěž",
} as const;

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");

/** One volume of the simplified massing used for drawings and the 3D hero (metres). */
export const VolumeSchema = z.object({
  x: z.number(),
  z: z.number(),
  w: z.number().positive(),
  d: z.number().positive(),
  h: z.number().positive(),
  y: z.number().default(0),
  glass: z.boolean().default(false),
});

export const ProjectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(2),
    architects: z.array(z.object({ name: z.string(), role: z.string() })).min(1),
    client: z.string(),
    type: z.enum(Object.keys(TYPES) as [keyof typeof TYPES, ...(keyof typeof TYPES)[]]),
    status: z.enum(Object.keys(STATUSES) as [keyof typeof STATUSES, ...(keyof typeof STATUSES)[]]),
    municipality: z.string(),
    region: z.enum(REGIONS),
    lat: z.number().min(48.5).max(51.1),
    lng: z.number().min(12.0).max(18.9),
    commissioned: yearMonth,
    completed: yearMonth.nullable(),
    areaM2: z.number().positive(),
    summary: z.string().min(20),
    text: z.array(z.string()).default([]),
    massing: z.array(VolumeSchema).min(1),
    featured: z.boolean().default(false),
    placeholder: z.boolean().default(false),
  })
  .refine((p) => !p.completed || p.completed >= p.commissioned, {
    message: "completed must not be before commissioned",
    path: ["completed"],
  });

export type ProjectInput = z.input<typeof ProjectSchema>;
export type Project = z.output<typeof ProjectSchema>;
export type Volume = z.output<typeof VolumeSchema>;
export type ProjectType = keyof typeof TYPES;
export type ProjectStatus = keyof typeof STATUSES;
