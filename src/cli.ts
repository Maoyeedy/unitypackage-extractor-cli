#!/usr/bin/env node

import { extractPackage, viewPackage } from './index';
import path from 'path';

function showHelp(): void {
  console.log(`
Usage:
  unitypackage-extractor <command> <*.unitypackage>

Commands:
  extract <*.unitypackage> [output/path]   Extracts the package to the specified path (or current directory)
  view <*.unitypackage>                    Lists asset paths in the package without extracting

If no command, 'extract' is used by default.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }

  let command = 'extract';
  let argIndex = 0;
  if (['extract', 'view'].includes(args[0])) {
    command = args[0];
    argIndex = 1;
  }

  const positionalArgs = args.slice(argIndex).filter(arg => !arg.startsWith('-'));
  if (positionalArgs.length === 0) {
    console.error('Error: No package file specified');
    showHelp();
    return;
  }

  const packagePath = positionalArgs[0];
  const outputPath = positionalArgs.length > 1 ? positionalArgs[1] : undefined;

  try {
    if (command === 'view') {
      await viewPackage(packagePath);
    } else {
      await extractPackage(packagePath, outputPath);
      const resolvedOutputPath = path.resolve(outputPath || process.cwd());
      console.log('Extracted successfully to', resolvedOutputPath);
    }
  } catch (error) {
    console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
