const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
content = `import { AngLayout } from './components/ANG/AngLayout';
import { ChatView } from './components/ANG/views/ChatView';
import { AporiaView } from './components/ANG/views/AporiaView';
import { DigestView } from './components/ANG/views/DigestView';
import { SettingsView } from './components/ANG/views/SettingsView';
import { LibraryView } from './components/ANG/views/LibraryView';
import { AngView, GateMode, BoundaryState } from './types/ang';
` + content;

// State additions
const stateToAdd = `
  const [activeAngView, setActiveAngView] = useState<AngView>('chat');
  const [gateMode, setGateMode] = useState<GateMode>('AUTO');
  const [boundaryState, setBoundaryState] = useState<BoundaryState>({ theta: 0.18, mode: 'CLEAR' });
`;
content = content.replace('const App: React.FC = () => {', 'const App: React.FC = () => {' + stateToAdd);

// The return block
const newReturn = `
  return (
    <AngLayout
      activeView={activeAngView}
      onNavigate={setActiveAngView}
      gateMode={gateMode}
      onGateModeChange={setGateMode}
      boundaryState={boundaryState}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAngView}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="h-full"
        >
          {activeAngView === 'chat' && (
            <ChatView 
              messages={[]} 
              onSendMessage={() => {}} 
              boundaryState={boundaryState}
              sessionTime="0h 0m"
              nodesCreated={0}
            />
          )}
          {activeAngView === 'graph' && (
            <OntologyMap
              nodes={displayNodes}
              links={displayLinks}
              corpusTexts={corpusTexts}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onSelectNode={handleSelectNode}
              onHoverNode={handleHoverNode}
              onSelectQuestion={handleSelectQuestion}
              onNavigateToTab={(t) => {}}
              ingestionBatches={ingestionBatches}
              initialFocusSource={targetFocusSource}
            />
          )}
          {activeAngView === 'library' && (
            <LibraryView 
              corpusTexts={corpusTexts}
              marginalia={marginalia}
              onSaveMarginalia={handleSaveMarginalia}
              onDeleteMarginalia={handleDeleteMarginalia}
            />
          )}
          {activeAngView === 'questions' && (
            <AporiaView aporias={[]} />
          )}
          {activeAngView === 'ingest' && (
            <CorpusIntakeTool
              ingestionBatches={ingestionBatches}
              onSaveBatch={handleSaveBatch}
              onDeleteBatch={handleDeleteBatch}
              onClearAllBatches={handleClearAllBatches}
              onNavigateToTab={() => {}}
            />
          )}
          {activeAngView === 'digest' && (
            <DigestView 
              dateStart="Aug 19"
              dateEnd="Aug 26"
              generatedAt={new Date().toISOString()}
              stats={{
                sourcesIngested: 3,
                nodesCreated: 127,
                sessions: 7,
                totalSessionTime: "14h 23m",
                paradoxesConfirmed: 1,
                aporiaAdded: 3,
                invarianceAnalyses: 2,
                newInvariants: 1
              }}
              synthesisNote="The void discloses rather than merely negates. This week's ingestions have reinforced the paradoxical tension between absence and presence."
              pendingReviewCount={4}
            />
          )}
          {activeAngView === 'settings' && (
            <SettingsView />
          )}
        </motion.div>
      </AnimatePresence>
    </AngLayout>
  );
`;

const returnIndex = content.indexOf('  return (\n    <div id="application-root"');
if (returnIndex !== -1) {
  content = content.substring(0, returnIndex) + newReturn + '};';
} else {
  console.log("Could not find return statement");
}

// remove the export default from the bottom if I cut it off
if (!content.includes('export default App;')) {
  content += '\nexport default App;\n';
}

fs.writeFileSync('src/App.tsx', content);
