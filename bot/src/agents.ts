import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = process.env.PROJECT_ROOT ?? path.resolve(__dirname, '../../')
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude/agents')

export type AgentType = 'pm' | 'ui-designer' | 'fullstack-engineer'

function loadSystemPrompt(filename: string): string {
  const content = fs.readFileSync(path.join(AGENTS_DIR, filename), 'utf-8')
  // 移除 YAML frontmatter（--- ... ---）
  return content.replace(/^---[\s\S]*?---\n+/, '').trim()
}

export interface AgentConfig {
  name: string
  emoji: string
  systemPrompt: string
}

export const AGENTS: Record<AgentType, AgentConfig> = {
  pm: {
    name: 'PM',
    emoji: '📋',
    systemPrompt:
      loadSystemPrompt('pm.md') +
      '\n\n你正在透過 Discord 與團隊溝通，請用繁體中文回覆，語氣直接清晰。'
  },
  'ui-designer': {
    name: 'UI Designer',
    emoji: '🎨',
    systemPrompt:
      loadSystemPrompt('ui-designer.md') +
      '\n\n你正在透過 Discord 與團隊溝通，請用繁體中文回覆，語氣直接清晰。'
  },
  'fullstack-engineer': {
    name: 'Full-stack Engineer',
    emoji: '⚙️',
    systemPrompt:
      loadSystemPrompt('fullstack-engineer.md') +
      `\n\n你正在透過 Discord 與團隊溝通，請用繁體中文回覆。專案根目錄為：${PROJECT_ROOT}`
  }
}

export function getAgent(type: AgentType): AgentConfig {
  return AGENTS[type]
}

// Discord 頻道名稱 → agent 類型
export const CHANNEL_AGENT_MAP: Record<string, AgentType> = {
  'pm-討論': 'pm',
  'ui-設計': 'ui-designer',
  '工程': 'fullstack-engineer'
}
