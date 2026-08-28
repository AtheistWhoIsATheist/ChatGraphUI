import re

with open("src/components/ANG/views/LibraryView.tsx", "r") as f:
    content = f.read()

content = content.replace("import { CorpusText, Marginalia } from '../../../types';", "import { CorpusText, Marginalia } from '../../../data/ontology';")

content = content.replace("onSaveMarginalia: (m: Marginalia) => void;", "onSaveMarginalia: (corpusId: string, noteText: string) => void;")

with open("src/components/ANG/views/LibraryView.tsx", "w") as f:
    f.write(content)
