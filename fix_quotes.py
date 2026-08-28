import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("content: 'Welcome to the ANG", "content: `Welcome to the ANG")
content = content.replace("So am I.',", "So am I.`,")
content = content.replace("content: 'I hear what you are saying.", "content: `I hear what you are saying.")
content = content.replace("reifying the void.',", "reifying the void.`,")

with open("src/App.tsx", "w") as f:
    f.write(content)
