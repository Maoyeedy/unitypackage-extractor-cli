import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import { dir as tmpDir } from 'tmp-promise';
import sanitize from 'sanitize-filename';

async function moveFile(source: string, destination: string): Promise<void> {
  try {
    await fs.promises.rename(source, destination);
  } catch (error: any) {
    if (error.code === 'EXDEV') {
      await fs.promises.copyFile(source, destination);
      await fs.promises.unlink(source);
    } else {
      throw error;
    }
  }
}

function sanitizePathname(pathname: string): string {
  const trimmed = pathname.trimEnd();
  const segments = trimmed.split(/[\\/]+/);
  const safe = segments.map(seg => sanitize(seg) || '_');
  return safe.join(path.sep);
}

function isValidAssetEntry(assetEntryDir: string): boolean {
  return fs.existsSync(path.join(assetEntryDir, 'pathname')) && fs.existsSync(path.join(assetEntryDir, 'asset'));
}

function resolveAssetOutPath(outputPath: string, pathname: string): string {
  return path.join(outputPath, pathname);
}

function isPathInside(parent: string, child: string): boolean {
  const resolvedParent = path.resolve(parent) + path.sep;
  const resolvedChild = path.resolve(child);
  return resolvedChild.startsWith(resolvedParent);
}

export async function extractPackage(packagePath: string, outputPath?: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  outputPath = path.resolve(outputPath || process.cwd());
  const tmpDirObj = await tmpDir({ unsafeCleanup: true });
  try {
    await tar.extract({ file: packagePath, cwd: tmpDirObj.path });
    const entries = fs.readdirSync(tmpDirObj.path);
    for (const entry of entries) {
      const assetEntryDir = path.join(tmpDirObj.path, entry);
      if (!isValidAssetEntry(assetEntryDir)) continue;
      try {
        const raw = await fs.promises.readFile(path.join(assetEntryDir, 'pathname'), encoding);
        let pathname = raw.toString();
        pathname = sanitizePathname(pathname);
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
    const pathnames: string[] = [];
    for (const entry of entries) {
      const assetEntryDir = path.join(tmpDirObj.path, entry);
      const pathnamePath = path.join(assetEntryDir, 'pathname');
      if (!fs.existsSync(pathnamePath)) continue;
      const raw = await fs.promises.readFile(pathnamePath, encoding);
      let pathname = raw.toString();
      pathname = sanitizePathname(pathname);
      pathnames.push(pathname);
    }
    pathnames.sort();
    for (const pathname of pathnames) {
      console.log(pathname);
    }
  } finally {
    await tmpDirObj.cleanup();
  }
}
