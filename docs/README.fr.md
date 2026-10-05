# VRChat Udon MCP

Serveur [Model Context Protocol (MCP)](https://modelcontextprotocol.io) qui expose le dépôt [agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon) comme interface MCP pour le développement UdonSharp sur VRChat.

**Le dépôt `agent-skills-vrc-lcg-udon` est la seule source de vérité.** Ce MCP ne contient aucune documentation en dur : il indexe, recherche et valide dynamiquement tout le contenu du dépôt distant.

[← Page d'accueil](../README.md) · [English](README.en.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Synchronisation du dépôt](#synchronisation-du-dépôt)
- [Utilisation](#utilisation)
- [Intégration MCP](#intégration-mcp)
- [Outils MCP](#outils-mcp)
- [Ressources MCP](#ressources-mcp)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Crédits](#crédits)
- [Licence](#licence)

---

## Fonctionnalités

- **20 outils MCP** pour le dépôt de connaissances et un compilateur local facultatif
- MCP **2.2.5** utilise [LCGUdonSharp 0.3.9](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.9) comme référence documentaire : récupération des snapshots à l'arrivée tardive, réparation de propriété après déconnexion, mouvement des objets par lots, restauration des liaisons de paquets après rechargement du domaine et exemples réseau natifs/LCG
- LCGUdonSharp 0.3.9 bake les String/Asset Tables de Unity Localization dans Udon : choix local de langue, fallback régional/par défaut, listes déroulantes et callbacks. Texte, sprites, textures, audio et variantes de prefabs sont pris en charge. Smart Strings accepte variables scalaires, formats numériques, choose et pluriels compatibles, pas toute la syntaxe Unity ; les syntaxes non prises en charge échouent avant le build. Dépendances : Unity Localization 1.4.5 et Scriptable Build Pipeline 1.21.25. Exemples anglais/thaï/japonais et outils JSON historiques inclus. [Configuration](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/Localization/UnityLocalization.md). Le choix de langue est local et non persistant ; les assets sont inclus dans le monde, sans chargement Addressables.
- En 0.3.9, les assets `ScriptableObject` acceptent les références imbriquées scalaires/en tableaux et les assets dérivés assignés à des types de base. Les snapshots en lecture seule utilisent des tags de type pour `is`, les motifs de déclaration, `as` et les casts explicites vérifiés. Les champs hérités, affectations Inspector et copies défensives des tableaux sont préservés. Les cycles et imbrications dépassant 128 assets sont refusés ; écritures, propriétés/méthodes, création à l’exécution, snapshots synchronisés et casts non pris en charge restent exclus. Importez les exemples facultatifs après configuration : [boutique et équipement](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/ScriptableObjects/README.md). Reconstruisez tous les programmes Udon et rebakez les données des scènes/prefabs : les tags de type et la disposition des champs ont changé.
- **Ressources MCP dynamiques** — skills, règles, cheatsheets, templates, matrice SDK
- Indexation récursive de `skills/`, `rules/`, `references/`, `templates/`, `hooks/`, `assets/`
- Recherche MiniSearch avec pondération : titre de section > titre > corps
- Validation de code à partir des règles du dépôt (tableaux + hooks)
- File watcher avec reconstruction automatique de l'index
- Synchronisation git du dépôt de documentation
- TypeScript strict, Vitest, ESLint, Prettier

---

## Prérequis

| Dépendance | Version |
|------------|---------|
| **Node.js** | 22+ |
| **pnpm** | 9+ |
| **git** | version récente (sync doc) |

---

## Installation

```bash
git clone https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git
cd vrchat-lcg-udon-mcp
pnpm install
pnpm update-docs    # Clone / met à jour agent-skills-vrc-lcg-udon
pnpm build-index    # Construit l'index de recherche
pnpm build
```

---

## Configuration

Modifiez `config.json` à la racine du projet :

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
  "language": "fr",
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

| Champ | Description |
|-------|-------------|
| `repository.url` | URL du dépôt source |
| `repository.path` | Chemin local du clone |
| `repository.branch` | Branche à synchroniser |
| `compiler.profile` | Profil de validation : `upstream` ou `lcgudonsharp` |
| `compiler.packagePath` | Package local facultatif indexé par les outils compilateur |
| `sdkVersion` | Version SDK par défaut pour les filtres |
| `watch` | Reconstruire l'index à chaque modification |
| `indexPath` | Dossier de l'index persisté |

`UDON_MCP_CONFIG` permet de choisir un autre fichier. Définissez `LCG_UDONSHARP_PATH` vers le package local `com.logiccuteguy.lcgudonsharp` ; `compiler.packagePath` reste disponible pour les configurations privées non suivies.

Mettez à jour LCGUdonSharp 0.3.9 via VCC/ALCOM ou installez l'archive de release `com.logiccuteguy.lcgudonsharp-0.3.9.zip` ; les archives de code source GitHub sont destinées au développement. Laissez Unity terminer la configuration, recompilez les programmes UdonSharp et reconstruisez les mondes : les anciennes builds ne décodent pas les nouveaux lots de mouvement. Le réseau manuel par paquets reste expérimental ; le passthrough de synchronisation native reste à l'échelle de l'instance entière.

Redémarrez le MCP après la mise à jour du package local pour actualiser `compiler_info` et `search_compiler`. `validate_code` vérifie des règles statiques ; il ne valide ni la compilation Unity, ni la récupération à l'arrivée tardive, ni le débit réseau réel.

---

## Synchronisation du dépôt

```bash
# Cloner ou mettre à jour agent-skills-vrc-lcg-udon et reconstruire l'index
pnpm update-docs

# Reconstruire l'index uniquement (sans git pull)
pnpm build-index
```

Le dépôt est cloné dans `./agent-skills-vrc-lcg-udon` par défaut. Les nouveaux fichiers sont indexés automatiquement, sans modification du code.

---

## Utilisation

```bash
pnpm start      # Démarre le serveur MCP (stdio)
pnpm dev        # Mode développement avec rechargement
pnpm test       # Lance les tests Vitest
```

---

## Intégration MCP

> **N'utilisez pas de chemins absolus** du type `C:\Users\votre-nom\...` dans la config MCP.
> Ils ne sont pas portables, exposent votre nom d'utilisateur et cassent si vous déplacez le projet.
> Préférez les chemins relatifs au workspace, `npx` depuis GitHub, ou une installation globale.

Avant de connecter le MCP, exécutez au moins une fois :

```bash
pnpm update-docs && pnpm build-index && pnpm build
```

### Option A — Workspace local (`docs/mcp-config.example.json`)

Recommandé pour développer ce dépôt. Copiez [mcp-config.example.json](mcp-config.example.json) dans les paramètres MCP de votre IDE :

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

`"./dist/index.js"` fonctionne aussi — Cursor résout les chemins relatifs au workspace.

### Option B — `npx` depuis GitHub (sans clone manuel)

Aucun chemin local requis. `npx` télécharge le dépôt, exécute `prepare` (compile TypeScript) et lance le binaire :

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

Avec pnpm : `pnpm dlx github:LogicCuteGuy/vrchat-lcg-udon-mcp`.

**Note :** La première exécution compile le projet et peut prendre du temps. La documentation indexée reste nécessaire — `npx` ne clone pas `agent-skills-vrc-lcg-udon` automatiquement. Lancez `pnpm update-docs` si vous avez cloné le repo, ou configurez `UDON_MCP_CONFIG` vers un `config.json` avec la doc déjà synchronisée.

### Option C — Installation globale

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

Sans link global : `"command": "pnpm", "args": ["exec", "vrchat-udon-mcp"]` depuis le dossier du repo.

### Option D — Sous-module git dans votre projet VRChat

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

### Option E — Dépendance git

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

**Cursor Settings → MCP** — collez l'une des options ci-dessus. Évitez les chemins absolus Windows.

### Claude Desktop

Windows : `%APPDATA%\Claude\claude_desktop_config.json`  
macOS : `~/Library/Application Support/Claude/claude_desktop_config.json`

Options B, C ou E en production ; option A pour le développement local.

### ChatGPT Desktop

Configurez un serveur MCP stdio avec l'une des options ci-dessus (évitez les chemins absolus avec votre nom d'utilisateur Windows).

---

## Outils MCP

| Outil | Description |
|-------|-------------|
| `compiler_info` | Affiche les métadonnées, le SDK cible et les fonctions du compilateur configuré |
| `search_compiler` | Recherche dans le README, les exemples et le code C# du compilateur configuré |
| `search_documentation` | Recherche mot-clé / floue sur toute la documentation |
| `explain_topic` | Explication avec citations (chemin, section, numéros de ligne) |
| `list_skills` | Découverte automatique des skills |
| `read_skill` | Lit SKILL.md avec métadonnées, règles, références, templates |
| `list_rules` | Liste les règles UdonSharp |
| `read_rule` | Lit une règle avec contraintes et exemples |
| `search_reference` | Recherche dans `references/` |
| `list_templates` | Liste les templates `.cs` |
| `get_template` | Récupère un template avec le code source complet |
| `validate_code` | Valide le code selon les règles du dépôt |
| `explain_validation` | Explique un échec en citant la règle source |
| `sdk_matrix` | Matrice des versions SDK depuis `templates/AGENTS.md` |
| `search_sdk_feature` | Recherche de fonctionnalités (NetworkCallable, PlayerData, etc.) |
| `search_constraints` | Recherche de contraintes (List, Coroutine, etc.) |
| `search_networking` | Réseau et synchronisation |
| `search_examples` | Recherche d'exemples de code |
| `search_best_practice` | Patterns recommandés |
| `search_antipattern` | Anti-patterns à éviter |

---

## Ressources MCP

| URI | Contenu |
|-----|---------|
| `udon://skills/{id}` | SKILL.md de chaque skill |
| `udon://rules/{id}` | Fichiers de règles |
| `udon://sdk/matrix` | Matrice des versions SDK |
| `udon://templates/index` | Index des templates |
| `udon://cheatsheet/{id}` | CHEATSHEET.md par skill |

---

## Architecture

```
agent-skills-vrc-lcg-udon/     ← Source de vérité (git clone)
LCGUdonSharp package/           ← Documentation et code du compilateur local facultatif
        ↓
KnowledgeParser            ← Indexe récursivement tous les fichiers
        ↓
DocsRepository             ← Persiste l'index dans data/indexes/
        ↓
SearchEngine (MiniSearch)  ← Recherche avec pondération
RuleParser                 ← Règles depuis hooks/ et tableaux rules/
        ↓
MCP Tools (20)             ← Interface pour l'agent IA
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Démarre le serveur MCP |
| `pnpm test` | Tests Vitest |
| `pnpm update-docs` | git clone / pull du dépôt source |
| `pnpm build-index` | Reconstruit l'index de recherche |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

---

## Crédits

- Documentation et skills : [LogicCuteGuy/agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon)
- LCGUdonSharp et serveur MCP : [LogicCuteGuy](https://github.com/LogicCuteGuy)

---

## Licence

MIT
