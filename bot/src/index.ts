import 'dotenv/config'
import { Client, GatewayIntentBits, TextChannel } from 'discord.js'
import Anthropic from '@anthropic-ai/sdk'
import { CHANNEL_AGENT_MAP, getAgent, type AgentType } from './agents.js'
import { ConversationHistory } from './history.js'
import { getToolDefinitions, executeTool } from './tools.js'

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const anthropic = new Anthropic()
const history = new ConversationHistory()

// ─── Discord 訊息分割（2000 字元上限）────────────────────────────────────────

async function sendLong(channel: TextChannel, text: string): Promise<void> {
  const MAX = 1900
  if (text.length <= MAX) {
    await channel.send(text)
    return
  }
  const chunks: string[] = []
  let current = ''
  for (const line of text.split('\n')) {
    if (current.length + line.length + 1 > MAX) {
      if (current) chunks.push(current)
      current = line
    } else {
      current = current ? `${current}\n${line}` : line
    }
  }
  if (current) chunks.push(current)
  for (const chunk of chunks) {
    await channel.send(chunk)
  }
}

// ─── 主訊息處理 ──────────────────────────────────────────────────────────────

discord.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (!message.guild) return

  // 指令：清除對話記錄
  if (message.content.trim() === '!clear') {
    history.clear(message.channelId)
    await message.reply('✅ 對話記錄已清除。')
    return
  }

  const channel = message.channel as TextChannel
  const agentType = CHANNEL_AGENT_MAP[channel.name] as AgentType | undefined
  if (!agentType) return

  const agent = getAgent(agentType)
  const tools = getToolDefinitions(agentType)
  const messages = history.add(message.channelId, 'user', message.content)

  try {
    await channel.sendTyping()

    let currentMessages = [...messages]

    // ── Token usage 累計 ──────────────────────────────────────────────────
    const usage = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 }

    // ── Agentic loop ──────────────────────────────────────────────────────
    while (true) {
      const params: Anthropic.MessageCreateParams = {
        model: 'claude-haiku-4-5',
        max_tokens: 8096,
        system: [
          {
            type: 'text',
            text: agent.systemPrompt,
            cache_control: { type: 'ephemeral' }
          }
        ],
        messages: currentMessages
      }
      if (tools.length > 0) params.tools = tools

      const response = await anthropic.messages.create(params)

      // 累計 usage
      usage.input += response.usage.input_tokens
      usage.output += response.usage.output_tokens
      usage.cacheWrite += response.usage.cache_creation_input_tokens ?? 0
      usage.cacheRead += response.usage.cache_read_input_tokens ?? 0

      // 沒有 tool call，結束迴圈
      if (response.stop_reason !== 'tool_use') {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n')

        if (text) {
          await sendLong(channel, `${agent.emoji} **${agent.name}**\n${text}`)
        }

        // 顯示 token usage
        const usageLine = [
          `📊 \`in ${usage.input} | out ${usage.output}`,
          usage.cacheRead ? ` | cache_read ${usage.cacheRead}` : '',
          usage.cacheWrite ? ` | cache_write ${usage.cacheWrite}` : '',
          `\``
        ].join('')
        await channel.send(usageLine)

        history.add(message.channelId, 'assistant', response.content)
        break
      }

      // 處理 tool calls
      currentMessages.push({ role: 'assistant', content: response.content })

      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        await channel.send(`*⚙️ 使用工具 \`${block.name}\`...*`)

        const result = await executeTool(block.name, block.input as Record<string, unknown>)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result
        })
      }

      currentMessages.push({ role: 'user', content: toolResults })
      await channel.sendTyping()
    }
  } catch (err) {
    console.error('[Bot Error]', err)
    await channel.send(
      `❌ 發生錯誤：${err instanceof Error ? err.message : String(err)}`
    )
  }
})

// ─── 啟動 ────────────────────────────────────────────────────────────────────

discord.once('ready', () => {
  console.log(`✅ Bot 已上線：${discord.user?.tag}`)
  console.log('監聽頻道：', Object.keys(CHANNEL_AGENT_MAP).join(', '))
})

discord.login(process.env.DISCORD_TOKEN)
