import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground"

// Adding the dependency here will register it will rollup. This will include
// the JS into the bundled source code which is your plugin. 
import { tsquery } from "@phenomnomnominal/tsquery";

// Note: tsquery was not built with _strictly_ build with running as a website in mind, 
// the dependency includes references to things like fs, path and has a dependency 
// on "esquery". The dependency is handled by rollup automatically, and the references
// to node's 'fs' and 'path' are handled in the rollup.config.js

const makePlugin = (utils: PluginUtils) => {
  const customPlugin: PlaygroundPlugin = {
    id: "webish-npm-dep",
    displayName: "npm Dep",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container)
      ds.title("A plugin which uses an npm dep")
      ds.p("This plugin takes an npm dependency online. It was already built with running on a website in mind, so the amount of changes necessary to make it work are pretty minimal.")
      ds.p(`Use the textbox below to make a query, queries happen as you type. You can query using any TypeScript <a href='https://github.com/microsoft/TypeScript/blob/master/src/compiler/types.ts#L123' target='_blank'>AST SyntaxKind</a> type`);

      // We'll use this later, but they are a container + design system for showing 
      // the results of pressing the button. This makes it easier to clear, and re-draw.
      const resultsElement = document.createElement("div")
      const resultsDS = utils.createDesignSystem(resultsElement)

      // Creates a text input which stores the last query, and shows a value when changed
      ds.createTextInput({ 
        id: "tsquery",
        placeholder:`Identifier or Identifier[name="danger"]`,
        keepValueAcrossReloads: true,
        onEnter: async (text) => {
          console.log("Enter", text)
          resultsDS.clear()
          // The API for tsquery starts with a root AST node,
          // so we'll pass in a SourceFile which can be grabbed
          // as a one-liner from getAST() (named that way because
          // if feels like what someone would search for.)

          const ast = await sandbox.getAST()

          // If tsquery fails, then it throws, so we need to account
          // for that with a try catch
          try {
            const nodes = tsquery(ast, text)
            const suffix = nodes.length == 1 ? "result" : "results"
            resultsDS.subtitle(`Got ${nodes.length} ${suffix}`)
            nodes.forEach(node => {
              resultsDS.createASTTree(node)
            });
          } catch (error) {
            resultsDS.subtitle("Query failed")
            resultsDS.p(error.message)
          }
        }
      })

      container.appendChild(resultsElement)
    },
  }

  return customPlugin
}

export default makePlugin
