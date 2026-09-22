# VRChat Udon MCP

VRChat の UdonSharp 開発向けに、[agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon) リポジトリを [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 経由で公開するサーバーです。

**`agent-skills-vrc-lcg-udon` が唯一の情報源（ソース・オブ・トゥルース）です。** この MCP はドキュメントをハードコードせず、リポジトリの内容を動的にインデックス化・検索・検証します。

[← トップページ](../README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [한국어](README.ko.md) · [ไทย](README.th.md)

---

## 目次

- [機能](#機能)
- [必要条件](#必要条件)
- [インストール](#インストール)
- [設定](#設定)
- [リポジトリの同期](#リポジトリの同期)
- [使い方](#使い方)
- [MCP 連携](#mcp-連携)
- [MCP ツール一覧](#mcp-ツール一覧)
- [MCP リソース](#mcp-リソース)
- [アーキテクチャ](#アーキテクチャ)
- [スクリプト](#スクリプト)
- [クレジット](#クレジット)
- [ライセンス](#ライセンス)

---

## 機能

- ナレッジリポジトリと任意のローカルコンパイラー向け **20 個の MCP ツール**
- [LCGUdonSharp 0.3.1](https://github.com/LogicCuteGuy/LCGUdonSharp) 対応 — インターフェース、async、`await`、ジェネリクス、`LCGPacket` を検証
- **動的 MCP リソース** — skills、rules、cheatsheets、templates、SDK マトリクス
- `skills/`、`rules/`、`references/`、`templates/`、`hooks/`、`assets/` の再帰的インデックス化
- MiniSearch による重み付き検索：見出し > タイトル > 本文
- リポジトリのルール（テーブル + hooks）によるコード検証
- ファイルウォッチャーによるインデックスの自動再構築
- リモートドキュメントリポジトリの git 同期
- Strict TypeScript、Vitest、ESLint、Prettier

---

## 必要条件

| 依存関係 | バージョン |
|----------|------------|
| **Node.js** | 22 以上 |
| **pnpm** | 9 以上 |
| **git** | 最新版（ドキュメント同期用） |

---

## インストール

```bash
git clone https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git
cd vrchat-lcg-udon-mcp
pnpm install
pnpm update-docs    # agent-skills-vrc-lcg-udon を clone / 更新
pnpm build-index    # 検索インデックスを構築
pnpm build
```

---

## 設定

プロジェクトルートの `config.json` を編集します：

```json
{
  "repository": {
    "url": "https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon",
    "path": "./agent-skills-vrc-lcg-udon",
    "branch": "dev"
  },
  "compiler": {
    "profile": "lcgudonsharp",
    "packagePath": null
  },
  "sdkVersion": "3.10.5",
  "language": "ja",
  "watch": true,
  "indexPath": "./data/indexes",
  "search": {
    "fuzzy": 0.2,
    "headingWeight": 3.0,
    "titleWeight": 2.5,
    "exampleWeight": 1.5,
    "ruleWeight": 2.0,
    "skillWeight": 2.5,
    "cheatsheetWeight": 2.5,
    "maxResults": 20
  }
}
```

| フィールド | 説明 |
|------------|------|
| `repository.url` | ソースリポジトリの URL |
| `repository.path` | クローン先のローカルパス |
| `repository.branch` | 同期するブランチ |
| `compiler.profile` | 検証プロファイル：`upstream` または `lcgudonsharp` |
| `compiler.packagePath` | コンパイラーツールが索引化する任意のローカルパッケージ |
| `sdkVersion` | フィルタ用のデフォルト SDK バージョン |
| `watch` | ファイル変更時にインデックスを再構築 |
| `indexPath` | 永続化インデックスの保存先 |

別の設定ファイルには `UDON_MCP_CONFIG` を使用できます。`LCG_UDONSHARP_PATH` をローカルの `com.logiccuteguy.lcgudonsharp` パッケージに設定してください。`compiler.packagePath` は非追跡のプライベート設定でも使用できます。

---

## リポジトリの同期

```bash
# agent-skills-vrc-lcg-udon を clone / 更新し、インデックスを再構築
pnpm update-docs

# インデックスのみ再構築（git pull なし）
pnpm build-index
```

デフォルトでは `./agent-skills-vrc-lcg-udon` にクローンされます。新規ファイルはコード変更なしで自動的にインデックス化されます。

---

## 使い方

```bash
pnpm start      # MCP サーバー起動（stdio）
pnpm dev        # ホットリロード付き開発モード
pnpm test       # Vitest テスト実行
```

---

## MCP 連携

> **MCP 設定で `C:\Users\あなたの名前\...` のような絶対パスは使わないでください。**
> ポータブルではなく、ユーザー名が露出し、プロジェクト移動時に壊れます。
> ワークスペース相対パス、`npx` 経由の GitHub 取得、グローバルインストールを推奨します。

MCP を接続する前に、少なくとも一度実行してください：

```bash
pnpm update-docs && pnpm build-index && pnpm build
```

### オプション A — ローカルワークスペース（`docs/mcp-config.example.json`）

このリポジトリを開発する場合に推奨。[mcp-config.example.json](mcp-config.example.json) を IDE の MCP 設定にコピー：

```json
{
  "mcpServers": {
    "vrchat-udon": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"]
    }
  }
}
```

`"./dist/index.js"` も利用可能です。Cursor はワークスペース相対でパスを解決します。

### オプション B — GitHub から `npx`（手動 clone 不要）

ローカルパス不要。`npx` がリポジトリを取得し、`prepare`（TypeScript コンパイル）後にバイナリを起動：

```json
{
  "mcpServers": {
    "vrchat-udon": {
      "command": "npx",
      "args": ["-y", "github:LogicCuteGuy/vrchat-lcg-udon-mcp"]
    }
  }
}
```

pnpm の場合：`pnpm dlx github:LogicCuteGuy/vrchat-lcg-udon-mcp`

**注意：** 初回はコンパイルのため時間がかかります。サーバーは初回起動時に `agent-skills-vrc-lcg-udon` をパッケージ済み `config.json` の隣（npx キャッシュ内）へ自動 clone し、検索インデックスを再構築します。ローカル開発では `pnpm update-docs` を推奨します。

### オプション C — グローバルインストール

```bash
git clone https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git
cd vrchat-lcg-udon-mcp
pnpm install && pnpm update-docs && pnpm build-index && pnpm build
pnpm link --global
```

```json
{
  "mcpServers": {
    "vrchat-udon": {
      "command": "vrchat-udon-mcp"
    }
  }
}
```

グローバル link なし：`"command": "pnpm", "args": ["exec", "vrchat-udon-mcp"]`（リポジトリディレクトリから）

### オプション D — VRChat プロジェクトに git サブモジュール

```bash
git submodule add https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git tools/vrchat-lcg-udon-mcp
cd tools/vrchat-lcg-udon-mcp && pnpm install && pnpm update-docs && pnpm build-index && pnpm build
```

```json
{
  "mcpServers": {
    "vrchat-udon": {
      "command": "node",
      "args": ["${workspaceFolder}/tools/vrchat-lcg-udon-mcp/dist/index.js"]
    }
  }
}
```

### オプション E — git 依存関係

```bash
pnpm add github:LogicCuteGuy/vrchat-lcg-udon-mcp
```

```json
{
  "mcpServers": {
    "vrchat-udon": {
      "command": "npx",
      "args": ["vrchat-udon-mcp"]
    }
  }
}
```

### Cursor

**Cursor Settings → MCP** に上記いずれかを貼り付け。Windows のユーザー名を含む絶対パスは避けてください。

### Claude Desktop

Windows: `%APPDATA%\Claude\claude_desktop_config.json`  
macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

本番はオプション B・C・E、ローカル開発はオプション A。

### ChatGPT Desktop

上記いずれかで stdio MCP サーバーを設定（Windows ユーザー名入り絶対パスは非推奨）。

---

## MCP ツール一覧

| ツール | 説明 |
|--------|------|
| `compiler_info` | 設定済みコンパイラーのメタデータ、対象 SDK、機能を表示 |
| `search_compiler` | 設定済みコンパイラーの README、例、C# ソースを検索 |
| `search_documentation` | ドキュメント全体のキーワード / ファジー検索 |
| `explain_topic` | パス・見出し・行番号付きの説明 |
| `list_skills` | 全 skill の自動検出 |
| `read_skill` | SKILL.md（メタデータ、rules、references、templates） |
| `list_rules` | UdonSharp ルール一覧 |
| `read_rule` | 制約・例付きルールの読み取り |
| `search_reference` | `references/` 内検索 |
| `list_templates` | `.cs` テンプレート一覧 |
| `get_template` | 完全なソースコード付きテンプレート取得 |
| `validate_code` | リポジトリルールによるコード検証 |
| `explain_validation` | 失敗理由をソースルール付きで説明 |
| `sdk_matrix` | `templates/AGENTS.md` からの SDK バージョンマトリクス |
| `search_sdk_feature` | 機能検索（NetworkCallable、PlayerData など） |
| `search_constraints` | 制約検索（List、Coroutine など） |
| `search_networking` | ネットワーク・同期トピック |
| `search_examples` | コード例の検索 |
| `search_best_practice` | 推奨パターン |
| `search_antipattern` | 避けるべきアンチパターン |

---

## MCP リソース

| URI | 内容 |
|-----|------|
| `udon://skills/{id}` | 各 skill の SKILL.md |
| `udon://rules/{id}` | ルールファイル |
| `udon://sdk/matrix` | SDK バージョンマトリクス |
| `udon://templates/index` | テンプレートインデックス |
| `udon://cheatsheet/{id}` | skill ごとの CHEATSHEET.md |

---

## アーキテクチャ

```
agent-skills-vrc-lcg-udon/     ← ソース・オブ・トゥルース（git clone）
LCGUdonSharp package/           ← 任意のローカルコンパイラー文書とソース
        ↓
KnowledgeParser            ← 全ファイルを再帰的にインデックス化
        ↓
DocsRepository             ← data/indexes/ にインデックスを永続化
        ↓
SearchEngine (MiniSearch)  ← 重み付き検索
RuleParser                 ← hooks/ と rules/ テーブルからルール解析
        ↓
MCP Tools (20)             ← AI エージェント向けインターフェース
```

---

## スクリプト

| スクリプト | 説明 |
|------------|------|
| `pnpm build` | TypeScript コンパイル |
| `pnpm start` | MCP サーバー起動 |
| `pnpm test` | Vitest テスト |
| `pnpm update-docs` | ソースリポジトリの git clone / pull |
| `pnpm build-index` | 検索インデックス再構築 |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

---

## クレジット

- ドキュメントと skills: [LogicCuteGuy/agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon)
- LCGUdonSharp と MCP サーバー: [LogicCuteGuy](https://github.com/LogicCuteGuy)

---

## ライセンス

MIT
