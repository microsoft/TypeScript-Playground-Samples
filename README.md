# Code Samples for Playground Plugins

This is a series of example plugins, which are extremely well documented and aim to give you samples to build from depending on what you want to build.

### TS Compiler API

Uses [`@typescript/vfs`](https://www.npmjs.com/package/@typescript/vfs) to set up a TypeScript project in the browser, and then displays all of the top-level functions as AST nodes in the sidebar.

![./samples/ts-program/screenshots/img.png](./samples/ts-program/screenshots/img.png)

[Key source file](./samples/ts-program/src/index.ts).

### TS Transformers Demo

Uses a custom TypeScript transformer when emitting JavaScript from the current file in the Playground.

![./samples/transformer/screenshots/img.png](./samples/transformer/screenshots/img.png)

[Key source file](./samples/transformer/src/index.ts).




## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
