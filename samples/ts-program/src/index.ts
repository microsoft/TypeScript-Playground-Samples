import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground"

const makePlugin = (utils: PluginUtils) => {
  const customPlugin: PlaygroundPlugin = {
    id: "ts-program",
    displayName: "TS Program",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container)
      ds.title("A plugin which uses the TypeScript Compiler API")
      ds.p("This plugin uses the API for the compiler to show all of the functions in the source code to the left.")

      // We'll use this later, but they are a container + design system for showing 
      // the results of pressing the button. This makes it easier to clear, and re-draw.
      const astElements = document.createElement("div")
      const astDS = utils.createDesignSystem(astElements)

      // To use TypeScript effectively in a plugin, you probably want to create 
      // a virtual file-system to work with. This is an in-memory version of the project
      // which normally lives on your computer.

      // The TS team ships an npm module called @typescript/vfs which exists to let you set
      // up the usual API objects for a browser-based TypeScript envionment.
      
      // https://www.npmjs.com/package/@typescript/vfs
      const { createSystem, createDefaultMapFromCDN, createVirtualCompilerHost } = sandbox.tsvfs

      ds.button({
        label: "Click me",
        onclick: async () => {
          const compilerOpts = sandbox.getCompilerOptions()
          const ts = sandbox.ts

          // Using TypeScript in a browser is a bit tricky, because you need to have the library files set up
          // for your time (e.g. you need to have es2015.lib.d.ts somewhere) - by grabbing the map from the TS CSN, tsvfs 
          // will re-use all the cached d.ts files which the playground uses.
          const fsMap = await createDefaultMapFromCDN({ target: compilerOpts.target }, ts.version, true, ts)

          // fsMap is now a Map which has all of the lib.d.ts files needed for your current compiler settings
          const system = createSystem(fsMap)
          
          // We can add the file which represents the current file being edited (this could be: input.{ts,tsx,js,tsx})
          // as with the file content as being the current editor's text
          fsMap.set(sandbox.filepath, sandbox.getText())
  
          // TypeScript has a system called 'hosts'
          const host = createVirtualCompilerHost(system, compilerOpts, sandbox.ts)

          // Here is a copy of a TypeScript program ready to do some work
          const program = ts.createProgram({
            rootNames: [sandbox.filepath],
            options: compilerOpts,
            host: host.compilerHost,
          })

          // Note: You can skip all of the above, and use the shortcut:
          // const {program, system, host} = sandbox.setupTSVFS()

          // Let's print all of the functions in this file:
          const sourceFile = program.getSourceFile(sandbox.filepath);

          // To grab all the AST nodes for functions
          const nodes: import("typescript").FunctionDeclaration[] = []

          // Only grab the top level functions
          ts.forEachChild(sourceFile, node => {
            if (ts.isFunctionDeclaration(node)) {
              nodes.push(node)
            }
          })

          // Clear the section after the button to put our AST Nodes in the
          // plugins's container
          astDS.clear()
          nodes.forEach((functionNode) => {
            astDS.subtitle(functionNode.name.text)
            astDS.createASTTree(functionNode)
          })
        }
      })

      container.appendChild(astElements)
      
    },
  }

  return customPlugin
}

export default makePlugin
