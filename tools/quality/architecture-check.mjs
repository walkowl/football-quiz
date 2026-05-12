import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import ts from "typescript";

const root = resolve(".");
const sourceFiles = [
  "apps/web/app/layout.tsx",
  "apps/web/app/page.tsx",
  "apps/web/src/data/mockFootballData.ts",
  "apps/web/src/data/mockPredictionData.ts",
  "apps/web/src/domain/prediction.ts",
  "apps/web/src/domain/quiz.ts",
  "apps/web/src/features/quiz/QuizExperience.tsx",
  "apps/web/src/features/quiz/localPredictionStorage.ts",
  "apps/web/src/features/quiz/localQuizProgressStorage.ts",
];

const violations = [];

for (const file of sourceFiles) {
  const absolutePath = resolve(root, file);
  const sourceText = readFileSync(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node)) {
      return;
    }

    const moduleSpecifier = node.moduleSpecifier;

    if (!ts.isStringLiteral(moduleSpecifier)) {
      return;
    }

    checkImport(file, moduleSpecifier.text);
  });
}

if (violations.length > 0) {
  console.error("architecture check failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("architecture check passed");

function checkImport(file, specifier) {
  if (!specifier.startsWith(".")) {
    return;
  }

  const normalizedTarget = normalizeImport(file, specifier);

  if (
    file.includes("/src/domain/") &&
    !normalizedTarget.includes("/src/domain/")
  ) {
    violations.push(`${file} imports outside domain: ${specifier}`);
  }

  if (
    file.includes("/src/data/") &&
    (normalizedTarget.includes("/src/features/") ||
      normalizedTarget.includes("/app/"))
  ) {
    violations.push(`${file} imports UI code: ${specifier}`);
  }

  if (
    file.includes("/app/") &&
    specifier !== "./globals.css" &&
    !normalizedTarget.includes("/src/features/")
  ) {
    violations.push(
      `${file} should only import feature entrypoints: ${specifier}`,
    );
  }
}

function normalizeImport(file, specifier) {
  const absoluteTarget = resolve(root, file, "..", specifier);
  return `/${relative(root, absoluteTarget).replaceAll("\\", "/")}`;
}
