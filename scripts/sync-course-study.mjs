// Share David's pure calculation modules with the static site. This is an
// explicit development command, never a build step for running Orb Foundry.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

const destination = new URL("../src/course-study/", import.meta.url);
await mkdir(destination, { recursive: true });
for (const name of ["barrier", "curve", "contest", "courses"]) {
    const source = await readFile(new URL(`../site/src/lib/${name}.ts`, import.meta.url), "utf8");
    const javascript = stripTypeScriptTypes(source, { mode: "strip" })
        .replace(/from "\.\/(\w+)"/g, 'from "./$1.js?v=20261112-study1"')
        .replace(/[ \t]+$/gm, "");
    await writeFile(new URL(`${name}.js`, destination), `// Generated from site/src/lib/${name}.ts (David's course model).\n// Run npm run study:sync to update; do not edit this copy.\n${javascript}`);
}
console.log("Synced David's four calculation modules for the static Course Study.");
