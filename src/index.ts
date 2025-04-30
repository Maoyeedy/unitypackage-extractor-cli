import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import { dir as tmpDir } from 'tmp-promise';

/**
 * Move a file from source to destination, even across file systems
 */
async function moveFile(source: string, destination: string): Promise<void> {
  try {
    // Try simple rename first (fast but only works on same file system)
    fs.renameSync(source, destination);
  } catch (error) {
    // If rename fails, do a copy-then-delete
    fs.copyFileSync(source, destination);
    fs.unlinkSync(source);
  }
}

/**
 * Extracts a .unitypackage into the specified directory
 * @param packagePath The path to the .unitypackage
 * @param outputPath Optional output path, otherwise will use current working directory
 * @param encoding File encoding to use
 */
export async function extractPackage(packagePath: string, outputPath?: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  // If no output path is provided, use current working directory
  if (!outputPath) {
    outputPath = process.cwd();
  }
  
  // Create a temporary directory
  const tmpDirObj = await tmpDir({ unsafeCleanup: true });
  
  try {
    // Extract the unitypackage to the temporary directory
    await tar.extract({
      file: packagePath,
      cwd: tmpDirObj.path
    });
    
    // Process each entry in the temporary directory
    const entries = fs.readdirSync(tmpDirObj.path);
    
    for (const entry of entries) {
      const assetEntryDir = path.join(tmpDirObj.path, entry);
      const pathnamePath = path.join(assetEntryDir, 'pathname');
      const assetPath = path.join(assetEntryDir, 'asset');
      
      // Check if the required files exist
      if (!fs.existsSync(pathnamePath) || !fs.existsSync(assetPath)) {
        continue; // Skip this entry if it doesn't have the required files
      }
      
      try {
        // Read the pathname file to get the asset's path
        let pathname = fs.readFileSync(pathnamePath, encoding).toString();
        // Remove trailing newline if present
        pathname = pathname.endsWith('\n') ? pathname.slice(0, -1) : pathname;
        
        // Replace Windows reserved characters with underscores (except for path separators)
        if (process.platform === 'win32') {
          pathname = pathname.replace(/[>:"|\?\*]/g, '_');
        }
        
        // Calculate the output path for this asset
        const assetOutPath = path.join(outputPath, pathname);
        
        // Security check: make sure the output path is inside the desired output directory
        const resolvedOutputPath = path.resolve(outputPath);
        const resolvedAssetPath = path.resolve(assetOutPath);
        
        if (!resolvedAssetPath.startsWith(resolvedOutputPath)) {
          console.warn(`WARNING: Skipping '${entry}' as '${assetOutPath}' is outside of '${outputPath}'.`);
          continue;
        }
        
        // Create the directory structure for the asset
        console.log(`Extracting '${entry}' as '${pathname}'`);
        await fs.promises.mkdir(path.dirname(assetOutPath), { recursive: true });
        
        // Move the asset to its final location
        await moveFile(assetPath, assetOutPath);
      } catch (error) {
        console.error(`Error processing asset '${entry}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    // Clean up the temporary directory
    await tmpDirObj.cleanup();
  }
}