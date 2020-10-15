import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground"
import type {TransformerFactory, SourceFile} from "typescript"

// The DOM's Node, and the TypeScript's Node types can get mixed up,
// for simplicity's sake, make an alias of TS' version.
type TSNode = import("typescript").Node

// We can create a transformer which relies on the TypeScript API
// by passing the TypeScript object as a first function, then by providing
// the function after. This is a functional programming technique called currying.
type SourceFileFactory = (ts: typeof import("typescript")) => TransformerFactory<SourceFile>

// This transformer will rename any instances of 'babel' or 'plugins' to 'typescript' and 'transform'
// respectively, is it useful? Nah. However, it's a good sample taken from the TS Transformer Handbook
// https://github.com/madou/typescript-transformer-handbook

const transformer: SourceFileFactory  = (ts) => (context) => {
  return sourceFile => {
    const visitor = (node: TSNode): TSNode => {
      if (ts.isIdentifier(node)) {
        switch (node.escapedText) {
          case 'babel':
            return context.factory.createIdentifier('typescript');

          case 'plugins':
            return context.factory.createIdentifier('transforms');
        }
      }
      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

// The plugin:

const makePlugin = (utils: PluginUtils) => {
  const customPlugin: PlaygroundPlugin = {
    id: "ts-transform",
    displayName: "TS Transformer",
    didMount: (sandbox, container) => {
      const ds = utils.createDesignSystem(container)
      ds.title("A plugin which show TS- > JS with a transformer")
      ds.p("You can write a plugin which works with the results of custom TypeScripts transformers when emitting .js, or .d.ts files.")

      // Show the transformer's code
      const code = ds.code(transformerString)
      sandbox.monaco.editor.colorize(transformerString, "typescript", {}).then(newCode => {
        code.innerHTML = newCode
      })

      // We'll use this later, but they are a container + design system for showing 
      // the results of pressing the button. This makes it easier to clear, and re-draw.
      const resultsContainer = document.createElement("div")
      const resultsDS = utils.createDesignSystem(resultsContainer)

      ds.button({
        label: "Run TS -> JS",
        onclick: async () => {
          // Create a TS virtual file system project (see the sample at ../ts-program to learn more)
          const {program, system} = await sandbox.setupTSVFS()

          // Use the compiler API to emit the JS, taking into account the new transformer above
          const sourceFile = program.getSourceFile(sandbox.filepath);
          program.emit(sourceFile, undefined, undefined , false,  { after: [transformer(sandbox.ts)] })

          const js = system.readFile("/input.js")

          // or a single liner without tsvfs, with no compiler configuration taken into account:
          // const js = sandbox.ts.transpileModule(sandbox.getText(), {  fileName: sandbox.filepath, transformers: { after: [transformer(sandbox.ts)]}}).outputText

          resultsDS.clear()
          resultsDS.subtitle("JavaScript with Transformation applied:")

          // Let Monaco handle syntax highlighting of our JS
          const colored = await sandbox.monaco.editor.colorize(js, "javascript", {})
          resultsDS.code(colored)
        }
      })

      container.appendChild(resultsContainer)
    },
  }

  return customPlugin
}

export default makePlugin

// The string version of `transformer` up above.
const transformerString = `const transformer: SourceFileFactory  = (ts) => (context) => {
  return sourceFile => {
    const visitor = (node: TSNode): TSNode => {
      if (ts.isIdentifier(node)) {
        switch (node.escapedText) {
          case 'babel':
            return context.factory.createIdentifier('typescript');

          case 'plugins':
            return context.factory.createIdentifier('transforms');
        }
      }
      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};
`
