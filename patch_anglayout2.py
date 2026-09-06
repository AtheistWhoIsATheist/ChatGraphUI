import re

with open('src/components/ANG/AngLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { FileManager } from './FileManager';", "import { FileManager } from './FileManager';\nimport { IntelligenceSidebar } from './IntelligenceSidebar';")

# Add the sidebar rendering right before FileManager render
sidebar_render = """
      {/* Intelligence Sidebar / Semantic Oracle */}
      <IntelligenceSidebar activeNodeId={activeNodeId} />
"""
content = content.replace("{/* File Manager DataHub Overlay */}", sidebar_render + "\n      {/* File Manager DataHub Overlay */}")

with open('src/components/ANG/AngLayout.tsx', 'w') as f:
    f.write(content)

print("Patched AngLayout with Intelligence Sidebar")
