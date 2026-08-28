import re

def remove_unused(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # For AngLayout
    if 'AngLayout.tsx' in filepath:
        content = content.replace("import React, { useState, useEffect } from 'react';", "import React from 'react';")
        content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion } from 'motion/react';")
        content = re.sub(r'MessageSquare,.*?\n\s*', '', content)
        content = re.sub(r'Mic, Send, Paperclip\n\} from', '} from', content)
        content = content.replace('CircleDot, }', 'CircleDot }')

    # For ChatView
    if 'ChatView.tsx' in filepath:
        content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion } from 'motion/react';")
        content = content.replace("import { Mic, Paperclip, Send, Square, Check, Edit2 } from 'lucide-react';", "import { Mic, Paperclip, Send, Square } from 'lucide-react';")

    # For DigestView
    if 'DigestView.tsx' in filepath:
        content = content.replace("import { AngSession } from '../../../types/ang';", "")

    with open(filepath, 'w') as f:
        f.write(content)

remove_unused('src/components/ANG/AngLayout.tsx')
remove_unused('src/components/ANG/views/ChatView.tsx')
remove_unused('src/components/ANG/views/DigestView.tsx')
