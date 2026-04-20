/**
 * CLI 工具：供 Claude Code 內的 agents 呼叫，將活動紀錄發送到 Discord
 *
 * 用法：
 *   tsx bot/scripts/log.ts <agent> <event> "<訊息>" [補充說明]
 *
 * agent:  pm | designer | engineer
 * event:  task_assigned | task_complete | update | decision | question
 *
 * 範例：
 *   tsx bot/scripts/log.ts pm task_complete "已更新企劃書 Roadmap，補充 Phase 1 細節"
 *   tsx bot/scripts/log.ts engineer task_assigned "開始執行 Stage 1：Electron 整合"
 *   tsx bot/scripts/log.ts engineer task_complete "Stage 1 完成" "commit: abc1234，透明視窗正常運行"
 */
import 'dotenv/config'
import { log, type Agent, type EventType } from '../src/logger.js'

const [,, agent, event, message, detail] = process.argv

if (!agent || !event || !message) {
  console.error('用法：tsx bot/scripts/log.ts <agent> <event> "<訊息>" [補充說明]')
  console.error('agent:  pm | designer | engineer')
  console.error('event:  task_assigned | task_complete | update | decision | question')
  process.exit(1)
}

try {
  await log({
    agent: agent as Agent,
    event: event as EventType,
    message,
    detail: detail?.replace(/\\n/g, '\n')
  })
  console.log(`✅ 已記錄到 Discord [${agent}] ${event}`)
} catch (err) {
  console.error('❌', err instanceof Error ? err.message : err)
  process.exit(1)
}
