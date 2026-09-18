# Development Workflow

## 1. Batch model

專案以小型、可驗收的 Batch 推進。每個 Batch 應有單一主要成果，避免同時修改 content model、UI、翻譯與部署而難以 review。

Reviewer 的正式操作流程以 `skills/project-review/SKILL.md` 為準；本文件只描述專案層級的開發節奏，不維護第二套 Reviewer 規則。

## 2. Task lifecycle

一般 Agent Batch：

```text
Requirement / Owner decision
→ Reviewer fixes Batch Contract
→ Agent Stage 1 implementation
→ exact remote HEAD
→ Reviewer two-pass review
→ focused correction if needed
→ PR / CI / manual gate
→ merge
→ verify main
→ STOP
```

聊天中的決策若會影響實作，Reviewer 必須先把它固化到 Agent 可讀的 Batch Contract、Issue、ADR 或權威文件，不能要求 Agent 猜對話脈絡。

## 3. Context strategy

預設順序：

`AGENTS.md → project-review Skill（Reviewer）→ task-specific Skill → relevant schema/content/source → implementation → validation`

Agent 不應因為 task 與 Draw Steel 有關，就一次讀完整規則書、全部 DSC YAML 或整個 repo。

Reviewer core 不內建所有 domain 規則；翻譯、Character Rules、content migration 等專業流程只在任務需要時載入。

## 4. Batch Contract

需要 Agent repository mutation 的 Batch，在第一次 write 前至少固定：

- Goal。
- Authority。
- exact Base。
- In scope / Out of scope。
- Acceptance。
- Risk Level / Risk Tags。
- Manual acceptance requirement。
- Git permission。
- Report。
- Stop。

推薦直接使用 `skills/project-review/SKILL.md` 的 task template。

## 5. Branch / PR policy

- `main` 維持可理解、可建置的狀態。
- 一般功能、資料 migration 與規格變更使用 branch + PR。
- Agent Stage 1 預設可建立／修改／測試／normal commit／push feature branch，但不可自行 merge `main`。
- 是否允許 Agent 在 Stage 1 開 PR，由 Batch Contract 決定；預設 Reviewer 先 review exact remote HEAD。
- 純小型 administrative change 可由 owner 決定直接更新，但不作預設。
- PR 優先 squash merge，讓 Batch 成為清楚的一個 history unit。

PR 至少回答：

- 這批解決什麼？
- 規則／資料來源是什麼？
- 有哪些風險？
- 跑了哪些 fresh verification？
- 哪些東西刻意留到下一批？

## 6. Risk-matched verification

不同變更不需要相同驗證成本：

- Docs-only：diff / link / consistency review；不要求 full app test。
- Translation-only：schema + glossary/style + affected content validation。
- Canonical data / importer：schema + referential integrity + affected fixtures。
- Character rule / calculation：unit + source evidence + affected golden characters；必要時完整 domain suite。
- Build / framework / routing：typecheck + build + targeted e2e。
- Persistence / migration / schema：round trip / compatibility / integrity evidence。
- Release-sensitive / cross-cutting：完整 relevant CI。

不要把「本機全套 + CI 全套」當每一個小改動的固定儀式。若 required CI 已在 exact PR HEAD 執行昂貴完整 gate，Stage 1 以本批風險的 targeted evidence 為優先。

任何 required evidence 都必須來自最後一次受影響 tracked change 後的狀態。

## 7. Review and correction

Reviewer 先做兩個 pass：

1. **Contract / Scope**：確認做的是核准的事情、沒有漏 Acceptance 或擴 scope。
2. **Correctness / Evidence**：確認規則／資料／程式正確，且 evidence 真能支持 claim。

Findings 分為 Blocker、Non-blocking Observation、User Decision。

有 Blocker 時只做 focused correction，不順手重構或加入下一批。相同成果最多兩輪完整 Review；第二輪仍有結構性 blocker 時停止 patch loop，重評方案。

## 8. Source upgrades

上游升版本身視為獨立 Batch：

1. 更新 pinned source。
2. 產生 meaningful diff。
3. 更新 canonical data。
4. 將受影響翻譯標為 `STALE`。
5. 更新／新增 regression fixtures。
6. 完成 validation 後才 merge。

## 9. AI contributions

AI Agent 可執行大量工作，但不能用「測試有過」取代規則理解。Agent report 不是獨立 evidence；Reviewer 應依風險核對 actual diff、source、tests、CI 與 exact HEAD。

Reviewer 對 merge 的規則正確性與可維護性負最終責任；Owner 保留產品 scope、重大規則／資料取捨與正式翻譯決策權。
