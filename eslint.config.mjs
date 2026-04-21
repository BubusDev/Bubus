import nextVitals from "eslint-config-next/core-web-vitals";

const clientBoundaryPlugin = {
  rules: {
    "no-server-imports-in-client": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow server-only imports in use client modules.",
        },
      },
      create(context) {
        const filename = context.filename ?? "";
        const isTsxFile = filename.endsWith(".tsx") || filename.endsWith(".ts");

        function isUseClientProgram(node) {
          const [firstStatement] = node.body;
          return (
            firstStatement?.type === "ExpressionStatement" &&
            "expression" in firstStatement &&
            firstStatement.expression.type === "Literal" &&
            firstStatement.expression.value === "use client"
          );
        }

        function isRestrictedServerModule(source) {
          return (
            source === "@/lib/db" ||
            source === "@/lib/products-server" ||
            source === "@/lib/auth" ||
            source === "next/headers" ||
            source === "next/server" ||
            source === "server-only" ||
            /^@\/lib\/.+-server(?:$|\/)/.test(source)
          );
        }

        return {
          Program(node) {
            if (!isTsxFile || !isUseClientProgram(node)) {
              return;
            }

            for (const statement of node.body) {
              if (statement.type !== "ImportDeclaration") {
                continue;
              }

              const source = String(statement.source.value);

              if (isRestrictedServerModule(source)) {
                context.report({
                  node: statement.source,
                  message:
                    "Server-only module imported into client component. Use props or a server action instead.",
                });
              }

              if (source !== "@prisma/client") {
                continue;
              }

              for (const specifier of statement.specifiers) {
                if (
                  specifier.type === "ImportSpecifier" &&
                  specifier.imported.name === "PrismaClient" &&
                  statement.importKind !== "type" &&
                  specifier.importKind !== "type"
                ) {
                  context.report({
                    node: specifier,
                    message:
                      "Do not import Prisma runtime in client code. Use `import type` for types only.",
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

const config = [
  ...nextVitals,
  {
    plugins: {
      local: clientBoundaryPlugin,
    },
    rules: {
      "local/no-server-imports-in-client": "error",
    },
  },
];

export default config;
