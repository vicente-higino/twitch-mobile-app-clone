import React, { FC, useEffect, useState } from 'react'


const ChatMessage = {
  "@badge-info": "string",
  "badges": "string",
  "color": "string",
  "display-name": "string",
  "emotes": "string",
  "emote-only": "string",
  "first-msg": "string",
  "flags": "string",
  "id": "string",
  "mod": "string",
  "returning-chatter": "string",
  "room-id": "string",
  "subscriber": "string",
  "tmi-sent-ts": "string",
  "turbo": "string",
  "user-id": "string",
  "user-type": "string"
} as const;

type keys = keyof typeof ChatMessage
export type ChatMessage = Partial<Record<keys, string>>
function parseMessage(message: string): ChatMessage {
  const parts = message.split(";")
  let res: ChatMessage = {}
  for (const part of parts) {
    const match = part.match(/(.+?)=([^;]+)/)
    if (match && match.length == 3) {
      let [_, key, value] = match
      if (isKey(key)) {
        if (key === "user-type" && value) {
          const m = value.match("PRIVMSG #.+:(.+)")
          value = m ? m[1] : "no msg"
        }
        res[key] = value;
      }
    }
  }
  return res;
}

function isKey(key: string): key is keys {
  return key in ChatMessage;
}


export const useChat = ({ login }: { login: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv/")
    ws.onopen = () => {
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands")
      ws.send("PASS oauth:rrhc9kybloxuips6l3rc4omou9pigw")
      ws.send("NICK vicentehigino")
      ws.send("USER vicentehigino 8 * :vicentehigino")
      ws.send(`JOIN #${login}`)
    }
    ws.onmessage = (mes) => {
      if (typeof mes?.data === "string") {
        if (mes.data.startsWith("PING")) {
          ws.send("PONG :tmi.twitch.tv")
          return;
        }
        if (mes.data.includes("PRIVMSG")) {
          const message = parseMessage(mes.data)
          setMessages(prev => {
            if (prev.length > 50) prev.shift()
            return [...prev, message]
          })
        }
      }
    }

    return () => {
      ws.close()
    }
  }, [])
  return messages;
}
