import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import simpleGit from 'simple-git'
import { Octokit } from '@octokit/rest'
import { PROJECT_ROOT, type AgentType } from './agents.js'

const git = simpleGit(PROJECT_ROOT)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// ─── Token 節省：工具回傳內容截斷 ──────────────────────────────────────────

const MAX_TOOL_OUTPUT_CHARS = 3000
const MAX_READ_LINES = 150

function truncate(text: string, max = MAX_TOOL_OUTPUT_CHARS): string {
  if (text.length <= max) return text
  return text.slice(0, max) + `\n\n⚠️ [內容過長，已截斷，共 ${text.length} 字元，顯示前 ${max} 字元]`
}

// ─── 路徑安全檢查 ────────────────────────────────────────────────────────────

function safePath(relativePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relativePath)
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`存取拒絕：路徑超出專案範圍（${relativePath}）`)
  }
  return resolved
}

// ─── Tool 定義（Anthropic 格式）─────────────────────────────────────────────

const TOOL_DEFINITIONS: Record<string, Anthropic.Tool> = {
  read_file: {
    name: 'read_file',
    description: `讀取專案內的檔案內容。預設只讀前 ${MAX_READ_LINES} 行，可用 max_lines 調整。`,
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '相對於專案根目錄的檔案路徑，例如 docs/project-brief.md'
        },
        max_lines: {
          type: 'number',
          description: `讀取的最大行數，預設 ${MAX_READ_LINES}。需要完整內容時可設為 0（不限制）。`
        }
      },
      required: ['path']
    }
  },

  write_file: {
    name: 'write_file',
    description: '寫入或更新專案內的檔案。若目錄不存在會自動建立。',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '相對於專案根目錄的檔案路徑'
        },
        content: {
          type: 'string',
          description: '要寫入的完整檔案內容'
        }
      },
      required: ['path', 'content']
    }
  },

  list_files: {
    name: 'list_files',
    description: '列出指定目錄下的所有檔案和子目錄。',
    input_schema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: '相對於專案根目錄的目錄路徑，例如 app/components'
        }
      },
      required: ['directory']
    }
  },

  git_status: {
    name: 'git_status',
    description: '顯示目前 git 工作目錄的狀態，包含已修改、未追蹤的檔案。',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },

  git_commit: {
    name: 'git_commit',
    description: '將指定檔案 stage 並 commit。可選擇性地先建立新分支再提交。',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit 訊息' },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: '要 stage 的檔案路徑列表（相對路徑）'
        },
        branch: {
          type: 'string',
          description: '（選填）若指定，會先建立並切換到此分支再提交'
        }
      },
      required: ['message', 'files']
    }
  },

  create_pull_request: {
    name: 'create_pull_request',
    description: '將目前分支推送到遠端，並建立 GitHub Pull Request。',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'PR 標題' },
        body: { type: 'string', description: 'PR 描述內容' },
        head: { type: 'string', description: '要合併的分支名稱（來源分支）' },
        base: { type: 'string', description: '目標分支，預設為 main' }
      },
      required: ['title', 'body', 'head']
    }
  }
}

// 每個 agent 可使用的 tool 列表
const AGENT_TOOLS: Record<AgentType, string[]> = {
  pm: ['read_file', 'write_file', 'list_files'],
  'ui-designer': ['read_file', 'list_files'],
  'fullstack-engineer': [
    'read_file',
    'write_file',
    'list_files',
    'git_status',
    'git_commit',
    'create_pull_request'
  ]
}

export function getToolDefinitions(agentType: AgentType): Anthropic.Tool[] {
  return AGENT_TOOLS[agentType].map((name) => TOOL_DEFINITIONS[name])
}

// ─── Tool 執行邏輯 ───────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      case 'read_file': {
        const filePath = safePath(input.path as string)
        if (!fs.existsSync(filePath)) {
          return `❌ 檔案不存在：${input.path}`
        }
        const maxLines = input.max_lines === 0 ? Infinity : ((input.max_lines as number) ?? MAX_READ_LINES)
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
        const sliced = lines.slice(0, maxLines)
        const truncated = sliced.length < lines.length
        const result = sliced.join('\n') + (truncated ? `\n\n⚠️ [檔案共 ${lines.length} 行，已截斷至前 ${maxLines} 行。需要更多內容請用 max_lines 參數。]` : '')
        return truncate(result)
      }

      case 'write_file': {
        const filePath = safePath(input.path as string)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, input.content as string, 'utf-8')
        return `✅ 已寫入：${input.path}`
      }

      case 'list_files': {
        const dirPath = safePath(input.directory as string)
        if (!fs.existsSync(dirPath)) {
          return `❌ 目錄不存在：${input.directory}`
        }
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        const result = entries
          .map((e) => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`)
          .join('\n')
        return truncate(result)
      }

      case 'git_status': {
        const status = await git.status()
        const lines = [
          `Branch: ${status.current}`,
          status.staged.length ? `Staged: ${status.staged.join(', ')}` : '',
          status.modified.length ? `Modified: ${status.modified.join(', ')}` : '',
          status.not_added.length ? `Untracked: ${status.not_added.join(', ')}` : '',
          status.deleted.length ? `Deleted: ${status.deleted.join(', ')}` : ''
        ].filter(Boolean)
        return lines.join('\n') || '✅ Working tree clean'
      }

      case 'git_commit': {
        const { message, files, branch } = input as {
          message: string
          files: string[]
          branch?: string
        }
        if (branch) {
          await git.checkoutLocalBranch(branch)
        }
        await git.add(files)
        const result = await git.commit(message)
        const branchInfo = branch ? ` on branch \`${branch}\`` : ''
        return `✅ Committed \`${result.commit}\`: "${message}"${branchInfo}`
      }

      case 'create_pull_request': {
        const { title, body, head, base = 'main' } = input as {
          title: string
          body: string
          head: string
          base?: string
        }
        await git.push(['-u', 'origin', head])
        const { data: pr } = await octokit.pulls.create({
          owner: process.env.GITHUB_OWNER!,
          repo: process.env.GITHUB_REPO!,
          title,
          body,
          head,
          base
        })
        return `✅ PR 已建立：${pr.html_url}`
      }

      default:
        return `❌ 未知 tool：${name}`
    }
  } catch (err) {
    return `❌ 執行 \`${name}\` 失敗：${err instanceof Error ? err.message : String(err)}`
  }
}
