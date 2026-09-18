# Source and License Policy

## 1. Purpose

本文件定義哪些來源可以決定規則、哪些資料可以進入網站，以及每次上游更新如何保持可追溯性。

## 2. Source precedence

由高到低：

1. 專案目前 pin 住的正式 Draw Steel 規則書版本。
2. 明確適用於該版本的 MCDM 官方 errata / clarification。
3. `DrawSteelRulesReferenceV1.pdf`，限 Rules Reference MVP 的範圍與摘要結構。
4. `VerisimLLC/draw-steel-data`，作 machine-readable content 與結構參考。
5. `VerisimLLC/draw-steel-codex`，作 implementation / character-builder behavior 參考。
6. 第三方網站與粉絲工具，只作 UX / research 參考。

任何低順位來源不得無聲覆蓋高順位來源。

## 3. Pinned sources

Batch 002 起建立 machine-readable source lock，至少記錄：

- 規則書名稱與專案使用版本。
- `draw-steel-data` commit SHA。
- `draw-steel-codex` commit SHA。
- Rules Reference 版本／檔案識別。
- 必要時記錄官方 errata 版本或存取日期。

不得在 production build 自動抓 upstream `latest`。

## 4. Provenance

會影響玩法的 canonical entity 應能追溯至來源。最低要求為 entity / batch 層級記錄 source document + source version；需要精確稽核時再增加 page/section/source id。

不要在每個 UI component 重複塞 citation。來源資訊屬 content/provenance layer。

## 5. DRAW STEEL Creator License

截至 2026-06-09 的 MCDM DRAW STEEL Creator License 明確涵蓋列出的 Draw Steel documents，包括 Draw Steel: Heroes、Draw Steel: Monsters、The Beastheart for Draw Steel 與 The Summoner，並允許在遵守條款時重用與引用相關文字、mechanics 與 game rules。

官方 License：

https://www.mcdmproductions.com/draw-steel-creator-license

專案網站必須顯示以下聲明：

> 英雄爭鋒 is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2026 MCDM Productions, LLC.

License 可能更新；在新增新的 MCDM content source 前，應重新確認當時適用版本。

## 6. Asset restrictions

Creator License 對文字／規則的允許不等於整個官方 repo 或產品資產都可重新發布。

預設禁止提交或發布：

- 書內官方美術與頁面截圖。
- MCDM logo 或 DRAW STEEL logo，除非另有明確書面授權。
- 未另行授權的字型、border treatment、background、版面設計資產。
- `draw-steel-data` 中的 image、audio、map 等資產，除非個別確認有合法授權。

Import pipeline 必須採 allowlist，而不是 mirror entire upstream repository。

## 7. Source conflict handling

遇到規則書、Rules Reference、DSC data/code 結果不一致時：

1. 記錄差異。
2. 依 source precedence 決定網站行為。
3. 加入 regression fixture 或 issue，避免日後被 DSC 更新無意覆寫。
4. 若高順位來源本身不明確，不自行補規則；標記待人工裁決。
