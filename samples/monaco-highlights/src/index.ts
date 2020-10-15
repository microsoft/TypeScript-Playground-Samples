import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground"
import type { SourceFile } from "typescript"

// The DOM's Node, and the TypeScript's Node types can get mixed up,
// for simplicity's sake, make an alias of TS' version.
type TSNode = import("typescript").Node

const makePlugin = (utils: PluginUtils) => {
  const customPlugin: PlaygroundPlugin = {
    id: "ts-program",
    displayName: "TS Program",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container)
      ds.title("A plugin which uses the monaco API")
      ds.p("There's a lot of examples in the <a href='https://microsoft.github.io/monaco-editor/playground.html'>Monaco Playground</a>, but here's a simple example which tries to show which parts of the source code would be removed by TypeScript.")

      let decorations: string[] = []
      
      ds.button({
        label: "Highlight Removable Code",
        onclick: async () => {
          // We need a SourceFile to loop through all of the AST nodes to declare what is going to 
          // be removed by a transpiler.
          const sourceFile = await sandbox.getAST()
          // All the work is at the bottom of this file
          const removedNodes = getASTNodesToRemove(sandbox.ts, sourceFile)

          // We will need to convert from TypeScripts method of keeping track of positions
          // to monaco's - which uses Ranges and Positions instead of character indexes.
          const model = sandbox.getModel()
          const ranges: import("monaco-editor").Range[] = removedNodes.map(n => {
            const start = model.getPositionAt(n.getStart(sourceFile))
            const end = model.getPositionAt(n.getEnd())
            return new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column)
          })

          // Then we call the monaco deltaDecorations API, which does the hard work.
          const decoratorOpts = { inlineClassName: "highlight-error" }
          decorations = sandbox.editor.deltaDecorations(decorations, ranges.map(r => ({ range:r, options: decoratorOpts })))
        }
      })
      
      // It's nice to be able to clear without a reload
      ds.button({
        label: "Clear",
        onclick: () => {
          decorations = sandbox.editor.deltaDecorations(decorations, [])
        }
      })
    },
  }

  return customPlugin
}

export default makePlugin

// A rough list of AST nodes which are removed by TypeScript at runtime,
// there's probably cases not covered, but most code I tried looked about right
const shouldBeRemoved = (ts: typeof import("typescript"), node: TSNode) => {
  const definitelyRemoved: import("typescript").SyntaxKind[] = [
    ts.SyntaxKind.TypeReference,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeAliasDeclaration
  ]

  if (definitelyRemoved.includes(node.kind)) return true

  if (ts.isImportDeclaration(node)) {
    // import type
    if (node.importClause.isTypeOnly) return true
  } else if (node.parent && ts.isVariableDeclaration(node.parent) && node.parent.type === node) {
    // e.g. const nodes: import("typescript").FunctionDeclaration[] = []
    return true
  }

  return false
}

// Uses the visitor below to get the list
const getASTNodesToRemove = (ts: typeof import("typescript"), sourceFile: SourceFile) => {
  const foundNodes: TSNode[] = []
  visitAllNodes(sourceFile, (node) => {
    if (shouldBeRemoved(ts, node)) foundNodes.push(node)
  })
  return foundNodes
}

// Runs a function against every node in the AST
function visitAllNodes(sourceFile: SourceFile, visitor: (node: TSNode) => void) {
  visit(sourceFile);
  function visit(node: TSNode) {
    visitor(node);
    for (const child of node.getChildren(sourceFile)) {
      visit(child);
    }
  }
}
