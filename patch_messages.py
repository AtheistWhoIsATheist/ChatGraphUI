import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add messages and aporias state
state_code = """
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'msg-1',
      role: 'CURATOR',
      content: 'Welcome to the ANG System — the Abyssal Navigation Graph for Nihiltheism.\n\nThis system is built to support your philosophical research into Nihiltheism — the framework that holds the experience of nihilism as a temporal expression of the Transcendent.\n\nTo begin:\n• Ask me anything about NT\n• Add your first source via the Ingest view (⊕)\n• Explore the graph (⬡) to see the current architecture\n• Review your open questions (◇)\n\nThe void is ready. So am I.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [aporias, setAporias] = useState<any[]>([
    {
      id: 'aporia-1',
      text: 'Who or what is the witness of the dissolution?',
      whyUnresolvable: 'The very report of dissolution implies a witness. But if a witness persists, dissolution was incomplete. If dissolution was complete, no report is possible. The paradox is self-referentially unresolvable.',
      functionalValue: 'Points toward the nature of awareness itself — what is it that persists through dissolution? This question cannot be answered without begging it. It is NT\\'s most productive aporia.',
      sourceId: 'P3 Paradox',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    },
    {
      id: 'aporia-2',
      text: 'Can the void be encountered without a self to encounter it?',
      whyUnresolvable: 'Any description of the encounter requires a phenomenological subject, but the void-encounter precisely dissolves the subject-object structure.',
      functionalValue: 'Prevents the reification of the void as an object of experience.',
      sourceId: 'P1/P3 intersection',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    }
  ]);

  const handleSendMessage = (content: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      role: 'RESEARCHER',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Simulate curator response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()+1}`,
        role: 'CURATOR',
        content: 'I hear what you are saying. This points toward the paradox of Absence-as-Presence. We must apply apophatic discipline here to avoid reifying the void.',
        timestamp: new Date().toISOString(),
        metadata: { depthLevel: 3, triggers: ['T1', 'T2'] }
      }]);
    }, 1500);
  };
"""

content = content.replace("const [gateMode, setGateMode] = useState<GateMode>('AUTO');", "const [gateMode, setGateMode] = useState<GateMode>('AUTO');" + state_code)

content = content.replace("messages={[]}", "messages={messages}")
content = content.replace("onSendMessage={() => {}}", "onSendMessage={handleSendMessage}")
content = content.replace("aporias={[]}", "aporias={aporias}")

with open("src/App.tsx", "w") as f:
    f.write(content)
