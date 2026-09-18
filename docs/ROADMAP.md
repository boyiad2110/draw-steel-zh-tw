# Roadmap

Roadmap 是開發順序，不是固定日期承諾。每個 Batch 在前一批驗收後再細化。

## Batch 001 — Project Foundation

建立專案契約、產品範圍、source/license policy、architecture、content/translation model、development workflow 與 test strategy。

**Exit:** 後續 contributor 不需要依賴聊天紀錄就能理解專案核心規則。

## Batch 002 — Content Platform

建立 TypeScript / schema foundation、canonical YAML layout、translation layout、source lock 與最小 validation pipeline。用一小組真實 Heroes / Rules Reference entity 驗證 schema，不一次 migration 全書。

**Exit:** 一小批 canonical + zh-TW content 可被穩定 parse、validate、build。

## Batch 003 — Rules Reference MVP

完成 `DrawSteelRulesReferenceV1.pdf` 範圍的 structured content、繁中翻譯、Browse、Search、Deep Link 與 cross-reference。

**Exit:** 團員可在遊戲中以手機或桌面快速找到 Reference V1 規則。

## Batch 004 — Character Builder Level 1

導入 Heroes Level 1 所需內容並完成純 Character Domain、創角 UI、validation 與第一批 golden characters。

**Exit:** 可建立並保存規則合法的 Level 1 hero。

## Batch 005 — Advancement Level 2

實作 1 → 2 progression、升級 choice、重算與 Level 2 golden fixtures。

**Exit:** Level 1 角色可合法升至 Level 2，舊 choice 保留且結果可重算。

## Batch 006 — Sharing

完成 Local-first persistence、JSON import/export、share URL 與完整 round-trip e2e。

**Exit:** `Create Lv1 → Save → Reload → Lv2 → Export → Import` 一致。

## Later

- Summoner / Beastheart 以獨立 content batch 導入。
- Level 3–10 在 1→2 progression 模型驗證後才擴充。
- 帳號、cloud sync、DSC interoperability、PWA 等只有在實際使用需求出現時再評估。
