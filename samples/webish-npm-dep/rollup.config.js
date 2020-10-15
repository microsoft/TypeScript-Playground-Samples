import typescript from '@rollup/plugin-typescript'
import node from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

// New to this sample:
import externalGlobals from "rollup-plugin-external-globals";

const rootFiles = ['index.ts']

// This is a custom rollup, because we're directly using `tsquery`
// which wants to use `require("typescript")` - but that doesn't really
// exist because we already have our own copy of it on the site already.

// This _could_ be avoided, at the price of a very large download for the plugin
// but no-one really wants to download 8mb of TypeScript twice for the same page.

export default rootFiles.map(name => {
  /** @type { import("rollup").RollupOptions } */
    const options = {
      input: `src/${name}`,
      external: ['typescript', 'fs', 'path'],
      output: {
        paths: {
          "typescript":"typescript-sandbox/index",
          "fs":"typescript-sandbox/index",
          "path":"typescript-sandbox/index",
        },
        name,
        dir: "dist",
        format: "amd"  
      },
      plugins: [typescript({ tsconfig: "tsconfig.json" }), externalGlobals({ typescript: "window.ts" }), commonjs(), node(), json()]
    };

    return options
  })
