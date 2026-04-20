import Anthropic from '@anthropic-ai/sdk'

const MAX_MESSAGES = 10 // 最多保留 10 則訊息（5 來回）

export class ConversationHistory {
  private store = new Map<string, Anthropic.MessageParam[]>()

  add(
    channelId: string,
    role: 'user' | 'assistant',
    content: Anthropic.MessageParam['content']
  ): Anthropic.MessageParam[] {
    const msgs = this.store.get(channelId) ?? []
    msgs.push({ role, content })

    // 超過上限時從頭刪除，確保 user/assistant 成對移除
    while (msgs.length > MAX_MESSAGES) {
      msgs.splice(0, 2)
    }

    this.store.set(channelId, msgs)
    return [...msgs]
  }

  get(channelId: string): Anthropic.MessageParam[] {
    return [...(this.store.get(channelId) ?? [])]
  }

  clear(channelId: string): void {
    this.store.delete(channelId)
  }
}
