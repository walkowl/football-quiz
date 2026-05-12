import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const webRoot = "apps/web";
const routeStatsPath = join(
  webRoot,
  ".next/diagnostics/route-bundle-stats.json",
);
const chunksDir = join(webRoot, ".next/static/chunks");

const budgets = {
  maxFirstLoadUncompressedJsBytes: 575_000,
  maxLargestJsChunkBytes: 240_000,
};

const routeStats = JSON.parse(readFileSync(routeStatsPath, "utf8"));
const violations = [];

for (const route of routeStats) {
  if (
    route.firstLoadUncompressedJsBytes > budgets.maxFirstLoadUncompressedJsBytes
  ) {
    violations.push(
      `${route.route} first-load JS is ${formatBytes(
        route.firstLoadUncompressedJsBytes,
      )}, budget is ${formatBytes(budgets.maxFirstLoadUncompressedJsBytes)}`,
    );
  }
}

const largestChunk = readdirSync(chunksDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => {
    const path = join(chunksDir, file);

    return {
      file,
      size: statSync(path).size,
    };
  })
  .sort((left, right) => right.size - left.size)[0];

if (!largestChunk) {
  violations.push("No JavaScript chunks found");
} else if (largestChunk.size > budgets.maxLargestJsChunkBytes) {
  violations.push(
    `${largestChunk.file} is ${formatBytes(
      largestChunk.size,
    )}, budget is ${formatBytes(budgets.maxLargestJsChunkBytes)}`,
  );
}

if (violations.length > 0) {
  console.error("bundle budget failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

const largestRouteSize = Math.max(
  ...routeStats.map((route) => route.firstLoadUncompressedJsBytes),
);

console.log(
  `bundle budget passed: max route ${formatBytes(
    largestRouteSize,
  )}, largest chunk ${formatBytes(largestChunk.size)}`,
);

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)} KiB`;
}
