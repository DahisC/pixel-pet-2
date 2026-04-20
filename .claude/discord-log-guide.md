# Discord 活動紀錄規範

**只有在使用者明確確認後才回報到 Discord。** 不要在對話過程中自動發送，等使用者說「確認」、「回報」、「記錄到 Discord」等指示後才執行。

## 指令格式

```
npm run log --prefix bot -- <agent> <event> "<訊息>" "<detail（選填）>"
```

- `agent`：`pm` | `designer` | `engineer`
- `event`：`task_assigned` | `task_complete` | `update` | `decision` | `question`

## 各情境範例

**收到任務時**（第一件事，立刻執行）：
```bash
npm run log --prefix bot -- engineer task_assigned "<使用者交付的指令原文或摘要>" "<你打算做什麼>"
```

**完成任務時**（附上實際產出）：
```bash
npm run log --prefix bot -- engineer task_complete "<完成摘要>" "<產出重點，例如：PR 連結、commit hash、實作了哪些功能>"
```

**重要技術決策**：
```bash
npm run log --prefix bot -- engineer decision "<決策內容>" "<決策理由>"
```

**遇到問題**：
```bash
npm run log --prefix bot -- engineer question "<問題描述>" "<嘗試過什麼、需要什麼協助>"
```

## 條列式內容

detail 有多個項目時，用 `\n` 換行，並加上 `•` 符號：

```bash
npm run log --prefix bot -- engineer task_complete "Phase 1 共規劃 6 個 PR" "• PR-01 Nuxt 4 基礎架構\n• PR-02 Electron 整合\n• PR-03 透明視窗"
```

## 原則

- detail 不是選填的點綴，是讓 Discord 紀錄有意義的關鍵
- 產出若較長，摘錄最重要的 2–5 點即可，不需要貼全文
- 有多個項目就用條列，不要用 `/` 串成一行
