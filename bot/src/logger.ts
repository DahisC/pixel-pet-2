/**
 * Discord Webhook Logger
 * 供 Claude Code 內的 agents 呼叫，記錄活動到 Discord 頻道
 * 不需要 bot 程序運行，直接 HTTP POST 到 Webhook URL
 */

export type Agent = 'pm' | 'designer' | 'engineer'

export type EventType =
  | 'task_assigned'   // 任務指派
  | 'task_complete'   // 任務完成
  | 'update'          // 進度更新
  | 'decision'        // 重要決策
  | 'question'        // 問題/阻礙

interface LogEntry {
  agent: Agent
  event: EventType
  message: string
  detail?: string  // 選填，補充說明
}

// 各 agent 的顯示設定
const REPO_RAW = 'https://raw.githubusercontent.com/DahisC/pixel-pet-2/feature/landing-page'

const AGENT_CONFIG: Record<Agent, { name: string; emoji: string; avatar?: string }> = {
  pm:       { name: 'PM',          emoji: '📋' },
  designer: { name: 'UI Designer', emoji: '🎨' },
  engineer: { name: '工程師',       emoji: '⚙️', avatar: `${REPO_RAW}/bot/assets/avatars/engineer.jpg` },
}

const EVENT_LABEL: Record<EventType, string> = {
  task_assigned: '📥 任務指派',
  task_complete: '✅ 任務完成',
  update:        '🔄 進度更新',
  decision:      '💡 決策確認',
  question:      '❓ 問題/阻礙',
}

function getWebhookUrl(): string {
  const url = process.env.WEBHOOK_LOG
  if (!url) throw new Error('Webhook URL 未設定：WEBHOOK_LOG，請檢查 .env')
  return url
}

// 發送紀錄到 Discord
export async function log(entry: LogEntry): Promise<void> {
  const { agent, event, message, detail } = entry
  const config = AGENT_CONFIG[agent]
  const webhookUrl = getWebhookUrl()

  const detailBlock = detail
    ? detail.split('\n').map(line => `> ${line}`).join('\n')
    : null

  const lines = [
    `**${EVENT_LABEL[event]}**　${message}`,
    ...(detailBlock ? ['', detailBlock] : [])
  ]

  const body = {
    username: `${config.emoji} ${config.name}`,
    avatar_url: config.avatar,
    content: lines.join('\n')
  }

  console.log('送出 body:', JSON.stringify(body, null, 2))

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`Discord Webhook 發送失敗：${res.status} ${res.statusText}`)
  }
}
