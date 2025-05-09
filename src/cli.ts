#!/usr/bin/env node

import { extractPackage, viewPackage } from './index';
import path from 'path';

function showHelp(): void {
  console.log(`
Usage:
  \x1B[3munitypackage-extractor *.unitypackage [optional/output/path]\x1B[0m

If no output path is specified, the package will be extracted to the current directory.`);
}

async function main() {
  const args = process.argv.slice(2);

  // Show help if requested or no arguments provided
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }

  // Determine command: extract or view (default extract)
  let command = 'extract';
  let argIndex = 0;
  if (['extract', 'view'].includes(args[0])) {
    command = args[0];
    argIndex = 1;
  }

  // Filter out any options (starting with -)
  const positionalArgs = args.slice(argIndex).filter(arg => !arg.startsWith('-'));

  if (positionalArgs.length === 0) {
    console.error('Error: No package file specified');
    showHelp();
    return;
  }

  const packagePath = positionalArgs[0];
  const outputPath = positionalArgs.length > 1 ? positionalArgs[1] : undefined;

  if (command === 'view') {
    await viewPackage(packagePath);
  } else {
    await extractPackage(packagePath, outputPath);
    console.log('Extraction complete!');
  }
}

main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
