import React, { FC, useEffect, useRef, useState } from 'react'


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

type keys = keyof typeof ChatMessage;
export type ChatMessage = Partial<Record<keys, string>>
function parseMessage(message: string): ChatMessage {
  const parts = message.split(";");
  let res: ChatMessage = {};
  for (const part of parts) {
    const match = part.match(/(.+?)=([^;]+)/)
    if (match && match.length == 3) {
      let [_, key, value] = match;
      if (isKey(key)) {
        if (key === "user-type" && value) {
          const m = value.match("PRIVMSG #.+ :(.+)");
          value = m ? m[1] : "no msg";
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
  const tempMessages = useRef<ChatMessage[]>([]);
  useEffect(() => {
    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv/")
    ws.onopen = () => {
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands")
      ws.send("PASS SCHMOOPIIE")
      ws.send("NICK justinfan42467")
      // ws.send("USER justinfan42467 8 * :justinfan42467")
      ws.send(`JOIN #${login.toLowerCase()}`)
    }
    ws.onmessage = (mes) => {
      if (typeof mes?.data === "string") {
        if (mes.data.startsWith("PING")) {
          ws.send("PONG :tmi.twitch.tv")
          return;
        }
        if (mes.data.includes("PRIVMSG")) {
          const message = parseMessage(mes.data)
          tempMessages.current = [message, ...tempMessages.current]
          // setMessages(prev => {
          //   if (prev.length > 20) prev.pop()
          //   return [message, ...prev]
          // })
        }
      }
    }

    return () => {
      ws.close()
    }
  }, [])
  useEffect(() => {
    const id = setInterval(() => {
      tempMessages.current = tempMessages.current.slice(0, 30);
      setMessages(tempMessages.current);
    }, 1000);

    return () => {
      clearInterval(id);
    }
  }, [])

  return messages;
}
