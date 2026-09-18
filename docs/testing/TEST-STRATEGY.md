# Test Strategy

## 1. Primary risk

本專案最高風險不是畫面跑版，而是網站產生一個看似正常、實際不符合規則的角色，或速查內容與 pin 住的正式規則不一致。

因此測試優先順序是：

`schema → reference integrity → domain rules → golden characters → critical e2e → visual polish`

## 2. Content validation

最低自動檢查：

- schema validity。
- unique stable IDs。
- cross-reference target existence。
- source metadata presence for mechanical content。
- translation stable ID 對得上 canonical entity。
- `APPROVED` translation 的 source hash 未過期。

## 3. Character domain tests

需要針對：

- choice availability。
- prerequisite / exclusion。
- effects aggregation。
- derived values。
- Level 1 completeness。
- 1 → 2 advancement legality。
- serialize / deserialize round trip。
- version mismatch behavior。

Domain tests 不應依賴 browser UI。

## 4. Golden characters

建立一小組人工依規則書確認的角色 fixture，涵蓋不同 ancestry / class / kit / advancement pattern。

每個 fixture 至少記錄：

- pinned source version。
- explicit choices。
- expected level。
- expected characteristics / key derived values。
- expected features / abilities / resources。

只要 Character Engine 改動造成 golden output 變更，就必須解釋是 bug fix、source upgrade 或 regression。

## 5. Level 2 acceptance fixture

MVP 至少有一個完整 round trip fixture：

`Create Lv1 → calculate → serialize → deserialize → advance to Lv2 → calculate → serialize → deserialize`

第二次 deserialize 後結果必須與升級後角色一致。

## 6. Rules Reference tests

- route / stable slug 不應因翻譯名稱微調而任意破壞。
- cross-reference 不得 dangling。
- 中英文與 alias 可搜尋到預期 entity。
- build 不應輸出超出 allowlist / MVP scope 的上游資產。

## 7. E2E

Playwright 只覆蓋高價值 journey，不用把每個 rule unit case 重複在 UI 測一遍。

優先 journey：

1. 建立合法 Level 1 hero。
2. 保存、重新載入。
3. 升到 Level 2。
4. JSON export/import。
5. 從角色 ability / condition deep-link 到 Rules Reference。

## 8. Verification policy

採 risk-matched verification。CI 應讓高風險規則變更更嚴格，但不應讓 docs-only PR 為了形式跑不相干的昂貴 suite。
