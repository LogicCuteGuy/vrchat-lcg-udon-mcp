# VRChat Udon MCP

เซิร์ฟเวอร์ [Model Context Protocol (MCP)](https://modelcontextprotocol.io) ที่เปิดเผยคลังความรู้ [agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon) และแพ็กเกจคอมไพเลอร์เฉพาะที่ (ไม่บังคับ) ให้ AI assistant ใช้งาน เพื่อพัฒนา UdonSharp ใน VRChat

**คลังเก็บ `agent-skills-vrc-lcg-udon` คือแหล่งข้อมูลจริงเพียงแหล่งเดียว (single source of truth)** — MCP นี้ไม่ได้ฝังเอกสารไว้ในโค้ด แต่จะทำดัชนี ค้นหา และตรวจสอบเอกสาร UdonSharp จากคลังดังกล่าวขณะรัน

[← กลับหน้าหลัก](../README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

---

## สารบัญ

- [คุณสมบัติ](#คุณสมบัติ)
- [ความต้องการของระบบ](#ความต้องการของระบบ)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า](#การตั้งค่า)
- [การซิงก์คลังเอกสาร](#การซิงก์คลังเอกสาร)
- [การใช้งาน](#การใช้งาน)
- [การเชื่อมต่อ MCP](#การเชื่อมต่อ-mcp)
- [เครื่องมือ MCP](#เครื่องมือ-mcp)
- [ทรัพยากร MCP](#ทรัพยากร-mcp)
- [สถาปัตยกรรม](#สถาปัตยกรรม)
- [สคริปต์](#สคริปต์)
- [เครดิต](#เครดิต)
- [ลิขสิทธิ์](#ลิขสิทธิ์)

---

## คุณสมบัติ

- **เครื่องมือ MCP 20 ตัว** ครอบคลุมคลังความรู้และแพ็กเกจคอมไพเลอร์เฉพาะที่ (ไม่บังคับ)
- เอกสาร MCP **2.2.5** อ้างอิง [LCGUdonSharp 0.3.9](https://github.com/LogicCuteGuy/LCGUdonSharp/releases/tag/0.3.9): การกู้คืน snapshot สำหรับผู้เล่นที่เข้าทีหลัง, การซ่อม ownership หลังผู้เล่นหลุด, การส่งการเคลื่อนที่ของวัตถุแบบ batch, การกู้คืน packet binding หลัง domain reload และตัวอย่างเครือข่าย native/LCG
- LCGUdonSharp 0.3.9 bake String/Asset Tables ของ Unity Localization ลง Udon รองรับการเลือกภาษาเฉพาะผู้เล่น fallback ภูมิภาค/ภาษาเริ่มต้น dropdown และ callback เมื่อเปลี่ยนภาษา ใช้กับข้อความ sprite texture audio และ prefab variant ได้ Smart Strings รองรับตัวแปร scalar รูปแบบตัวเลข choose และ plural ที่กำหนด ไม่ใช่ทุก syntax ของ Unity โดย syntax ที่ไม่รองรับจะถูกปฏิเสธก่อน build ต้องใช้ Unity Localization 1.4.5 และ Scriptable Build Pipeline 1.21.25 มีตัวอย่างอังกฤษ/ไทย/ญี่ปุ่นและเครื่องมือ JSON เดิม [คู่มือตั้งค่า](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/Localization/UnityLocalization.md) การเลือกภาษาเป็น local และไม่บันทึกข้ามการเข้า world ส่วน asset ถูก bake รวมใน world ไม่โหลดผ่าน Addressables
- ใน 0.3.9 custom `ScriptableObject` รองรับการอ้างอิง asset ซ้อนกันทั้งฟิลด์เดี่ยวและ array รวมถึง asset ชนิดลูกที่กำหนดให้ชนิดฐาน snapshot แบบอ่านอย่างเดียวใช้ runtime type tag รองรับ `is`, declaration pattern, `as` และ explicit cast แบบตรวจชนิด โดยรักษาฟิลด์ที่สืบทอด การกำหนดผ่าน Inspector และ defensive copy ของ array ระบบปฏิเสธกราฟวนซ้ำและการซ้อนเกิน 128 asset ส่วนการเขียน property/method การสร้างตอน runtime synced snapshot และ cast ที่ไม่รองรับยังใช้ไม่ได้ import ตัวอย่างเสริมหลังติดตั้งคอมไพเลอร์เสร็จ: [คู่มือร้านค้าและอุปกรณ์](https://github.com/LogicCuteGuy/LCGUdonSharp/blob/0.3.9/Example/ScriptableObjects/README.md) หลังอัปเดตต้อง rebuild โปรแกรม Udon ทั้งหมดและ rebake ข้อมูล scene/prefab เพราะ type tag และตำแหน่งฟิลด์ใน snapshot เปลี่ยนไป
- **ทรัพยากร MCP แบบไดนามิก** — สกิล กฎ เช็ตชีต เทมเพลต เมทริกซ์ SDK
- การทำดัชนีแบบเรียกซ้ำของ `skills/`, `rules/`, `references/`, `templates/`, `hooks/`, `assets/`
- MiniSearch พร้อมการจัดอันดับแบบถ่วงน้ำหนัก: หัวข้อ > ชื่อเรื่อง > เนื้อหา
- การตรวจสอบโค้ดจากกฎของคลังเอกสาร (ตาราง + ฮุก)
- ไฟล์วอตช์พร้อมสร้างดัชนีใหม่อัตโนมัติ
- ซิงก์คลังเอกสารรีโมตผ่าน git
- TypeScript เข้มงวด, Vitest, ESLint, Prettier

---

## ความต้องการของระบบ

| ความต้องการ | เวอร์ชัน |
|------------|---------|
| **Node.js** | 22+ |
| **pnpm** | 9+ |
| **git** | เวอร์ชันใหม่ใดก็ได้ (สำหรับซิงก์เอกสาร) |

---

## การติดตั้ง

```bash
git clone https://github.com/LogicCuteGuy/vrchat-lcg-udon-mcp.git
cd vrchat-lcg-udon-mcp
pnpm install
pnpm update-docs    # โคลน / อัปเดต agent-skills-vrc-lcg-udon
pnpm build-index    # สร้างดัชนีการค้นหา
pnpm build
```

---

## การตั้งค่า

แก้ไข `config.json` ที่รูทโปรเจกต์:

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
  "language": "en",
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

| ฟิลด์ | คำอธิบาย |
|-------|---------|
| `repository.url` | URL ของคลังเอกสารต้นทาง |
| `repository.path` | พาธในเครื่องของคลังที่โคลนไว้ |
| `repository.branch` | แบรนช์ที่จะซิงก์ |
| `compiler.profile` | โปรไฟล์ตรวจสอบ: `upstream` หรือ `lcgudonsharp` |
| `compiler.packagePath` | แพ็กเกจคอมไพเลอร์เฉพาะที่ (ไม่บังคับ) ที่เครื่องมือคอมไพเลอร์ทำดัชนี |
| `sdkVersion` | เวอร์ชัน SDK เริ่มต้นสำหรับตัวกรอง |
| `watch` | สร้างดัชนีใหม่เมื่อไฟล์ในคลังเปลี่ยน |
| `indexPath` | ไดเรกทอรีเก็บดัชนีถาวร |

คุณชี้ไปยังไฟล์ config อื่นได้ผ่าน `UDON_MCP_CONFIG` ตั้งค่า `LCG_UDONSHARP_PATH` ในสภาพแวดล้อม MCP ในเครื่องของคุณให้ชี้ไปที่ไดเรกทอรีแพ็กเกจคอมไพเลอร์ เพื่อไม่ให้พาธส่วนตัวแบบ absolute หลุดเข้าไปในไฟล์ที่ track ไว้ `compiler.packagePath` ยังใช้ได้สำหรับ config ส่วนตัวที่ไม่ได้ track

อัปเดต LCGUdonSharp 0.3.9 ผ่าน VCC/ALCOM หรือติดตั้งไฟล์แนบ release ชื่อ `com.logiccuteguy.lcgudonsharp-0.3.9.zip` ส่วน source archive ของ GitHub เป็นไฟล์สำหรับพัฒนา รอให้ Unity ตั้งค่าเสร็จ จากนั้นคอมไพล์โปรแกรม UdonSharp ใหม่และ rebuild world เพราะ build เก่าอ่านรูปแบบ motion batch ใหม่ไม่ได้ ระบบ manual packet networking ยังเป็น experimental และ native sync passthrough ยังส่งข้อมูลทั่วทั้ง instance

หลังอัปเดตแพ็กเกจในเครื่อง ให้เริ่ม MCP ใหม่เพื่อรีเฟรช `compiler_info` และ `search_compiler` เครื่องมือ `validate_code` ตรวจสอบกฎแบบ static เท่านั้น ไม่ได้ตรวจการคอมไพล์ใน Unity การกู้คืนของผู้เล่นที่เข้าทีหลัง หรือประสิทธิภาพเครือข่ายจริง

---

## การซิงก์คลังเอกสาร

```bash
# โคลนหรืออัปเดต agent-skills-vrc-lcg-udon แล้วสร้างดัชนีใหม่
pnpm update-docs

# สร้างดัชนีใหม่อย่างเดียว (ไม่ git pull)
pnpm build-index
```

คลังถูกโคลนไปที่ `./agent-skills-vrc-lcg-udon` โดยค่าเริ่มต้น ไฟล์ใหม่จะถูกทำดัชนีอัตโนมัติ — ไม่ต้องแก้โค้ด

---

## การใช้งาน

```bash
pnpm start      # เริ่มเซิร์ฟเวอร์ MCP (stdio)
pnpm dev        # โหมดพัฒนาพร้อม reload
pnpm test       # รันเทสต์ Vitest
```

---

## การเชื่อมต่อ MCP

### ติดตั้งด้วยคำสั่งเดียว (Cursor)

เขียน entry แบบพกพาไปที่ `~/.cursor/mcp.json` (หรือ `%USERPROFILE%\.cursor\mcp.json` บน Windows) โดยไม่ลบเซิร์ฟเวอร์อื่นออก:

```bash
npx -y github:LogicCuteGuy/vrchat-lcg-udon-mcp -- install
```

เพิ่ม `--claude` เพื่อติดตั้งให้ Claude Desktop ด้วย จากนั้น **Refresh MCP** ใน Cursor

> **อย่าใช้พาธ absolute** เช่น `C:\Users\your-name\...` ใน MCP config
> เพราะไม่พกพา เปิดเผยชื่อผู้ใช้ และพังเมื่อย้ายโปรเจกต์
> ควรใช้พาธแบบ relative กับ workspace, `npx` จาก GitHub หรือการติดตั้งแบบ global

ก่อนเชื่อมต่อ MCP อย่างน้อยหนึ่งครั้ง ให้รัน:

```bash
pnpm update-docs && pnpm build-index && pnpm build
```

### ตัวเลือก A — เวิร์กสเปซในเครื่อง (`docs/mcp-config.example.json`)

แนะนำเมื่อพัฒนา repo นี้ คัดลอก [mcp-config.example.json](mcp-config.example.json) ไปวางใน MCP settings ของ IDE:

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

`"./dist/index.js"` ก็ใช้ได้เช่นกัน — Cursor resolve พาธแบบ relative กับ workspace

### ตัวเลือก B — `npx` จาก GitHub (ไม่ต้องโคลนเอง)

ไม่ต้องมีพาธในเครื่อง `npx` จะดาวน์โหลด repo รัน `prepare` (คอมไพล์ TypeScript) แล้วเรียกไบนารี:

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

ถ้าใช้ pnpm: `pnpm dlx github:LogicCuteGuy/vrchat-lcg-udon-mcp`

**หมายเหตุ:** ครั้งแรกจะคอมไพล์โปรเจกต์และอาจใช้เวลาพอสมควร ครั้งแรกที่เริ่มเซิร์ฟเวอร์จะโคลน `agent-skills-vrc-lcg-udon` ข้าง `config.json` ที่แพ็กไว้ (npx cache) แล้วสร้างดัชนีการค้นหาใหม่อัตโนมัติ ไม่ต้องตั้ง `UDON_MCP_CONFIG` หรือพาธส่วนตัวใด ๆ สำหรับพัฒนาในเครื่อง `pnpm update-docs` ยังเป็นวิธีที่แนะนำในการอัปเดตเอกสาร

### ตัวเลือก C — ติดตั้งทั่วทั้งระบบ (global)

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

ถ้าไม่ link global: `"command": "pnpm", "args": ["exec", "vrchat-udon-mcp"]` จากไดเรกทอรี repo

### ตัวเลือก D — Git submodule ในโปรเจกต์ VRChat ของคุณ

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

### ตัวเลือก E — Git dependency

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

**Cursor Settings → MCP** — วางตัวเลือกใดก็ได้ด้านบน หลีกเลี่ยงพาธผู้ใช้ Windows แบบ absolute

### Claude Desktop

Windows: `%APPDATA%\Claude\claude_desktop_config.json`  
macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

ใช้ตัวเลือก B, C หรือ E สำหรับ production; ตัวเลือก A สำหรับพัฒนา repo ในเครื่อง

### ChatGPT Desktop

ตั้งค่าเซิร์ฟเวอร์ stdio MCP ด้วยตัวเลือกใดก็ได้ด้านบน (หลีกเลี่ยงพาธ absolute ที่มีชื่อผู้ใช้ Windows ของคุณ)

---

## เครื่องมือ MCP

| เครื่องมือ | คำอธิบาย |
|------|-------------|
| `compiler_info` | รายงานเมทาดาทาของแพ็กเกจคอมไพเลอร์ที่ตั้งค่า เป้าหมาย SDK และฟีเจอร์ที่รองรับ |
| `search_compiler` | ค้นหาใน README ตัวอย่าง และซอร์ส C# ของคอมไพเลอร์ที่ตั้งค่าไว้ |
| `search_documentation` | ค้นหาด้วยคีย์เวิร์ด / fuzzy ในเอกสารทั้งหมด |
| `explain_topic` | คำอธิบายพร้อมอ้างอิง (พาธ หัวข้อ หมายเลขบรรทัด) |
| `list_skills` | ค้นพบสกิลทั้งหมดอัตโนมัติ |
| `read_skill` | อ่าน SKILL.md พร้อมเมทาดาทา กฎ รีเฟอร์เรนซ์ เทมเพลต |
| `list_rules` | รายการกฎ UdonSharp |
| `read_rule` | อ่านกฎพร้อมข้อจำกัดและตัวอย่าง |
| `search_reference` | ค้นหาใน `references/` |
| `list_templates` | รายการเทมเพลต `.cs` |
| `get_template` | ดึงเทมเพลตพร้อมซอร์สโค้ดเต็ม |
| `validate_code` | ตรวจสอบโค้ดตามกฎของคลังเอกสาร |
| `explain_validation` | อธิบายผลที่ไม่ผ่าน พร้อมอ้างอิงกฎต้นทาง |
| `sdk_matrix` | เมทริกซ์เวอร์ชัน SDK จาก `templates/AGENTS.md` |
| `search_sdk_feature` | ค้นหาฟีเจอร์ (NetworkCallable, PlayerData ฯลฯ) |
| `search_constraints` | ค้นหาข้อจำกัด (List, Coroutine ฯลฯ) |
| `search_networking` | หัวข้อเครือข่ายและการซิงก์ |
| `search_examples` | ค้นหาตัวอย่างโค้ด |
| `search_best_practice` | รูปแบบที่แนะนำ |
| `search_antipattern` | แอนตี้แพตเทิร์นที่ควรหลีกเลี่ยง |

---

## ทรัพยากร MCP

| URI | เนื้อหา |
|-----|---------|
| `udon://skills/{id}` | SKILL.md ของแต่ละสกิล |
| `udon://rules/{id}` | ไฟล์กฎ |
| `udon://sdk/matrix` | เมทริกซ์เวอร์ชัน SDK |
| `udon://templates/index` | ดัชนีเทมเพลต |
| `udon://cheatsheet/{id}` | CHEATSHEET.md ต่อสกิล |

---

## สถาปัตยกรรม

```
agent-skills-vrc-lcg-udon/     ← แหล่งข้อมูลจริง (git clone)
LCGUdonSharp package/      ← เอกสารและซอร์สคอมไพเลอร์เฉพาะที่ (ไม่บังคับ)
        ↓
KnowledgeParser            ← ทำดัชนีไฟล์ทั้งหมดแบบเรียกซ้ำ
        ↓
DocsRepository             ← เก็บดัชนีใน data/indexes/
        ↓
SearchEngine (MiniSearch)  ← การจัดอันดับค้นหาแบบถ่วงน้ำหนัก
RuleParser                 ← กฎจากตารางใน hooks/ และ rules/
        ↓
MCP Tools (20)             ← อินเทอร์เฟซสำหรับ AI agent
```

---

## สคริปต์

| สคริปต์ | คำอธิบาย |
|--------|-------------|
| `pnpm build` | คอมไพล์ TypeScript |
| `pnpm start` | เริ่มเซิร์ฟเวอร์ MCP |
| `pnpm test` | เทสต์ Vitest |
| `pnpm update-docs` | git clone / pull คลังต้นทาง |
| `pnpm build-index` | สร้างดัชนีการค้นหาใหม่ |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |

---

## เครดิต

- เอกสารและสกิล: [LogicCuteGuy/agent-skills-vrc-lcg-udon](https://github.com/LogicCuteGuy/agent-skills-vrc-lcg-udon)
- LCGUdonSharp และเซิร์ฟเวอร์ MCP: [LogicCuteGuy](https://github.com/LogicCuteGuy)

---

## ลิขสิทธิ์

MIT
