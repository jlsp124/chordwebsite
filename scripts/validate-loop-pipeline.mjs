import {
  validateGeneratedLoopFragments,
  validateSourceRegistry
} from '../src/data/validators/index.ts';
import { exists, readJson } from './lib/fs-utils.mjs';
import { generatedFragmentsPath, sourceRegistryPath } from './lib/pipeline-paths.mjs';

function printIssues(issues) {
  for (const issue of issues) {
    console.error(`[${issue.scope}] ${issue.path}: ${issue.message}`);
  }
}

async function main() {
  const registry = await readJson(sourceRegistryPath);
  const registryIssues = validateSourceRegistry(registry);

  if (registryIssues.length > 0) {
    printIssues(registryIssues);
    process.exitCode = 1;
    return;
  }

  if (await exists(generatedFragmentsPath)) {
    const generated = await readJson(generatedFragmentsPath);
    const generatedIssues = validateGeneratedLoopFragments(generated);

    if (generatedIssues.length > 0) {
      printIssues(generatedIssues);
      process.exitCode = 1;
      return;
    }
  }

  console.log('Validated source registry and generated loop-fragment output.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
