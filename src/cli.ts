#!/usr/bin/env node

import { extractPackage } from './index';
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

  // Filter out any arguments that start with - or --
  const fileArgs = args.filter(arg => !arg.startsWith('-'));

  // If there are no file arguments, show help
  if (fileArgs.length === 0) {
    console.log('Error: No package file specified');
    showHelp();
    return;
  }

  const packagePath = fileArgs[0];
  const outputPath = fileArgs.length > 1 ? fileArgs[1] : undefined;

  console.log(`Extracting ${path.basename(packagePath)}...`);
  await extractPackage(packagePath, outputPath);
  console.log('Extraction complete!');
}

main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
