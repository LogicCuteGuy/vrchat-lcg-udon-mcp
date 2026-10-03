import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../server.js';
import type { ServiceContainer } from '../services/container.js';

it('reports the package version in the MCP initialization handshake', async () => {
  const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const container = {
    skillService: { listSkills: () => [] },
    ruleService: { listRules: () => [] },
    templateService: { listTemplates: () => [] },
    docsRepo: { getAll: () => [] },
  } as unknown as ServiceContainer;
  const server = createServer(container);
  const client = new Client({ name: 'release-version-check', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    expect(client.getServerVersion()).toEqual({
      name: manifest.name,
      version: manifest.version,
    });
  } finally {
    await client.close();
    await server.close();
  }
});
