#!/usr/bin/env node

import { extractPackage } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("No .unitypackage path was given.\n\nUSAGE: unitypackage-extractor [XXX.unitypackage] (optional/output/path)");
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  try {
    await extractPackage(args[0], args[1] || "");
    console.log(`--- Finished in ${(Date.now() - startTime) / 1000} seconds ---`);
  } catch (error) {
    console.error(`Error extracting package: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();