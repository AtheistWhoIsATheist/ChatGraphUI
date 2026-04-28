import fs from 'fs';

const raw = `
THINKER: Emile Cioran
  void_quotient=0.548, absorption=0.483, aperture=0.600, dread=0.533
  pos=(-0.33, 2.0, 0.67) | quote_count=470

THINKER: Ernest Becker
  void_quotient=0.473, absorption=0.500, aperture=0.433, dread=0.600
  pos=(0.0, -1.33, 2.0) | quote_count=326

THINKER: Thomas à Kempis
  void_quotient=0.462, absorption=0.517, aperture=0.483, dread=0.533
  pos=(0.33, -0.33, 0.67) | quote_count=181

THINKER: Evelyn Underhill
  void_quotient=0.565, absorption=0.450, aperture=0.617, dread=0.417
  pos=(-1.0, 2.33, -1.67) | quote_count=179

THINKER: Kierkegaard
  void_quotient=0.475, absorption=0.500, aperture=0.467, dread=0.567
  pos=(0.0, -0.67, 1.33) | quote_count=174

THINKER: St. John of the Cross
  void_quotient=0.545, absorption=0.467, aperture=0.667, dread=0.467
  pos=(-0.67, 3.33, -0.67) | quote_count=158

THINKER: Nietzsche
  void_quotient=0.462, absorption=0.517, aperture=0.483, dread=0.533
  pos=(0.33, -0.33, 0.67) | quote_count=146

THINKER: Lev Shestov
  void_quotient=0.475, absorption=0.500, aperture=0.467, dread=0.567
  pos=(0.0, -0.67, 1.33) | quote_count=142

THINKER: Teresa of Ávila
  void_quotient=0.545, absorption=0.467, aperture=0.667, dread=0.467
  pos=(-0.67, 3.33, -0.67) | quote_count=141

THINKER: Paul Tillich
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=134

THINKER: Aldous Huxley
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=131

THINKER: Mitchell Heisman
  void_quotient=0.438, absorption=0.550, aperture=0.383, dread=0.533
  pos=(1.0, -2.33, 0.67) | quote_count=116

THINKER: Martin Heidegger
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=105

THINKER: Tolstoy
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=103

THINKER: Thomas Ligotti
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=84

THINKER: Fr. Seraphim Rose
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=83

THINKER: Miguel de Molinos
  void_quotient=0.583, absorption=0.400, aperture=0.700, dread=0.400
  pos=(-2.0, 4.0, -2.0) | quote_count=77

THINKER: A.W. Tozer
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=77

THINKER: Pascal
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=76

THINKER: Edgar Saltus
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=72

THINKER: Miguel de Unamuno
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=69

THINKER: Augustine
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=64

THINKER: Plato/Socrates
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=63

THINKER: William James
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=59

THINKER: Taoism
  void_quotient=0.600, absorption=0.433, aperture=0.683, dread=0.400
  pos=(-1.33, 3.67, -2.0) | quote_count=54

THINKER: Buddhism
  void_quotient=0.583, absorption=0.400, aperture=0.700, dread=0.400
  pos=(-2.0, 4.0, -2.0) | quote_count=50

THINKER: Jesus Christ
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=44

THINKER: Meister Eckhart
  void_quotient=0.545, absorption=0.467, aperture=0.667, dread=0.467
  pos=(-0.67, 3.33, -0.67) | quote_count=39

THINKER: GK Chesterton
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=38

THINKER: Therese of Lisieux
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=34

THINKER: Martin Luther
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=33

THINKER: Albert Camus
  void_quotient=0.438, absorption=0.550, aperture=0.383, dread=0.533
  pos=(1.0, -2.33, 0.67) | quote_count=33

THINKER: Swami Vivekananda
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=30

THINKER: Peter Wessel Zapffe
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=28

THINKER: Herman Tønnessen
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=27

THINKER: Bertrand Russell
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=26

THINKER: Thomas Keating
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=26

THINKER: Thomas Merton
  void_quotient=0.583, absorption=0.400, aperture=0.700, dread=0.400
  pos=(-2.0, 4.0, -2.0) | quote_count=26

THINKER: John Shelby Spong
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=26

THINKER: Hinduism
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=25

THINKER: Schopenhauer
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=23

THINKER: Ecclesiastes
  void_quotient=0.438, absorption=0.550, aperture=0.383, dread=0.533
  pos=(1.0, -2.33, 0.67) | quote_count=17

THINKER: Will Durant
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=17

THINKER: C.S. Lewis
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=17

THINKER: Montaigne
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=15

THINKER: Huston Smith
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=14

THINKER: Timothy Leary
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=8

THINKER: John Bunyan
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=5

THINKER: Angela of Foligno
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=3

THINKER: Thomas Aquinas
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=2

THINKER: William Lane Craig
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=2

THINKER: Pseudo-Dionysius
  void_quotient=0.500, absorption=0.500, aperture=0.500, dread=0.500
  pos=(0.0, 0.0, 0.0) | quote_count=1

THEME: Existential Dread                    pos=(8, 4, 12)
THEME: Anxiety                              pos=(6, 2, 10)
THEME: Lack of Objective Meaning, Value, Purpose  pos=(-4, 8, 6)
THEME: Skepticism of Knowledge               pos=(4, -4, 6)
THEME: Limitations of Language              pos=(2, -6, 4)
THEME: Dual Nature of Humans                pos=(0, 4, 4)
THEME: Renunciation of Worldly Endeavors/Contemplative Lifestyle  pos=(-6, 10, 2)
THEME: Ego Dissolution, Authenticity, True-Self, Oneness/Union  pos=(-10, 8, -4)
THEME: Mystical and Nihilistic Experiences  pos=(-8, 12, 4)
THEME: Divine Presence and Suffering         pos=(-4, 14, 6)
THEME: Role of Senses and Silence           pos=(2, 10, -4)
THEME: Conceptualization of God             pos=(-2, 12, 2)
THEME: Inner Turmoil and Growth             pos=(0, 6, 8)
THEME: Human Nature and Temptation          pos=(0, 2, 6)
THEME: Righteousness and Purification       pos=(-2, 8, 4)
THEME: Internal Recollection                pos=(-4, 6, 0)
THEME: Challenges in Spiritual Path         pos=(2, 4, 8)
THEME: Perseverance in Recollection         pos=(-2, 4, 2)
THEME: Benefits of Recollection Over Physical Penances  pos=(-6, 4, -2)
THEME: Caution Against Rigid Penances        pos=(0, 2, 0)
THEME: Misconceptions About Spiritual Practices  pos=(4, 0, 6)
THEME: Pursuit of God's Will and Humility   pos=(-4, 10, 4)
THEME: Approach to Spiritual Practices       pos=(0, 8, -2)
THEME: Divine Presence in Human Imperfection  pos=(-6, 12, 6)
THEME: Avoiding Sensible Pleasures           pos=(6, 2, 4)
`;

let nodes = [];

const lines = raw.split('\n');
let currentThinker = null;

const toId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('THINKER:')) {
    const name = line.replace('THINKER:', '').trim();
    currentThinker = {
      id: "THINKER_" + toId(name),
      label: name,
      type: "thinker",
      properties: {}
    };
    nodes.push(currentThinker);
  } else if (line.startsWith('void_quotient=') && currentThinker) {
    const parts = line.split(',');
    for (let p of parts) {
      const [k,v] = p.trim().split('=');
      if (k && v) {
        currentThinker.properties[k] = parseFloat(v);
      }
    }
  } else if (line.startsWith('pos=') && currentThinker) {
    const [posPart, qcPart] = line.split('|');
    const posMatch = posPart.match(/pos=\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (posMatch) {
      currentThinker.position = {
        x: parseFloat(posMatch[1]),
        y: parseFloat(posMatch[2]),
        z: parseFloat(posMatch[3])
      };
    }
    if (qcPart) {
      const qcMatch = qcPart.trim().split('=');
      if (qcMatch[0] === 'quote_count') {
         currentThinker.properties.quote_count = parseInt(qcMatch[1]);
      }
    }
  } else if (line.startsWith('THEME:')) {
    // THEME: Existential Dread                    pos=(8, 4, 12)
    const match = line.match(/^THEME:\s*(.*?)\s+pos=\((.*)\)$/);
    if (match) {
      const name = match[1].trim();
      const posParts = match[2].split(',').map(n => parseFloat(n.trim()));
      nodes.push({
         id: "THEME_" + toId(name),
         label: name,
         type: "theme",
         properties: {},
         position: { x: posParts[0], y: posParts[1], z: posParts[2] }
      });
    }
  }
}

const edges = [
  {"source": "THINKER_emile_cioran", "target": "THEME_existential_dread", "type": "RESONANCE", "properties": {"score": 0.81}},
  {"source": "THINKER_kierkegaard", "target": "THEME_anxiety", "type": "RESONANCE", "properties": {"score": 0.79}},
  {"source": "THINKER_st_john_of_the_cross", "target": "THEME_divine_presence_and_suffering", "type": "RESONANCE", "properties": {"score": 0.85}},
  {"source": "THINKER_meister_eckhart", "target": "THEME_ego_dissolution_authenticity_true_self_oneness_union", "type": "RESONANCE", "properties": {"score": 0.83}},
  {"source": "THINKER_buddhism", "target": "THEME_mystical_and_nihilistic_experiences", "type": "RESONANCE", "properties": {"score": 0.78}},
  {"source": "THINKER_pascal", "target": "THEME_anxiety", "type": "RESONANCE", "properties": {"score": 0.76}},
  {"source": "THINKER_nietzsche", "target": "THEME_lack_of_objective_meaning_value_purpose", "type": "TENSION", "properties": {"score": 0.72}},
  {"source": "THINKER_tolstoy", "target": "THEME_divine_presence_and_suffering", "type": "RESONANCE", "properties": {"score": 0.74}}
];

// Append these to corpus.ts or print them out
fs.writeFileSync('new_corpus.json', JSON.stringify({nodes, edges}, null, 2));
console.log('Done!');
