import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = re.sub(r'import { ReflectionChamber }.*\n', '', content)
content = re.sub(r'import { CorpusBrowser }.*\n', '', content)
content = re.sub(r'import { ParadoxSynthesizer }.*\n', '', content)
content = re.sub(r'import ReasoningEnginePage.*\n', '', content)
content = re.sub(r'import { DataManagementModal }.*\n', '', content)
content = re.sub(r'import { GoogleDocsManager }.*\n', '', content)

with open("src/App.tsx", "w") as f:
    f.write(content)
