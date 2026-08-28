import re

with open("src/components/ANG/AngLayout.tsx", "r") as f:
    content = f.read()

content = content.replace("import { \n  Hexagon, Library, HelpCircle, \n  PlusCircle, LayoutGrid, Settings, Circle, Disc, \n  CircleDot\n} from 'lucide-react';", "import { \n  Hexagon, Library, HelpCircle, \n  PlusCircle, LayoutGrid, Settings, Circle, Disc, \n  CircleDot\n} from 'lucide-react';")
if 'Hexagon' not in content:
    content = content.replace("import {\n", "import { Hexagon, Library, HelpCircle, PlusCircle, LayoutGrid, Settings, Circle, Disc, CircleDot, \n")
if "import { CircleDot }" in content:
    content = content.replace("import { CircleDot } from 'lucide-react';", "import { Hexagon, Library, HelpCircle, PlusCircle, LayoutGrid, Settings, Circle, Disc, CircleDot } from 'lucide-react';")
with open("src/components/ANG/AngLayout.tsx", "w") as f:
    f.write(content)
