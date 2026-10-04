# Documentation index

Full guides for [**vrchat-lcg-udon-mcp 2.2.3**](https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp), using [LCGUdonSharp 0.3.7](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.7) as the documentation baseline, in six languages:

LCGUdonSharp 0.3.7 adds Inspector-assigned custom `ScriptableObject` assets as read-only Udon snapshots. Typed serialized and inherited fields are readable, arrays return defensive copies, and Inspector references survive proxy readback. Writes, unsupported casts, properties, runtime creation, synced snapshots, and nested data assets are rejected. Import the optional examples after compiler installation for the [interactive shop guide](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.7/Example/ScriptableObjects/README.md).

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

LCGUdonSharp 0.3.7 includes the networking improvements introduced in 0.3.6: late-join snapshot recovery, ownership repair after disconnects, batched object motion, packet-binding recovery after domain reload, and native/LCG networking examples. Install through VCC/ALCOM or the named `com.logiccuteguy.lcgudonsharp-0.3.7.zip` asset, then let Unity finish setup, recompile UdonSharp programs, and rebuild worlds. Builds from before 0.3.6 cannot decode motion batches. Manual packet networking remains experimental; native sync passthrough remains instance-wide.

Restart the MCP after updating the local compiler package. Its validation is static and does not establish Unity or VRChat runtime correctness.
