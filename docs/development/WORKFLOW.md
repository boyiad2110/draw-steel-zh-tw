# Development Workflow

## 1. Batch model

專案以小型、可驗收的 Batch 推進。每個 Batch 應有單一主要成果，避免同時修改 content model、UI、翻譯與部署而難以 review。

## 2. Task lifecycle

```text
Requirement
→ define scope / source / acceptance
→ branch
→ load minimum required context
→ implement
→ risk-matched verification
→ PR
→ review
→ squash merge
```

## 3. Context strategy

預設順序：

`AGENTS.md → task skill → relevant schema/content/source → implementation → validation`

Agent 不應因為 task 與 Draw Steel 有關，就一次讀完整規則書、全部 DSC YAML 或整個 repo。

## 4. Branch / PR policy

- `main` 維持可理解、可建置的狀態。
- 一般功能、資料 migration 與規格變更使用 branch + PR。
- 純小型 administrative change 可由 owner 決定直接更新，但不作預設。
- PR 優先 squash merge，讓 Batch 成為清楚的一個 history unit。

PR 至少回答：

- 這批解決什麼？
- 規則／資料來源是什麼？
- 有哪些風險？
- 跑了哪些 verification？
- 哪些東西刻意留到下一批？

## 5. Risk-matched verification

不同變更不需要相同驗證成本：

- Docs-only：link / consistency review；不要求 full app test。
- Translation-only：schema + glossary/style + affected content validation。
- Canonical data / importer：schema + referential integrity + affected fixtures。
- Character rule / calculation：unit + affected golden characters；必要時完整 domain suite。
- Build / framework / routing：typecheck + build + targeted e2e。
- Release-sensitive / cross-cutting：完整 relevant CI。

不要把「本機全套 + CI 全套」當每一個小改動的固定儀式。

## 6. Source upgrades

上游升版本身視為獨立 Batch：

1. 更新 pinned source。
2. 產生 meaningful diff。
3. 更新 canonical data。
4. 將受影響翻譯標為 `STALE`。
5. 更新／新增 regression fixtures。
6. 完成 validation 後才 merge。

## 7. AI contributions

AI Agent 可執行大量工作，但不能用『測試有過』取代規則理解。Reviewer 對 merge 的規則正確性與可維護性負最終責任。
