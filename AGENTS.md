# AGENTS.md

本檔是《英雄爭鋒》repo 的專案級執行契約。所有人類 contributor 與 AI Agent 在修改內容、規則或程式碼前都應先讀取本檔。

## 1. Product scope

- MVP 有兩個主要功能：角色建立／升級，以及規則速查。
- 第一個 Character Builder 產品週期只支援 Heroes 的 1 級創角與 1 → 2 級升級。
- Rules Reference MVP 嚴格以 `DrawSteelRulesReferenceV1.pdf` 的內容範圍為主。
- MVP 不做帳號、雲端角色資料庫、Campaign 管理、VTT、DSC 匯出、Encounter Builder 或 AI 規則問答。

## 2. Rules authority

規則衝突時，依以下順位處理：

1. 專案目前 pin 住的正式 Draw Steel 規則書版本。
2. MCDM 官方 errata / clarification，僅在明確適用於目前 pin 住版本時使用。
3. `DrawSteelRulesReferenceV1.pdf`，作為速查範圍與摘要來源。
4. 官方 Draw Steel Codex 與 `draw-steel-data`，作為 machine-readable data、實作行為與交叉驗證參考。
5. 粉絲網站與第三方內容，只能作 UX / research 參考，不得作規則正典。

若規則書與 DSC 行為不同，規則書優先。不得靜默選邊；應留下來源與差異紀錄。

## 3. Architecture invariants

- UI 不擁有規則。不得把角色合法性、升級條件或衍生數值判斷散落在 React/Astro component。
- Canonical content 不擁有 UI。內容資料不得含特定 component、CSS 或頁面結構依賴。
- Character Engine 必須是可測試的純 domain layer：輸入角色選擇與內容，輸出可用選項、計算結果與 validation。
- 儲存的是角色的來源選擇與版本資訊；可衍生數值原則上由 engine 重算，不把計算結果當唯一真相。
- Canonical English content 與繁中 translation 分離，以穩定 ID 對應。
- 上游來源必須 pin 版本或 commit。禁止在 build/runtime 自動追蹤 upstream `latest`。

## 4. Content rules

- 不自行發明、補完或改寫 mechanical rule 來填空。
- 每個會影響玩法的 canonical entity 應可追溯到來源與來源版本。
- Import / generated data 一旦有正式 pipeline，禁止直接手改 generated output；應修 source mapping 或 canonical authoring source。
- 不把整個 DSC data repo 當成可直接發布的內容來源。只匯入產品需要且授權允許的 allowlisted content。
- 不提交官方 PDF、官方美術、官方 logo、未授權字型、音訊、地圖或其他不在 Creator License 可重用範圍內的資產。

## 5. Translation rules

- 繁中採台灣用語。
- 重要規則名、職業、能力等資料保留英文原名供搜尋與 cross-reference；顯示策略由 UI 決定。
- 正式發布內容必須達到 `APPROVED` 狀態。
- 上游英文來源改變時，既有翻譯不得自動視為仍有效；應依 source hash / version 標為 `STALE` 並重新檢查。
- 翻譯規則與術語細節放在 task-specific translation skill / style guide，不塞進本檔。

## 6. Development workflow

- 以小批、單一目的的 Batch 工作；預設 feature/docs branch + PR。
- Task 開始前先確認 scope、來源與驗收條件；不要順手擴 scope。
- Reviewer 在規劃 Batch、Agent handoff、PR review、correction 或 integration closeout 時，必須載入 `skills/project-review/SKILL.md`。
- 需要 Agent repository mutation 的 Batch，先固定 Batch Contract，再開始第一次 write。
- 驗證採 risk-matched verification，不要求每次文件小改都跑整套 e2e。
- 規則、schema、角色計算與 content pipeline 變更屬高風險，必須跑相對應 automated tests 與必要的 golden fixtures。
- PR 應描述來源、風險、驗證方式與任何刻意未處理事項。
- 若使用 AI 產生實作，最終變更仍需由人類 reviewer 能理解並承擔責任。

## 7. Context discipline

Agent 應遵守最小必要 Context：

`AGENTS.md → task-specific skill → relevant source/content → execution → validation`

Reviewer workflow 則是：

`AGENTS.md → skills/project-review/SKILL.md → task-specific skill → relevant evidence`

不要為單一 task 載入整套規則書或整個專案歷史。若只需要一個 class、rule 或 schema，就只讀相關資料。
