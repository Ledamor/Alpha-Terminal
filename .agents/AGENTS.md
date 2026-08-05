## Strict Linting and Typings Rule

When writing or modifying code in this workspace, you MUST strictly adhere to the project's established linters and TypeScript configurations:
- **No `any` Types**: Never use the `any` type in TypeScript. Always use strict typing, interfaces, or `unknown` where the exact type is unpredictable.
- **Strict Interfaces**: Ensure all complex objects, such as socket events and API payloads, are strictly typed with predefined interfaces.
- **Linter Compliance**: Ensure that the code is free from linter errors (e.g. `@typescript-eslint/no-explicit-any` violations) before completing a task.
- **No Bypassing**: Avoid bypassing linting rules with comments like `eslint-disable` or `// @ts-ignore` unless absolutely necessary and documented.
