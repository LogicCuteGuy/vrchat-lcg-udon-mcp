# Documentation index

Full guides for [**vrchat-lcg-udon-mcp 2.2.0**](https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp), with LCGUdonSharp 0.3.1 support, in six languages:

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
