import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // three.js scenes mutate GPU objects (materials, geometries) inside useFrame on purpose:
    // that is how React Three Fiber animates without re-rendering React every frame.
    files: ["src/components/hero/HeroScene.tsx", "src/components/map/MapScene.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  { ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"] },
];

export default config;
