# Content Model Principles

## 1. Goals

Canonical content 必須同時服務 Character Engine、Rules Reference、翻譯與 validation，而不綁死任一 UI。

## 2. Stable identity

每個網站 canonical entity 使用穩定 ID。ID 不應依繁中名稱或檔名決定，避免改譯名造成 reference break。

上游 DSC UUID 可以保存為 source mapping，但不預設把所有 upstream UUID 直接當網站 public ID。

## 3. Logical domains

至少分成：

- Rules：action、movement、condition、combat glossary 等速查內容。
- Character Options：ancestry、culture、career、class、kit、complication 等。
- Progression：class level features / advancement choices。
- Shared Entities：ability、keyword、skill 等在多處被引用的資料。

不要建立一個無差別 `DrawSteelThing` schema 承載所有類型。

## 4. Canonical vs translation

Canonical English 與 zh-TW localization 是不同資料層，以相同 stable ID 對應。

概念範例：

```yaml
# canonical
id: ancestry.human
name: Human
source:
  document: heroes
  version: pinned
```

```yaml
# translation
id: ancestry.human
name: 人類
status: APPROVED
sourceHash: '<hash>'
```

實際 schema 欄位於 Batch 002 依真實資料建立，不以本例視為定稿。

## 5. Character data

角色 payload 優先保存：

- schema / rules / content version。
- current level。
- stable entity IDs。
- 玩家做過的 explicit choices。
- 必要的自由文字欄位。

可由 rules engine 推導的 Stamina、Speed、abilities summary 等，不應成為唯一 canonical state。

## 6. Progression

1 級創角與 2 級升級使用同一套 choice / prerequisite / effect 概念，避免建立兩套無法延伸到 Level 3–10 的特殊流程。

Level 2 MVP 的目的就是驗證 progression 模型能在保留 Level 1 choices 的情況下新增合法 choice 並重算角色。

## 7. References

跨 entity 關係使用 stable ID，而不是依顯示名稱做字串搜尋。Validation 必須檢查 dangling reference、duplicate ID 與不合法 cycle（若該 entity 類型禁止 cycle）。

## 8. Generated content

若資料由官方 YAML / 其他來源 normalize 產生，generated output 與 hand-authored content 必須有清楚邊界。修正資料優先改 importer / mapping / canonical source，不在 generated file 上留下不可重現的手工 patch。
