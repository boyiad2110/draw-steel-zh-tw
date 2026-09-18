# Product Requirements — 英雄爭鋒

## 1. Product statement

《英雄爭鋒》是給台灣 Draw Steel 玩家與 GM 使用的繁中輔助網站。主要服務專案擁有者自己的團員，也可分享至個人社群；不是以大型公開平台或商業服務為首要目標。

## 2. MVP outcomes

### Character Builder

玩家可以建立符合專案 pin 住之 Heroes 規則的 1 級角色，保存後升到 2 級，並在任何階段得到明確的完成狀態與規則合法性。

MVP 必須支援：

- Heroes 的 1 級創角所需角色選項。
- 1 → 2 級 advancement。
- 選項可用性、前置條件與衝突驗證。
- 衍生數值重算。
- 本機保存。
- JSON 匯出／匯入。
- 可分享的角色連結；不依賴帳號系統。
- 角色資料帶有 schema / rules / content version，避免無法判斷舊角色來源。

### Rules Reference

玩家與 GM 可以快速找到 `DrawSteelRulesReferenceV1.pdf` 範圍內的規則，而不用翻 PDF。

MVP 必須支援：

- 分類瀏覽。
- 中英文搜尋與 alias。
- 穩定 deep link。
- 規則條目間 cross-reference。
- 手機與桌面可讀。
- 顯示適用的規則版本／來源資訊。

## 3. Explicit non-goals

第一個產品週期不做：

- Level 3–10 progression。
- Summoner / Beastheart playable content。
- 帳號、登入、雲端同步與角色資料庫。
- DSC character import/export。
- Encounter / monster builder。
- VTT、骰子、Campaign 管理。
- AI / RAG 規則問答。
- 完整 Heroes 網頁閱讀器；Rules Reference MVP 不超出 Reference V1 的範圍。

## 4. UX principles

- Builder 是 task flow；Rules Reference 是 information retrieval。兩者不強迫使用同一 UI pattern。
- 規則名可顯示繁中與英文，搜尋必須能以兩者找到同一 entity。
- 錯誤要可理解：不要只回傳 `invalid`，應指出哪個選擇缺少條件或造成衝突。
- 角色卡上的 rule / ability / condition 應能連到對應規則頁。

## 5. Character lifecycle acceptance

Character Engine MVP 只有在以下 round trip 通過後才算完成：

`Create Lv1 → Save → Reload → Advance to Lv2 → Export → Import → Recalculate`

匯入後的來源選擇、能力、特徵、衍生數值與 validation 結果必須與匯出前一致。

## 6. Quality bar

- 不能因 UI 顯示正常就視為規則正確。
- Mechanical changes 必須可追溯來源。
- 角色合法性與衍生計算必須有 automated tests。
- 重要職業／build 需有人工確認的 golden character fixtures。
- 翻譯正式發布前需為 `APPROVED`。
