/**
 * 一次性腳本：在 Discord 伺服器建立 Agents Team 頻道並產生 Webhook URL
 * 執行：npm run dev:setup
 *
 * 需要 Bot 有 Manage Webhooks 權限
 */
import 'dotenv/config'
import { Client, GatewayIntentBits, ChannelType, TextChannel } from 'discord.js'

const discord = new Client({ intents: [GatewayIntentBits.Guilds] })

discord.once('ready', async () => {
  const guildId = process.env.DISCORD_GUILD_ID
  if (!guildId) {
    console.error('❌ 請在 .env 設定 DISCORD_GUILD_ID')
    process.exit(1)
  }

  const guild = await discord.guilds.fetch(guildId)
  console.log(`✅ 連接到伺服器：${guild.name}\n`)

  // 建立分類
  const category = await guild.channels.create({
    name: '🤖 Agents Team',
    type: ChannelType.GuildCategory
  })

  // 建立單一紀錄頻道
  const channel = await guild.channels.create({
    name: 'agents-log',
    type: ChannelType.GuildText,
    parent: category.id,
    topic: '🤖 Agents 活動紀錄 — PM、設計師、工程師的任務指派、進度更新與完成回報'
  }) as TextChannel

  const webhook = await channel.createWebhook({ name: 'Agents Logger' })
  console.log(`✅ #agents-log`)

  console.log('\n── 請將以下內容加入 bot/.env ──────────────────────')
  console.log(`WEBHOOK_LOG=${webhook.url}`)
  console.log('────────────────────────────────────────────────────\n')
  console.log('🎉 完成！複製上方 Webhook URL 貼入 .env 後即可使用 logger。')

  process.exit(0)
})

discord.login(process.env.DISCORD_TOKEN)
