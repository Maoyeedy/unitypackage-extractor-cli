import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import { dir as tmpDir } from 'tmp-promise';

async function moveFile(source: string, destination: string): Promise<void> {
  try {
    fs.renameSync(source, destination);
  } catch {
    fs.copyFileSync(source, destination);
    fs.unlinkSync(source);
  }
}

function sanitizePathname(pathname: string, encoding: BufferEncoding): string {
  let result = pathname.endsWith('\n') ? pathname.slice(0, -1) : pathname;
  if (process.platform === 'win32') {
    result = result.replace(/[>:"|\?\*]/g, '_');
  }
  return result;
}

function isValidAssetEntry(assetEntryDir: string): boolean {
  return fs.existsSync(path.join(assetEntryDir, 'pathname')) && fs.existsSync(path.join(assetEntryDir, 'asset'));
}

function resolveAssetOutPath(outputPath: string, pathname: string): string {
  return path.join(outputPath, pathname);
}

function isPathInside(parent: string, child: string): boolean {
  const resolvedParent = path.resolve(parent);
  const resolvedChild = path.resolve(child);
  return resolvedChild.startsWith(resolvedParent);
}

export async function extractPackage(packagePath: string, outputPath?: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  outputPath = outputPath || process.cwd();
  const tmpDirObj = await tmpDir({ unsafeCleanup: true });
  try {
    await tar.extract({ file: packagePath, cwd: tmpDirObj.path });
    const entries = fs.readdirSync(tmpDirObj.path);
    for (const entry of entries) {
      const assetEntryDir = path.join(tmpDirObj.path, entry);
      if (!isValidAssetEntry(assetEntryDir)) continue;
      try {
        let pathname = fs.readFileSync(path.join(assetEntryDir, 'pathname'), encoding).toString();
        pathname = sanitizePathname(pathname, encoding);
        const assetOutPath = resolveAssetOutPath(outputPath, pathname);
        if (!isPathInside(outputPath, assetOutPath)) {
          console.warn(`WARNING: Skipping '${entry}' as '${assetOutPath}' is outside of '${outputPath}'.`);
          continue;
        }
        console.log(`Extracting '${entry}' as '${pathname}'`);
        await fs.promises.mkdir(path.dirname(assetOutPath), { recursive: true });
        await moveFile(path.join(assetEntryDir, 'asset'), assetOutPath);
      } catch (error) {
        console.error(`Error processing asset '${entry}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } finally {
    await tmpDirObj.cleanup();
  }
}

export async function viewPackage(packagePath: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  const tmpDirObj = await tmpDir({ unsafeCleanup: true });
  try {
    await tar.extract({ file: packagePath, cwd: tmpDirObj.path });
    const entries = fs.readdirSync(tmpDirObj.path);
    for (const entry of entries) {
      const assetEntryDir = path.join(tmpDirObj.path, entry);
      const pathnamePath = path.join(assetEntryDir, 'pathname');
      if (!fs.existsSync(pathnamePath)) continue;
      let pathname = fs.readFileSync(pathnamePath, encoding).toString();
      pathname = sanitizePathname(pathname, encoding);
      console.log(pathname);
    }
  } finally {
    await tmpDirObj.cleanup();
  }
}
