---
id: 02-chat
order: 2
tense: live
claim: record
question:
  en: "Isn't this just a chat with an AI?"
line:
  en: "The chat is the hands and ears. The record is the body. A chat forgets you when you close it; a record keeps what you reached, what you tried, and what you didn't."
paragraph:
  en: "Ask a chat window a question and it answers well, then forgets you the moment the tab closes. Nothing of what you reached, what you tried, or what you could not yet do survives. In Meta DAX the chat is the hands and ears: the way a learner talks and listens today. The body is the record: what you reached, what you tried and where it went nowhere, who guided you and what you reused. The record is yours, kept in your own repository, public only if you choose, and it is what makes the next session start where the last one ended instead of from zero."
evidence:
  - kind: sample
    src: https://daxfoundation.org/metadax/samples/
    caption:
      en: "Sample packages and showcases, each made from a short set of prompts"
    source: daxfoundation.org
  - kind: link
    src: https://github.com/daxfoundation/metadax
    caption:
      en: "The open repository: git is the database, records live in the learner's own repository"
    source: github.com/daxfoundation/metadax
scene:
  module: chat-vs-record
  pin: 1
  states: [chat, record]
  params:
    labels:
      chat: "A chat"
      chatNote: "closes, forgets"
      chatRole: "the hands and ears"
      nodes: ["reached", "tried, kept", "guided", "reused by others", "you, today"]
      recordRole: "the body"
next: 03-built
deeper:
  - /metadax/samples/
version: 1
---
