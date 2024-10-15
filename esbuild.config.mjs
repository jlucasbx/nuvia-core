import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    platform: "node",
    outdir: ".build",
    packages: "external",
    format: "esm",
    sourcemap: true,
    alias: {
        "@*": "./src/*"
    }
})
