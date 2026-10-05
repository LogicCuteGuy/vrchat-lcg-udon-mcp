```
 ██╗   ██╗██████╗  ██████╗██╗  ██╗ █████╗ ████████╗    ██╗   ██╗██████╗  ██████╗ ███╗   ██╗    ███╗   ███╗ ██████╗██████╗
 ██║   ██║██╔══██╗██╔════╝██║  ██║██╔══██╗╚══██╔══╝    ██║   ██║██╔══██╗██╔═══██╗████╗  ██║    ████╗ ████║██╔════╝██╔══██╗
 ██║   ██║██████╔╝██║     ███████║███████║   ██║       ██║   ██║██║  ██║██║   ██║██╔██╗ ██║    ██╔████╔██║██║     ██████╔╝
 ██║   ██║██╔══██╗██║     ██╔══██║██╔══██║   ██║       ██║   ██║██║  ██║██║   ██║██║╚██╗██║    ██║╚██╔╝██║██║     ██╔═══╝
 ╚██████╔╝██║  ██║╚██████╗██║  ██║██║  ██║   ██║       ╚██████╔╝██████╔╝╚██████╔╝██║ ╚████║    ██║ ╚═╝ ██║╚██████╗██║
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝        ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝    ╚═╝     ╚═╝ ╚═════╝╚═╝
```

# VRChat Udon MCP

[![Version](https://img.shields.io/badge/version-2.2.6-blue.svg)](https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-purple.svg)](https://modelcontextprotocol.io)

**MCP server for VRChat UdonSharp development** — exposes the [agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon) knowledge base and [LCGUdonSharp](https://github.com/LogicCuteGuy/LCGUdonSharp) compiler support to AI assistants via the [Model Context Protocol](https://modelcontextprotocol.io).

Version 2.2.6 updates the documentation baseline to [LCGUdonSharp 0.3.10](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.10): late-join snapshot recovery, zone ownership repair after disconnects, batched object motion, packet-binding recovery after domain reload, and native/LCG networking examples.

LCGUdonSharp 0.3.10 installs a pinned, embedded [SBP compatibility 1.21.26](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/sbp-compatibility-1.21.26) dependency before Unity compiles scripts to prevent the VRChat SDK `ExtensionMethods` collision. It is based on Unity SBP 1.21.25, preserves upstream source/GUIDs and the Unity Companion License, disables editor DLL auto-references, and survives Library regeneration. VCC/ALCOM installs this dependency through VPM. For manual installation, close Unity and extract both `com.logiccuteguy.lcgudonsharp-0.3.10.zip` into `Packages/com.logiccuteguy.lcgudonsharp` and `com.unity.scriptablebuildpipeline-1.21.26.zip` into `Packages/com.unity.scriptablebuildpipeline`. Local package references also require the embedded SBP dependency.

LCGUdonSharp 0.3.10 bakes Unity Localization String/Asset Tables into Udon for local language selection, regional/default fallbacks, dropdowns, and change callbacks. Text, sprites, textures, audio, and prefab variants are supported. Smart Strings support scalar variables, numeric formatting, choose, and supported plural forms—not the full Unity syntax; unsupported syntax fails validation before build. Dependencies: Unity Localization 1.4.5 and Scriptable Build Pipeline 1.21.26. English/Thai/Japanese examples and legacy JSON tools are included. See the [Unity Localization setup](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.10/Example/Localization/UnityLocalization.md). Language choice is local, not persisted; assets are baked into the world, not loaded through Addressables.

LCGUdonSharp 0.3.10 bakes Inspector-assigned custom `ScriptableObject` assets into read-only Udon snapshots, including nested scalar/array references and derived assets assigned to base types. Runtime type tags support `is`, declaration patterns, `as`, and checked explicit casts. Inherited fields, Inspector assignments, and defensive array copies are preserved. Cyclic graphs and nesting beyond 128 assets are rejected; field writes, properties/methods, runtime creation, synced snapshots, and unsupported casts remain unsupported. Import optional examples after compiler setup for the [shop and equipment guide](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.10/Example/ScriptableObjects/README.md). Rebuild all Udon programs and rebake scene/prefab data after upgrading: snapshot type tags and field layouts changed.

Upgrade LCGUdonSharp using VCC/ALCOM or the named `com.logiccuteguy.lcgudonsharp-0.3.10.zip` + `com.unity.scriptablebuildpipeline-1.21.26.zip` release asset; GitHub source archives are developer checkouts. Let Unity finish setup, recompile UdonSharp programs, and rebuild worlds: older builds cannot decode the new motion batch envelope. Manual packet networking remains experimental, and native sync passthrough remains instance-wide.

Point `LCG_UDONSHARP_PATH` at the updated local package and restart the MCP to refresh compiler metadata and search. `validate_code` performs static rule checks; it does not verify Unity compilation, late-join recovery, or network throughput.

---

## 🌐 Documentation

| Language | README | Description |
|----------|--------|-------------|
| 🇺🇸 **English** | [docs/README.en.md](docs/README.en.md) | Full guide — installation, MCP setup, tools |
| 🇪🇸 **Español** | [docs/README.es.md](docs/README.es.md) | Guía completa en español |
| 🇫🇷 **Français** | [docs/README.fr.md](docs/README.fr.md) | Guide complet en français |
| 🇯🇵 **日本語** | [docs/README.ja.md](docs/README.ja.md) | 日本語の完全ガイド |
| 🇰🇷 **한국어** | [docs/README.ko.md](docs/README.ko.md) | 한국어 전체 가이드 |
| 🇹🇭 **ไทย** | [docs/README.th.md](docs/README.th.md) | คู่มือภาษาไทยฉบับเต็ม |

---

## What is this?

`vrchat-udon-mcp` is a **stdio MCP server** that indexes, searches, and validates UdonSharp documentation from the `agent-skills-vrc-lcg-udon` repository at runtime. No hardcoded docs — the remote repo is the single source of truth.

| | |
|---|---|
| **20 MCP tools** | Search, explain, validate, compiler inspection, templates, SDK matrix |
| **Dynamic resources** | Skills, rules, cheatsheets, templates |
| **Live indexing** | MiniSearch with weighted ranking + file watcher |
| **IDE support** | Cursor, Claude Desktop, ChatGPT Desktop |

Set `LCG_UDONSHARP_PATH` to your local `com.logiccuteguy.lcgudonsharp` package directory to enable compiler indexing. Personal absolute paths do not belong in the tracked configuration.

---

## Quick start

**Install into Cursor MCP config** (portable `npx` entry, merge-safe):

```bash
npx -y github:LogicCuteGuy/vrchat-lcg-udon-mcp -- install
```

Then **Refresh MCP** in Cursor. Optional: add `--claude` for Claude Desktop.

**Develop from source:**

```bash
git clone https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git
cd vrchat-lcg-udon-mcp
pnpm install
pnpm update-docs && pnpm build-index && pnpm build
pnpm start
```

See [docs/mcp-config.example.json](docs/mcp-config.example.json) and the language READMEs for workspace, `npx`, global install, submodule, and git dependency options.

---

## Table of contents

- [Documentation](#-documentation)
- [What is this?](#what-is-this)
- [Quick start](#quick-start)
- [Screenshots](#screenshots)
- [Contributing](CONTRIBUTING.md)
- [License](#license)

---

## Screenshots

> Placeholder — add screenshots of MCP tools in Cursor, search results, or validation output here.

| MCP connected in Cursor | `search_documentation` results |
|-------------------------|--------------------------------|
| _Screenshot pending_    | _Screenshot pending_           |

---

## License

[MIT](LICENSE) — Documentation, skills, LCGUdonSharp, and MCP server by [LogicCuteGuy](https://github.com/LogicCuteGuy).
