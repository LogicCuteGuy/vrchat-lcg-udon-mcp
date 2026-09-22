import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DocsRepository } from '../repositories/docs-repository.js';
import type { AppConfig, CompilerConfig, SearchResult } from '../types/index.js';
import { SearchEngine } from './search-engine.js';

interface PackageManifest {
  name?: string;
  displayName?: string;
  version?: string;
  description?: string;
  vpmDependencies?: Record<string, string>;
}

export interface CompilerInfo {
  profile: CompilerConfig['profile'];
  available: boolean;
  packagePath: string | null;
  packageName?: string;
  displayName?: string;
  version?: string;
  sdkVersion?: string;
  description?: string;
  features: Array<{ name: string; description: string }>;
  documentCount: number;
  error?: string;
}

/**
 * Indexes an optional local compiler package independently from the upstream
 * UdonSharp knowledge repository.
 */
export class CompilerService {
  private readonly searchEngine: SearchEngine;
  private docsRepo: DocsRepository | null = null;
  private manifest: PackageManifest | null = null;
  private error: string | null = null;

  constructor(
    private readonly config: CompilerConfig,
    searchConfig: AppConfig['search'],
    private readonly indexPath: string,
  ) {
    this.searchEngine = new SearchEngine(searchConfig);
  }

  initialize(): void {
    this.error = null;
    this.docsRepo = null;
    this.manifest = null;
    const packagePath = this.config.packagePath;
    if (this.config.profile !== 'lcgudonsharp') return;
    if (!packagePath) {
      this.error = 'No LCGUdonSharp package path is configured';
      return;
    }

    if (!existsSync(packagePath)) {
      this.error = `Compiler package path does not exist: ${packagePath}`;
      return;
    }

    const manifestPath = join(packagePath, 'package.json');
    if (!existsSync(manifestPath)) {
      this.error = `Compiler package manifest not found: ${manifestPath}`;
      return;
    }

    try {
      this.manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackageManifest;
      this.docsRepo = new DocsRepository(packagePath, this.indexPath, 'absolute');
      // Compiler source changes frequently during development; always start from live files.
      this.docsRepo.rebuild();
      this.refreshSearchIndex();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.docsRepo = null;
      this.manifest = null;
    }
  }

  getInfo(): CompilerInfo {
    const readme = this.docsRepo?.getByPath('README.md');
    const featureTable = readme?.tables.find((table) =>
      table.headers.some((header) => header.trim().toLowerCase() === 'feature'),
    );
    const features = (featureTable?.rows ?? []).flatMap((row) => {
      const name = row[0]?.replace(/\*\*/g, '').trim();
      const description = row[1]?.trim();
      return name && description ? [{ name, description }] : [];
    });
    const sdkVersion = this.manifest?.vpmDependencies?.['com.vrchat.worlds'];

    return {
      profile: this.config.profile,
      available: this.docsRepo !== null,
      packagePath: this.config.packagePath,
      ...(this.manifest?.name ? { packageName: this.manifest.name } : {}),
      ...(this.manifest?.displayName ? { displayName: this.manifest.displayName } : {}),
      ...(this.manifest?.version ? { version: this.manifest.version } : {}),
      ...(sdkVersion ? { sdkVersion } : {}),
      ...(this.manifest?.description ? { description: this.manifest.description } : {}),
      features,
      documentCount: this.docsRepo?.getAll().length ?? 0,
      ...(this.error ? { error: this.error } : {}),
    };
  }

  search(query: string, limit = 10): SearchResult[] {
    return this.searchEngine.search(query, { limit });
  }

  rebuild(): void {
    if (!this.docsRepo) return;
    this.docsRepo.rebuild();
    this.refreshSearchIndex();
  }

  getDocsRepository(): DocsRepository | null {
    return this.docsRepo;
  }

  refreshSearchIndex(): void {
    const packagePath = this.config.packagePath;
    if (packagePath) {
      try {
        this.manifest = JSON.parse(
          readFileSync(join(packagePath, 'package.json'), 'utf-8'),
        ) as PackageManifest;
        this.error = null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      }
    }
    this.searchEngine.buildIndex(this.docsRepo?.getSearchChunks() ?? []);
  }
}
