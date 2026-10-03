# Documentation index

Full guides for [**vrchat-lcg-udon-mcp 2.2.2**](https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp), using [LCGUdonSharp 0.3.6](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.6) as the documentation baseline, in six languages:

| Language | File |
|----------|------|
| English | [README.en.md](README.en.md) |
| Español | [README.es.md](README.es.md) |
| Français | [README.fr.md](README.fr.md) |
| 日本語 | [README.ja.md](README.ja.md) |
| 한국어 | [README.ko.md](README.ko.md) |
| ไทย | [README.th.md](README.th.md) |

## Additional files

| File | Purpose |
|------|---------|
| [mcp-config.example.json](mcp-config.example.json) | Minimal MCP server config for local development |

## Updating the knowledge base

The MCP reads documentation from a cloned copy of [agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon). From the project root:

```bash
pnpm update-docs    # git clone / pull
pnpm build-index    # rebuild search index
```

The clone lands in `./agent-skills-vrc-lcg-udon` by default (configurable in `config.json`).

Set `LCG_UDONSHARP_PATH` to a local `com.logiccuteguy.lcgudonsharp` package to enable the `compiler_info` and `search_compiler` tools.

LCGUdonSharp 0.3.6 adds late-join snapshot recovery, ownership repair after disconnects, batched object motion, packet-binding recovery after domain reload, and native/LCG networking examples. Install through VCC/ALCOM or the named `com.logiccuteguy.lcgudonsharp-0.3.6.zip` asset, then let Unity finish setup, recompile UdonSharp programs, and rebuild worlds. Older builds cannot decode the new motion batches. Manual packet networking remains experimental; native sync passthrough remains instance-wide.

Restart the MCP after updating the local compiler package. Its validation is static and does not establish Unity or VRChat runtime correctness.
