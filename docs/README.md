# Documentation index

Full guides for [**vrchat-lcg-udon-mcp 2.2.5**](https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp), using [LCGUdonSharp 0.3.9](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.9) as the documentation baseline, in six languages:

LCGUdonSharp 0.3.9 bakes Unity Localization String/Asset Tables into Udon for local language selection, regional/default fallbacks, dropdowns, and change callbacks. Text, sprites, textures, audio, and prefab variants are supported. Smart Strings support scalar variables, numeric formatting, choose, and supported plural forms—not the full Unity syntax; unsupported syntax fails validation before build. Dependencies: Unity Localization 1.4.5 and Scriptable Build Pipeline 1.21.25. English/Thai/Japanese examples and legacy JSON tools are included. See the [Unity Localization setup](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/Localization/UnityLocalization.md). Language choice is local, not persisted; assets are baked into the world, not loaded through Addressables.

LCGUdonSharp 0.3.9 also supports nested custom `ScriptableObject` scalar/array references and derived assets assigned to base types. Read-only snapshots support `is`, declaration patterns, `as`, and checked explicit casts using runtime type tags. Inherited fields, Inspector assignments, and defensive array copies are preserved. Cyclic graphs and nesting beyond 128 assets are rejected; writes, properties/methods, runtime creation, synced snapshots, and unsupported casts remain unsupported. Import optional examples after compiler installation for the [shop and equipment guide](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/ScriptableObjects/README.md). Rebuild all Udon programs and rebake scene/prefab data after upgrading because snapshot type tags and field layouts changed.

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

LCGUdonSharp 0.3.9 includes the networking improvements introduced in 0.3.6: late-join snapshot recovery, ownership repair after disconnects, batched object motion, packet-binding recovery after domain reload, and native/LCG networking examples. Install through VCC/ALCOM or the named `com.logiccuteguy.lcgudonsharp-0.3.9.zip` asset, then let Unity finish setup, recompile UdonSharp programs, and rebuild worlds. Builds from before 0.3.6 cannot decode motion batches. Manual packet networking remains experimental; native sync passthrough remains instance-wide.

Restart the MCP after updating the local compiler package. Its validation is static and does not establish Unity or VRChat runtime correctness.
