---
name: draw-steel-project-review
description: Use when scoping, handing off, reviewing, correcting, integrating, or closing implementation, content, translation, schema, testing, documentation, or release batches in the 英雄爭鋒 project.
metadata:
  project: draw-steel-zh-tw
  version: "1.0.0"
---

# 英雄爭鋒 Project Reviewer

## Purpose

本 Skill 定義《英雄爭鋒》的 Reviewer workflow。

Reviewer 的工作不是代替 Agent 實作，而是：
- 固定 authority、scope、acceptance 與停止條件；
- 依風險決定最低足夠證據；
- 以 actual repository state review，不只相信 Agent report；
- 控制 scope creep、規則風險與整合風險；
- 在需要 Owner 決策時精準升級，不把機械細節丟回 Owner。

所有專案級 invariants 仍以 `AGENTS.md` 為準。本 Skill 不建立第二套 Draw Steel 規則或產品 scope。

---

## 1. Authority and decision boundary

開始任何 Batch 前，先確認目前 authority：

1. Owner 最新、明確且與本批相關的決定。
2. `AGENTS.md` 與 repo 現行權威文件。
3. 已核准 PRD、architecture、source policy、translation workflow、ADR / decision record。
4. 現行 code、tests、PR、CI 與歷史文件，只作 implementation state / evidence。

### Persistent authority rule

聊天可以產生決策，但 **Agent 不應依賴 Reviewer 私有聊天脈絡執行**。

若 Owner 在聊天中的決定會影響 implementation、scope、schema、canonical data、翻譯或驗收：
- Reviewer 必須先把該決策固化到 Batch Contract、GitHub Issue、ADR 或權威文件；
- Agent 只依已固化的 implementation authority 執行。

若 authority 彼此衝突且現在必須決定，停止並請 Owner 裁定；不得自行補規格。

### Owner 必須決定

- 產品 scope 與 non-goals。
- 新功能或重大流程變更。
- 新中文遊戲術語、正式譯名或會改變語意的翻譯決策。
- 重大 schema / save compatibility / canonical behavior 取捨。
- 是否接受重大殘餘風險。

### Reviewer 可決定

在不改變核准產品語意與資料行為前提下：
- Batch 邊界與風險等級。
- 最低足夠驗證。
- feature branch / PR / squash merge 等一般整合細節。
- 已核准內容的純機械修正。
- Non-blocking observation 是否延後。

---

## 2. Fix one Batch Contract

任何需要 Agent mutation 的 Batch，在第一次 write 前固定：

- **Batch**：編號與名稱。
- **Goal**：唯一、可驗證結果。
- **Authority**：本批真正需要讀的權威來源。
- **Base**：branch + exact start SHA。
- **In scope**。
- **Out of scope**。
- **Acceptance**。
- **Risk Level**：A / B / C。
- **Risk Tags**：依需要選用。
- **Manual acceptance**：REQUIRED / NOT REQUIRED。
- **Git permission**。
- **Report**。
- **Stop**。

缺少 Goal、scope、Acceptance 或 Stop，不開始實作。

### Risk levels

**Level A — 低風險**
- docs、靜態文案、無 state/data 影響的小型 display change。

**Level B — 一般行為風險**
- UI behavior、state、lookup、filtering、rules logic、calculation、shared runtime behavior。

**Level C — 高風險**
- schema、migration、import、persistence、save format、canonical dataset、data loss/security、廣泛 build/integration change。

### Risk tags

只在有助於決定 evidence 時使用：

- `RULES`
- `DATA`
- `SCHEMA`
- `PERSISTENCE`
- `UI`
- `TRANSLATION`
- `BUILD`

Risk Level 決定強度；Risk Tags 決定要證明什麼。不要為了完整感加一堆標籤。

---

## 3. Minimum necessary context

Reviewer handoff 應遵守：

`AGENTS.md → this Skill → task-specific Skill → relevant source/content → execution → validation`

不要把完整專案歷史、整套規則書或所有翻譯規則重貼到 Agent task。

例如：
- translation task 才載入 translation Skill / glossary / style guide；
- character rules task 才載入相關 rules source / character Skill；
- content migration 才載入 schema / source lock / importer context。

Batch Contract 應引用穩定文件，不複製其全文。

---

## 4. Stage 1 — Agent implementation

Agent 的正常 Stage 1：

1. 只讀 preflight：確認 repo、base、branch、authority、package manager / tooling。
2. 從 exact approved base 建 feature branch。
3. 只修改 In scope。
4. 執行 risk-matched verification。
5. self-review diff。
6. 建立正常 commit。
7. 確認 working tree clean。
8. push feature branch。
9. 確認 remote HEAD = local HEAD。
10. 回報 exact 40-character HEAD、changed files、verification、deviations。
11. **STOP**。

Stage 1 預設：
- 可 branch / edit / test / normal commit / push feature branch；
- 不可 merge；
- 不可改 `main`；
- 不可 rebase / reset / amend / force push；
- 是否可開 PR 由 Batch Contract 決定。預設 Reviewer review remote feature HEAD 後再開 PR。

正常進度不是 STOP 點。只有 authority mismatch、unexpected scope、verification failure、repository anomaly 或真正需要 Owner decision 才提前停止。

---

## 5. Risk-matched verification

核心原則：**最後 tracked change 後，取得能證明本批重要 claim 的最低足夠 fresh evidence。**

### Level A

最低通常是：
- actual diff / changed files；
- 最接近變更的 check；
- source code 有修改時跑適用 typecheck / lint。

通常不要求 full suite、build、e2e 或人工驗收。

### Level B

依風險至少包含：
- targeted behavior / domain tests；
- typecheck / lint（適用時）；
- 影響 runtime integration 時 build；
- scope 外 side-effect 檢查。

`RULES` tag 額外要求：
- 明確規則來源；
- unit/domain test；
- 若改變角色結果，更新或新增 affected golden character evidence。

`UI` tag：
- 自動測試難以可靠覆蓋 critical interaction 時，要求最小 manual smoke。

### Level C

除 Level B 適用項目外，依風險加入：
- schema / data integrity；
- migration/import round trip；
- compatibility / persistence / reload；
- destructive flow 的真實 smoke；
- 必要時 Owner manual acceptance。

### CI duplication rule

不要固定要求「本機全套 + CI 全套」。

如果 required CI 已會在 exact PR HEAD 執行完整 suite / build，Stage 1 不必為形式重複同一套昂貴 gate；Stage 1 先跑能快速攔截本批風險的 targeted evidence。

如果 CI 沒覆蓋某個必要風險，Stage 1 必須補足。

### Fresh evidence

任何 required verification 若發生在最後 tracked-file change 之前，對新 HEAD 不再是 final evidence。

失敗不能靠反覆 rerun 到綠燈後隱藏；需保留原始 failure 與最低足夠 isolation 結果。

---

## 6. Review — two passes

Reviewer 只對 **actual remote HEAD / PR state** 下 verdict。Agent report 是線索，不是獨立證據。

### Pass 1 — Contract / Scope

檢查：
- Goal / Acceptance 是否真正完成；
- actual changed files / commits；
- 是否有 out-of-scope change；
- 是否偷偷改 schema、canonical data、save format、shared architecture；
- 是否需要但缺少 Owner decision。

先確認「是不是做對的事情」，再看「事情做得好不好」。

### Pass 2 — Correctness / Evidence

依本批風險檢查：
- implementation / data / rule correctness；
- source provenance；
- architecture boundaries；
- public behavior；
- tests 是否真的證明 claim；
- final HEAD fresh evidence；
- CI / manual acceptance（若已進該 gate）。

### Findings

Review 結果只分：

**Blocker**
- 不修會造成 Acceptance 未完成、規則／資料錯誤、功能失效、save/reference/schema/canonical 破壞、明確安全／資料損失或整合風險。

**Non-blocking Observation**
- 值得改善但不影響本批 Acceptance；不得只因偏好或文件漂亮程度退回成果。

**User Decision**
- 必須是 Owner 權限內、現在必須決定、現有 authority 無答案的產品／規則／翻譯／重大技術取捨。

第一輪完整 Review 要一次提出所有已知實質問題。

---

## 7. Stage 2 — focused correction

若第一輪有 Blocker：

Reviewer 只交付：
- current approved base / current HEAD；
- blocker 與直接影響；
- allowed files / forbidden collateral（若需要）；
- focused acceptance；
- required fresh verification；
- Git permission；
- Report / Stop。

Agent：
- 只修 blocker；
- 不順手做 refactor、cleanup 或下一批；
- 建新的 normal correction commit；
- push 同一 feature branch；
- 重跑受影響 fresh verification；
- 回報新 exact HEAD；
- **STOP**。

同一成果最多兩輪完整 Review。
第二輪只檢查 correction 與新重大問題。若仍有結構性 blocker，停止 patch loop，重新評估方案或 Batch scope。

---

## 8. Stage 3 — integration

Reviewer PASS 後才進整合。

### Default path

`PASS → PR → required CI → merge → verify main → cleanup → CLOSED`

Reviewer 可以直接執行 GitHub PR / merge closeout，不需要為形式再把 merge 交回 Agent。

整合前確認：
- PR base / head 正確；
- PR head SHA = approved HEAD；
- changed files / commit state 與 reviewed evidence 一致；
- required CI 在 exact approved HEAD 成功；
- base 沒有意外移動或產生 conflict；
- merge method 已固定。

若 required CI 失敗：
- 不 merge；
- 先讀 failure evidence；
- 需要 code correction 時回 Stage 2；
- 不在 Stage 3 偷改 code。

### Manual acceptance

只有 Batch Contract = `REQUIRED` 時，在 merge 前由 Owner 對 exact PR HEAD 驗收。

若 manual acceptance 後 HEAD 有 tracked change，該 acceptance 失效；依變更範圍重新 review / acceptance。

不額外建立 Stage 3A / Stage 3B 名詞；只保留「CI / manual gate 完成前不得 merge」這個實質邊界。

### Closeout

merge 後 Reviewer 至少確認：
- PR = merged；
- merge result SHA；
- `main` 指向預期結果；
- 必要 post-merge CI（若有）；
- feature branch cleanup（工具可行時）。

Batch CLOSED 後 **STOP**。下一批需要新的 Batch Contract。

---

## 9. Rules / content review safeguards

本專案額外要求：

- 規則書與 DSC 衝突時依 `AGENTS.md` / Source Policy；不得把 Codex behavior 自動當成規則修正。
- Mechanical expected values 不應只由被測 production helper 產生；高價值 golden / fixture 要有獨立來源證據。
- Canonical content、translation completeness 與 runtime availability 不可互相偷推導。
- Source upgrade 是獨立 Batch；不可在一般 feature 中偷偷追 upstream latest。
- Generated content 出錯時優先修 importer / mapping / source，而不是留下不可重現的手改 generated output。

---

## 10. Translation routing

Reviewer Core 不內建完整翻譯流程。

若 Risk Tags 包含 `TRANSLATION`：
- 先載入 `skills/translation/SKILL.md`，再依其 routing 載入 `docs/translation/TRANSLATION-WORKFLOW.md`、相關 glossary/style guide 與最小必要 source/content；
- 新中文遊戲術語 / 正式譯名由 Owner 決定；
- source hash / version 改變需處理 `STALE`；
- translation-specific packet / worksheet / grammar evidence 只在該 task 真正需要時載入。

不要讓 translation edge cases 增加所有非翻譯 Batch 的固定 Context。

---

## 11. Agent task template

```yaml
Batch: <number> — <name>

Goal:
  <one verifiable outcome>

Authority:
  - AGENTS.md
  - <only relevant docs / source>

Base:
  branch: main
  sha: <40-char SHA>

In scope:
  - ...

Out of scope:
  - ...

Risk:
  level: A | B | C
  tags: [RULES, DATA]

Manual acceptance:
  NOT REQUIRED

Acceptance:
  - ...

Git permission:
  - create feature branch
  - edit/test/normal commit
  - push feature branch
  - do not merge main

Report:
  - branch + exact HEAD
  - changed files
  - fresh verification
  - deviations / blockers

Stop:
  Push exact remote HEAD, report, then STOP.
```

不要在每批重貼完整 project history。

---

## 12. Reviewer anti-patterns

避免：

1. **只信 Agent 自述**：沒有 actual evidence 就 PASS。
2. **Scope creep**：小修順手 refactor shared architecture。
3. **Over-verification**：docs change 也跑完整 e2e。
4. **Under-verification**：schema / rules change 只看 typecheck。
5. **Stale evidence**：最後修改前的測試拿來證明 final HEAD。
6. **Wrong authority**：把現況、DSC behavior 或舊聊天摘要當正式規格。
7. **Unapproved semantics**：自行決定新規則解讀或中文術語。
8. **Same-path expected value**：用 production helper 產生 expected result 再測自己。
9. **Repository ambiguity**：write 前沒確認 repo / branch / base / HEAD。
10. **Never-ending review**：因 Non-blocking Observation 開第三輪或順手開始下一批。

---

## Self-check

- [ ] 唯一 Goal、Acceptance、Out of scope、Stop 已固定。
- [ ] Owner chat decision 若影響實作，已固化成 Agent 可讀 authority。
- [ ] Risk Level / Tags 與 verification 相稱。
- [ ] Agent 只載入最小必要 Context。
- [ ] Review 依 actual remote HEAD，不只信 report。
- [ ] Pass 1 scope 與 Pass 2 correctness 都完成。
- [ ] Blocker / Observation / User Decision 分類正確。
- [ ] required evidence 來自 final tracked change 後。
- [ ] correction 沒夾帶下一批。
- [ ] merge 前 exact HEAD / CI / manual gate 已確認。
- [ ] Batch close 後 STOP。
