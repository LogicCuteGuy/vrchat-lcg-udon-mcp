import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CompilerService } from '../services/compiler-service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tempRoot = join(__dirname, '../../data/test-compiler-service');
const packagePath = join(tempRoot, 'com.logiccuteguy.lcgudonsharp');
const indexPath = join(tempRoot, 'index');

const searchConfig = {
  fuzzy: 0.2,
  headingWeight: 3,
  titleWeight: 2.5,
  exampleWeight: 1.5,
  ruleWeight: 2,
  skillWeight: 2.5,
  cheatsheetWeight: 2.5,
  maxResults: 20,
};

describe('CompilerService', () => {
  beforeEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
    mkdirSync(join(packagePath, 'UdonSharp'), { recursive: true });
    writeFileSync(
      join(packagePath, 'package.json'),
      JSON.stringify({
        name: 'com.logiccuteguy.lcgudonsharp',
        displayName: 'LCGUdonSharp',
        version: '0.2.0',
        description: 'Interface-enabled UdonSharp compiler',
        vpmDependencies: { 'com.vrchat.worlds': '3.10.5' },
      }),
    );
    writeFileSync(
      join(packagePath, 'README.md'),
      [
        '# LCGUdonSharp',
        '',
        '| Feature | Description |',
        '|---|---|',
        '| **Manual Packet Networking** | Adds `[LCGPacket]` delivery. |',
      ].join('\n'),
    );
    writeFileSync(
      join(packagePath, 'UdonSharp', 'Packet.cs'),
      'public sealed class LCGPacketAttribute : System.Attribute {}',
    );
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('reports package metadata and SDK target', () => {
    const service = new CompilerService(
      { profile: 'lcgudonsharp', packagePath },
      searchConfig,
      indexPath,
    );
    service.initialize();

    const info = service.getInfo();
    expect(info.available).toBe(true);
    expect(info.packageName).toBe('com.logiccuteguy.lcgudonsharp');
    expect(info.version).toBe('0.2.0');
    expect(info.sdkVersion).toBe('3.10.5');
    expect(info.features.some((feature) => feature.name.includes('Manual Packet'))).toBe(true);
  });

  it('searches compiler documentation and source', () => {
    const service = new CompilerService(
      { profile: 'lcgudonsharp', packagePath },
      searchConfig,
      indexPath,
    );
    service.initialize();

    const results = service.search('LCGPacket');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.path.endsWith('Packet.cs'))).toBe(true);
  });

  it('reports a missing LCG package path without crashing', () => {
    const service = new CompilerService(
      { profile: 'lcgudonsharp', packagePath: null },
      searchConfig,
      indexPath,
    );
    service.initialize();

    const info = service.getInfo();
    expect(info.available).toBe(false);
    expect(info.error).toContain('package path');
  });
});
