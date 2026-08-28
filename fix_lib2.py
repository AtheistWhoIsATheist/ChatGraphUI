import re

with open("src/components/ANG/views/LibraryView.tsx", "r") as f:
    content = f.read()

content = content.replace("import { CorpusText, Marginalia } from '../../../data/ontology';", "import { CorpusText } from '../../../data/ontology';\nimport { Marginalia } from '../../../types';")

with open("src/components/ANG/views/LibraryView.tsx", "w") as f:
    f.write(content)
