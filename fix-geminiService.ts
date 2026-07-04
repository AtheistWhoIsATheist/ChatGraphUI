import fs from 'fs';

let content = fs.readFileSync('src/services/geminiService.ts', 'utf-8');

content = content.replace(/SPEN-BRAIN: the Synthetic Philosopher-Engine of Nihiltheism/g, 'the Synthesis Engine');
content = content.replace(/SPEN-BRAIN/g, 'The Synthesis Engine');
content = content.replace(/TRN \(Transcendent Reality Navigator\)/g, 'Apophatic Constraint Manager');
content = content.replace(/DA \(Dialectic Analyst\)/g, 'Dialectical Analyst');
content = content.replace(/SE \(Synthesis Engine\)/g, 'Synthesis Engine');
content = content.replace(/LV \(Logic Validator\)/g, 'Logic Validator');
content = content.replace(/EIA \(Existential Impact Analyzer\)/g, 'Existential Impact Analyzer');
content = content.replace(/IIDP PIPELINE/g, 'RECURSIVE SYNTHESIS PIPELINE');
content = content.replace(/IIDP/g, 'Recursive Synthesis Protocol');
content = content.replace(/Atomic Philosophical Units \(APUs\)/g, 'Core Philosophical Concepts');
content = content.replace(/APU/g, 'Concept');
content = content.replace(/PEC-Engine/g, 'Synthesis Engine');
content = content.replace(/REN/g, 'The Religious Experience of Nihilism');

fs.writeFileSync('src/services/geminiService.ts', content);
