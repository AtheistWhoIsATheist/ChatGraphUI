/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { NTNodeType, NTEdgeType } from './nt_schema.ts';

export type NodeType =
  | "treatise"
  | "journal"
  | "thinker"
  | "theme"
  | "concept"
  | "fragment"
  | "methodology"
  | "claim"
  | "experience"
  | "library_item"
  | "summary"
  | "question"
  | "praxis"
  | "axiom" | "passage" | "elevation_level" | "term"
  | NTNodeType;

export type NodeStatus =
  | "VERIFIED"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "UNKNOWN"
  | "RAW";

export interface VoidBlock {
  id: string;
  type: "text" | "code" | "heading" | "todo";
  content: string;
  metadata?: {
    lastEdited?: number;
    sentiment?: string;
    checked?: boolean;
    language?: string;
  };
}

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  blocks: VoidBlock[];
  status?: NodeStatus;
  confidence?: number;
  evidence_quote_ids?: string[];
  summary?: string;
  socratic_questions?: string[];
  saturation_level?: number;
  last_audited_date?: Date | string;
  revision_count?: number;
  properties?: any;
  position?: { x: number, y: number, z: number };
  quote_count?: number;
  audit_logs?: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    hash: string;
    details: string;
  }[];
  metadata?: {
    geometry?: "circle" | "square" | "diamond" | "hex" | "octagon";
    chromatic_tag?: string;
    url?: string;
    tags?: string[];
    date_added?: string;
    last_audited_date?: string;
    saturation_level?: number;
    revision_count?: number;
    aporia_state?: "Active" | "Synthesized" | "Terminal";
    embedding?: number[];
    historical_context?: string;
    source_references?: string[];
    philosophical_stance?: string;
    relation_to_void?: string;
    deconstruction_residue?: string;
  };
}

export interface Link {
  source: string;
  target: string;
  label?: string;
  properties?: any;
  type?:
    | "explores"
    | "culminates"
    | "documents"
    | "triggers"
    | "confronts"
    | "paradox"
    | "objection"
    | "resonance"
    | "tension"
    | "attribution" | "O_TO_E_transition" | "uses_term" | "classified_as" | "authored"
    | NTEdgeType;
}

const createBlock = (content: string): VoidBlock => ({
  id: `blk_${Math.random().toString(36).substr(2, 9)}`,
  type: "text",
  content,
  metadata: { lastEdited: Date.now(), sentiment: "neutral" },
});

export const corpusNodes: Node[] = [{
  "id": "THINKER_emile_cioran",
  "label": "Emile Cioran",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.548,
    "absorption": 0.483,
    "aperture": 0.6,
    "dread": 0.533,
    "quote_count": 470
  },
  "position": {
    "x": -0.33,
    "y": 2,
    "z": 0.67
  },
  "quote_count": 470
},{
  "id": "THINKER_ernest_becker",
  "label": "Ernest Becker",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.473,
    "absorption": 0.5,
    "aperture": 0.433,
    "dread": 0.6,
    "quote_count": 326
  },
  "position": {
    "x": 0,
    "y": -1.33,
    "z": 2
  },
  "quote_count": 326
},{
  "id": "THINKER_thomas_kempis",
  "label": "Thomas à Kempis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 181
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 181
},{
  "id": "THINKER_evelyn_underhill",
  "label": "Evelyn Underhill",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.565,
    "absorption": 0.45,
    "aperture": 0.617,
    "dread": 0.417,
    "quote_count": 179
  },
  "position": {
    "x": -1,
    "y": 2.33,
    "z": -1.67
  },
  "quote_count": 179
},{
  "id": "THINKER_kierkegaard",
  "label": "Kierkegaard",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 174
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 174
},{
  "id": "THINKER_st_john_of_the_cross",
  "label": "St. John of the Cross",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 158
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 158
},{
  "id": "THINKER_nietzsche",
  "label": "Nietzsche",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 146
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 146
},{
  "id": "THINKER_lev_shestov",
  "label": "Lev Shestov",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 142
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 142
},{
  "id": "THINKER_teresa_of_vila",
  "label": "Teresa of Ávila",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 141
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 141
},{
  "id": "THINKER_paul_tillich",
  "label": "Paul Tillich",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 134
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 134
},{
  "id": "THINKER_aldous_huxley",
  "label": "Aldous Huxley",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 131
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 131
},{
  "id": "THINKER_mitchell_heisman",
  "label": "Mitchell Heisman",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 116
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 116
},{
  "id": "THINKER_martin_heidegger",
  "label": "Martin Heidegger",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 105
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 105
},{
  "id": "THINKER_tolstoy",
  "label": "Tolstoy",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 103
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 103
},{
  "id": "THINKER_thomas_ligotti",
  "label": "Thomas Ligotti",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 84
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 84
},{
  "id": "THINKER_fr_seraphim_rose",
  "label": "Fr. Seraphim Rose",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 83
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 83
},{
  "id": "THINKER_miguel_de_molinos",
  "label": "Miguel de Molinos",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 77
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 77
},{
  "id": "THINKER_a_w_tozer",
  "label": "A.W. Tozer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 77
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 77
},{
  "id": "THINKER_pascal",
  "label": "Pascal",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 76
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 76
},{
  "id": "THINKER_edgar_saltus",
  "label": "Edgar Saltus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 72
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 72
},{
  "id": "THINKER_miguel_de_unamuno",
  "label": "Miguel de Unamuno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 69
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 69
},{
  "id": "THINKER_augustine",
  "label": "Augustine",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 64
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 64
},{
  "id": "THINKER_plato_socrates",
  "label": "Plato/Socrates",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 63
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 63
},{
  "id": "THINKER_william_james",
  "label": "William James",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 59
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 59
},{
  "id": "THINKER_taoism",
  "label": "Taoism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.6,
    "absorption": 0.433,
    "aperture": 0.683,
    "dread": 0.4,
    "quote_count": 54
  },
  "position": {
    "x": -1.33,
    "y": 3.67,
    "z": -2
  },
  "quote_count": 54
},{
  "id": "THINKER_buddhism",
  "label": "Buddhism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 50
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 50
},{
  "id": "THINKER_jesus_christ",
  "label": "Jesus Christ",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 44
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 44
},{
  "id": "THINKER_meister_eckhart",
  "label": "Meister Eckhart",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 39
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 39
},{
  "id": "THINKER_gk_chesterton",
  "label": "GK Chesterton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 38
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 38
},{
  "id": "THINKER_therese_of_lisieux",
  "label": "Therese of Lisieux",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 34
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 34
},{
  "id": "THINKER_martin_luther",
  "label": "Martin Luther",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 33
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 33
},{
  "id": "THINKER_albert_camus",
  "label": "Albert Camus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 33
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 33
},{
  "id": "THINKER_swami_vivekananda",
  "label": "Swami Vivekananda",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 30
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 30
},{
  "id": "THINKER_peter_wessel_zapffe",
  "label": "Peter Wessel Zapffe",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 28
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 28
},{
  "id": "THINKER_herman_t_nnessen",
  "label": "Herman Tønnessen",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 27
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 27
},{
  "id": "THINKER_bertrand_russell",
  "label": "Bertrand Russell",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_thomas_keating",
  "label": "Thomas Keating",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_thomas_merton",
  "label": "Thomas Merton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 26
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 26
},{
  "id": "THINKER_john_shelby_spong",
  "label": "John Shelby Spong",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_hinduism",
  "label": "Hinduism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 25
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 25
},{
  "id": "THINKER_schopenhauer",
  "label": "Schopenhauer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 23
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 23
},{
  "id": "THINKER_ecclesiastes",
  "label": "Ecclesiastes",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 17
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 17
},{
  "id": "THINKER_will_durant",
  "label": "Will Durant",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},{
  "id": "THINKER_c_s_lewis",
  "label": "C.S. Lewis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},{
  "id": "THINKER_montaigne",
  "label": "Montaigne",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 15
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 15
},{
  "id": "THINKER_huston_smith",
  "label": "Huston Smith",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 14
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 14
},{
  "id": "THINKER_timothy_leary",
  "label": "Timothy Leary",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 8
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 8
},{
  "id": "THINKER_john_bunyan",
  "label": "John Bunyan",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 5
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 5
},{
  "id": "THINKER_angela_of_foligno",
  "label": "Angela of Foligno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 3
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 3
},{
  "id": "THINKER_thomas_aquinas",
  "label": "Thomas Aquinas",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},{
  "id": "THINKER_william_lane_craig",
  "label": "William Lane Craig",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},{
  "id": "THINKER_pseudo_dionysius",
  "label": "Pseudo-Dionysius",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 1
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 1
},{
  "id": "THEME_existential_dread",
  "label": "Existential Dread",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 8,
    "y": 4,
    "z": 12
  },
  "quote_count": 0
},{
  "id": "THEME_anxiety",
  "label": "Anxiety",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 10
  },
  "quote_count": 0
},{
  "id": "THEME_lack_of_objective_meaning_value_purpose",
  "label": "Lack of Objective Meaning, Value, Purpose",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 8,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_skepticism_of_knowledge",
  "label": "Skepticism of Knowledge",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": -4,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_limitations_of_language",
  "label": "Limitations of Language",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": -6,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_dual_nature_of_humans",
  "label": "Dual Nature of Humans",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 4,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_renunciation_of_worldly_endeavors_contemplative_lifestyle",
  "label": "Renunciation of Worldly Endeavors/Contemplative Lifestyle",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 10,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "label": "Ego Dissolution, Authenticity, True-Self, Oneness/Union",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -10,
    "y": 8,
    "z": -4
  },
  "quote_count": 0
},{
  "id": "THEME_mystical_and_nihilistic_experiences",
  "label": "Mystical and Nihilistic Experiences",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -8,
    "y": 12,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_divine_presence_and_suffering",
  "label": "Divine Presence and Suffering",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 14,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_role_of_senses_and_silence",
  "label": "Role of Senses and Silence",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 10,
    "z": -4
  },
  "quote_count": 0
},{
  "id": "THEME_conceptualization_of_god",
  "label": "Conceptualization of God",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 12,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_inner_turmoil_and_growth",
  "label": "Inner Turmoil and Growth",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 6,
    "z": 8
  },
  "quote_count": 0
},{
  "id": "THEME_human_nature_and_temptation",
  "label": "Human Nature and Temptation",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_righteousness_and_purification",
  "label": "Righteousness and Purification",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 8,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_internal_recollection",
  "label": "Internal Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 6,
    "z": 0
  },
  "quote_count": 0
},{
  "id": "THEME_challenges_in_spiritual_path",
  "label": "Challenges in Spiritual Path",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 4,
    "z": 8
  },
  "quote_count": 0
},{
  "id": "THEME_perseverance_in_recollection",
  "label": "Perseverance in Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 4,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_benefits_of_recollection_over_physical_penances",
  "label": "Benefits of Recollection Over Physical Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 4,
    "z": -2
  },
  "quote_count": 0
},{
  "id": "THEME_caution_against_rigid_penances",
  "label": "Caution Against Rigid Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 0
  },
  "quote_count": 0
},{
  "id": "THEME_misconceptions_about_spiritual_practices",
  "label": "Misconceptions About Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": 0,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_pursuit_of_god_s_will_and_humility",
  "label": "Pursuit of God's Will and Humility",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 10,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_approach_to_spiritual_practices",
  "label": "Approach to Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 8,
    "z": -2
  },
  "quote_count": 0
},{
  "id": "THEME_divine_presence_in_human_imperfection",
  "label": "Divine Presence in Human Imperfection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 12,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_avoiding_sensible_pleasures",
  "label": "Avoiding Sensible Pleasures",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THINKER_emile_cioran",
  "label": "Emile Cioran",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.548,
    "absorption": 0.483,
    "aperture": 0.6,
    "dread": 0.533,
    "quote_count": 470
  },
  "position": {
    "x": -0.33,
    "y": 2,
    "z": 0.67
  },
  "quote_count": 470
},{
  "id": "THINKER_ernest_becker",
  "label": "Ernest Becker",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.473,
    "absorption": 0.5,
    "aperture": 0.433,
    "dread": 0.6,
    "quote_count": 326
  },
  "position": {
    "x": 0,
    "y": -1.33,
    "z": 2
  },
  "quote_count": 326
},{
  "id": "THINKER_thomas_kempis",
  "label": "Thomas à Kempis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 181
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 181
},{
  "id": "THINKER_evelyn_underhill",
  "label": "Evelyn Underhill",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.565,
    "absorption": 0.45,
    "aperture": 0.617,
    "dread": 0.417,
    "quote_count": 179
  },
  "position": {
    "x": -1,
    "y": 2.33,
    "z": -1.67
  },
  "quote_count": 179
},{
  "id": "THINKER_kierkegaard",
  "label": "Kierkegaard",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 174
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 174
},{
  "id": "THINKER_st_john_of_the_cross",
  "label": "St. John of the Cross",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 158
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 158
},{
  "id": "THINKER_nietzsche",
  "label": "Nietzsche",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 146
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 146
},{
  "id": "THINKER_lev_shestov",
  "label": "Lev Shestov",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 142
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 142
},{
  "id": "THINKER_teresa_of_vila",
  "label": "Teresa of Ávila",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 141
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 141
},{
  "id": "THINKER_paul_tillich",
  "label": "Paul Tillich",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 134
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 134
},{
  "id": "THINKER_aldous_huxley",
  "label": "Aldous Huxley",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 131
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 131
},{
  "id": "THINKER_mitchell_heisman",
  "label": "Mitchell Heisman",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 116
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 116
},{
  "id": "THINKER_martin_heidegger",
  "label": "Martin Heidegger",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 105
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 105
},{
  "id": "THINKER_tolstoy",
  "label": "Tolstoy",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 103
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 103
},{
  "id": "THINKER_thomas_ligotti",
  "label": "Thomas Ligotti",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 84
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 84
},{
  "id": "THINKER_fr_seraphim_rose",
  "label": "Fr. Seraphim Rose",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 83
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 83
},{
  "id": "THINKER_miguel_de_molinos",
  "label": "Miguel de Molinos",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 77
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 77
},{
  "id": "THINKER_a_w_tozer",
  "label": "A.W. Tozer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 77
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 77
},{
  "id": "THINKER_pascal",
  "label": "Pascal",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 76
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 76
},{
  "id": "THINKER_edgar_saltus",
  "label": "Edgar Saltus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 72
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 72
},{
  "id": "THINKER_miguel_de_unamuno",
  "label": "Miguel de Unamuno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 69
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 69
},{
  "id": "THINKER_augustine",
  "label": "Augustine",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 64
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 64
},{
  "id": "THINKER_plato_socrates",
  "label": "Plato/Socrates",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 63
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 63
},{
  "id": "THINKER_william_james",
  "label": "William James",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 59
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 59
},{
  "id": "THINKER_taoism",
  "label": "Taoism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.6,
    "absorption": 0.433,
    "aperture": 0.683,
    "dread": 0.4,
    "quote_count": 54
  },
  "position": {
    "x": -1.33,
    "y": 3.67,
    "z": -2
  },
  "quote_count": 54
},{
  "id": "THINKER_buddhism",
  "label": "Buddhism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 50
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 50
},{
  "id": "THINKER_jesus_christ",
  "label": "Jesus Christ",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 44
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 44
},{
  "id": "THINKER_meister_eckhart",
  "label": "Meister Eckhart",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 39
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 39
},{
  "id": "THINKER_gk_chesterton",
  "label": "GK Chesterton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 38
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 38
},{
  "id": "THINKER_therese_of_lisieux",
  "label": "Therese of Lisieux",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 34
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 34
},{
  "id": "THINKER_martin_luther",
  "label": "Martin Luther",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 33
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 33
},{
  "id": "THINKER_albert_camus",
  "label": "Albert Camus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 33
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 33
},{
  "id": "THINKER_swami_vivekananda",
  "label": "Swami Vivekananda",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 30
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 30
},{
  "id": "THINKER_peter_wessel_zapffe",
  "label": "Peter Wessel Zapffe",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 28
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 28
},{
  "id": "THINKER_herman_t_nnessen",
  "label": "Herman Tønnessen",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 27
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 27
},{
  "id": "THINKER_bertrand_russell",
  "label": "Bertrand Russell",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_thomas_keating",
  "label": "Thomas Keating",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_thomas_merton",
  "label": "Thomas Merton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 26
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 26
},{
  "id": "THINKER_john_shelby_spong",
  "label": "John Shelby Spong",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},{
  "id": "THINKER_hinduism",
  "label": "Hinduism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 25
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 25
},{
  "id": "THINKER_schopenhauer",
  "label": "Schopenhauer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 23
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 23
},{
  "id": "THINKER_ecclesiastes",
  "label": "Ecclesiastes",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 17
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 17
},{
  "id": "THINKER_will_durant",
  "label": "Will Durant",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},{
  "id": "THINKER_c_s_lewis",
  "label": "C.S. Lewis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},{
  "id": "THINKER_montaigne",
  "label": "Montaigne",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 15
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 15
},{
  "id": "THINKER_huston_smith",
  "label": "Huston Smith",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 14
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 14
},{
  "id": "THINKER_timothy_leary",
  "label": "Timothy Leary",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 8
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 8
},{
  "id": "THINKER_john_bunyan",
  "label": "John Bunyan",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 5
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 5
},{
  "id": "THINKER_angela_of_foligno",
  "label": "Angela of Foligno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 3
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 3
},{
  "id": "THINKER_thomas_aquinas",
  "label": "Thomas Aquinas",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},{
  "id": "THINKER_william_lane_craig",
  "label": "William Lane Craig",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},{
  "id": "THINKER_pseudo_dionysius",
  "label": "Pseudo-Dionysius",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 1
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 1
},{
  "id": "THEME_existential_dread",
  "label": "Existential Dread",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 8,
    "y": 4,
    "z": 12
  },
  "quote_count": 0
},{
  "id": "THEME_anxiety",
  "label": "Anxiety",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 10
  },
  "quote_count": 0
},{
  "id": "THEME_lack_of_objective_meaning_value_purpose",
  "label": "Lack of Objective Meaning, Value, Purpose",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 8,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_skepticism_of_knowledge",
  "label": "Skepticism of Knowledge",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": -4,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_limitations_of_language",
  "label": "Limitations of Language",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": -6,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_dual_nature_of_humans",
  "label": "Dual Nature of Humans",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 4,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_renunciation_of_worldly_endeavors_contemplative_lifestyle",
  "label": "Renunciation of Worldly Endeavors/Contemplative Lifestyle",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 10,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "label": "Ego Dissolution, Authenticity, True-Self, Oneness/Union",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -10,
    "y": 8,
    "z": -4
  },
  "quote_count": 0
},{
  "id": "THEME_mystical_and_nihilistic_experiences",
  "label": "Mystical and Nihilistic Experiences",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -8,
    "y": 12,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_divine_presence_and_suffering",
  "label": "Divine Presence and Suffering",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 14,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_role_of_senses_and_silence",
  "label": "Role of Senses and Silence",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 10,
    "z": -4
  },
  "quote_count": 0
},{
  "id": "THEME_conceptualization_of_god",
  "label": "Conceptualization of God",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 12,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_inner_turmoil_and_growth",
  "label": "Inner Turmoil and Growth",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 6,
    "z": 8
  },
  "quote_count": 0
},{
  "id": "THEME_human_nature_and_temptation",
  "label": "Human Nature and Temptation",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_righteousness_and_purification",
  "label": "Righteousness and Purification",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 8,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_internal_recollection",
  "label": "Internal Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 6,
    "z": 0
  },
  "quote_count": 0
},{
  "id": "THEME_challenges_in_spiritual_path",
  "label": "Challenges in Spiritual Path",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 4,
    "z": 8
  },
  "quote_count": 0
},{
  "id": "THEME_perseverance_in_recollection",
  "label": "Perseverance in Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 4,
    "z": 2
  },
  "quote_count": 0
},{
  "id": "THEME_benefits_of_recollection_over_physical_penances",
  "label": "Benefits of Recollection Over Physical Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 4,
    "z": -2
  },
  "quote_count": 0
},{
  "id": "THEME_caution_against_rigid_penances",
  "label": "Caution Against Rigid Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 0
  },
  "quote_count": 0
},{
  "id": "THEME_misconceptions_about_spiritual_practices",
  "label": "Misconceptions About Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": 0,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_pursuit_of_god_s_will_and_humility",
  "label": "Pursuit of God's Will and Humility",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 10,
    "z": 4
  },
  "quote_count": 0
},{
  "id": "THEME_approach_to_spiritual_practices",
  "label": "Approach to Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 8,
    "z": -2
  },
  "quote_count": 0
},{
  "id": "THEME_divine_presence_in_human_imperfection",
  "label": "Divine Presence in Human Imperfection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 12,
    "z": 6
  },
  "quote_count": 0
},{
  "id": "THEME_avoiding_sensible_pleasures",
  "label": "Avoiding Sensible Pleasures",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THINKER_emile_cioran",
  "label": "Emile Cioran",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.548,
    "absorption": 0.483,
    "aperture": 0.6,
    "dread": 0.533,
    "quote_count": 470
  },
  "position": {
    "x": -0.33,
    "y": 2,
    "z": 0.67
  },
  "quote_count": 470
},
{
  "id": "THINKER_ernest_becker",
  "label": "Ernest Becker",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.473,
    "absorption": 0.5,
    "aperture": 0.433,
    "dread": 0.6,
    "quote_count": 326
  },
  "position": {
    "x": 0,
    "y": -1.33,
    "z": 2
  },
  "quote_count": 326
},
{
  "id": "THINKER_thomas_kempis",
  "label": "Thomas à Kempis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 181
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 181
},
{
  "id": "THINKER_evelyn_underhill",
  "label": "Evelyn Underhill",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.565,
    "absorption": 0.45,
    "aperture": 0.617,
    "dread": 0.417,
    "quote_count": 179
  },
  "position": {
    "x": -1,
    "y": 2.33,
    "z": -1.67
  },
  "quote_count": 179
},
{
  "id": "THINKER_kierkegaard",
  "label": "Kierkegaard",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 174
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 174
},
{
  "id": "THINKER_st_john_of_the_cross",
  "label": "St. John of the Cross",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 158
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 158
},
{
  "id": "THINKER_nietzsche",
  "label": "Nietzsche",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.462,
    "absorption": 0.517,
    "aperture": 0.483,
    "dread": 0.533,
    "quote_count": 146
  },
  "position": {
    "x": 0.33,
    "y": -0.33,
    "z": 0.67
  },
  "quote_count": 146
},
{
  "id": "THINKER_lev_shestov",
  "label": "Lev Shestov",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.475,
    "absorption": 0.5,
    "aperture": 0.467,
    "dread": 0.567,
    "quote_count": 142
  },
  "position": {
    "x": 0,
    "y": -0.67,
    "z": 1.33
  },
  "quote_count": 142
},
{
  "id": "THINKER_teresa_of_vila",
  "label": "Teresa of Ávila",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 141
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 141
},
{
  "id": "THINKER_paul_tillich",
  "label": "Paul Tillich",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 134
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 134
},
{
  "id": "THINKER_aldous_huxley",
  "label": "Aldous Huxley",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 131
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 131
},
{
  "id": "THINKER_mitchell_heisman",
  "label": "Mitchell Heisman",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 116
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 116
},
{
  "id": "THINKER_martin_heidegger",
  "label": "Martin Heidegger",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 105
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 105
},
{
  "id": "THINKER_tolstoy",
  "label": "Tolstoy",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 103
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 103
},
{
  "id": "THINKER_thomas_ligotti",
  "label": "Thomas Ligotti",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 84
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 84
},
{
  "id": "THINKER_fr_seraphim_rose",
  "label": "Fr. Seraphim Rose",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 83
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 83
},
{
  "id": "THINKER_miguel_de_molinos",
  "label": "Miguel de Molinos",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 77
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 77
},
{
  "id": "THINKER_a_w_tozer",
  "label": "A.W. Tozer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 77
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 77
},
{
  "id": "THINKER_pascal",
  "label": "Pascal",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 76
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 76
},
{
  "id": "THINKER_edgar_saltus",
  "label": "Edgar Saltus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 72
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 72
},
{
  "id": "THINKER_miguel_de_unamuno",
  "label": "Miguel de Unamuno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 69
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 69
},
{
  "id": "THINKER_augustine",
  "label": "Augustine",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 64
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 64
},
{
  "id": "THINKER_plato_socrates",
  "label": "Plato/Socrates",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 63
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 63
},
{
  "id": "THINKER_william_james",
  "label": "William James",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 59
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 59
},
{
  "id": "THINKER_taoism",
  "label": "Taoism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.6,
    "absorption": 0.433,
    "aperture": 0.683,
    "dread": 0.4,
    "quote_count": 54
  },
  "position": {
    "x": -1.33,
    "y": 3.67,
    "z": -2
  },
  "quote_count": 54
},
{
  "id": "THINKER_buddhism",
  "label": "Buddhism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 50
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 50
},
{
  "id": "THINKER_jesus_christ",
  "label": "Jesus Christ",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 44
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 44
},
{
  "id": "THINKER_meister_eckhart",
  "label": "Meister Eckhart",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.545,
    "absorption": 0.467,
    "aperture": 0.667,
    "dread": 0.467,
    "quote_count": 39
  },
  "position": {
    "x": -0.67,
    "y": 3.33,
    "z": -0.67
  },
  "quote_count": 39
},
{
  "id": "THINKER_gk_chesterton",
  "label": "GK Chesterton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 38
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 38
},
{
  "id": "THINKER_therese_of_lisieux",
  "label": "Therese of Lisieux",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 34
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 34
},
{
  "id": "THINKER_martin_luther",
  "label": "Martin Luther",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 33
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 33
},
{
  "id": "THINKER_albert_camus",
  "label": "Albert Camus",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 33
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 33
},
{
  "id": "THINKER_swami_vivekananda",
  "label": "Swami Vivekananda",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 30
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 30
},
{
  "id": "THINKER_peter_wessel_zapffe",
  "label": "Peter Wessel Zapffe",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 28
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 28
},
{
  "id": "THINKER_herman_t_nnessen",
  "label": "Herman Tønnessen",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 27
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 27
},
{
  "id": "THINKER_bertrand_russell",
  "label": "Bertrand Russell",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},
{
  "id": "THINKER_thomas_keating",
  "label": "Thomas Keating",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},
{
  "id": "THINKER_thomas_merton",
  "label": "Thomas Merton",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.583,
    "absorption": 0.4,
    "aperture": 0.7,
    "dread": 0.4,
    "quote_count": 26
  },
  "position": {
    "x": -2,
    "y": 4,
    "z": -2
  },
  "quote_count": 26
},
{
  "id": "THINKER_john_shelby_spong",
  "label": "John Shelby Spong",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 26
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 26
},
{
  "id": "THINKER_hinduism",
  "label": "Hinduism",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 25
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 25
},
{
  "id": "THINKER_schopenhauer",
  "label": "Schopenhauer",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 23
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 23
},
{
  "id": "THINKER_ecclesiastes",
  "label": "Ecclesiastes",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.438,
    "absorption": 0.55,
    "aperture": 0.383,
    "dread": 0.533,
    "quote_count": 17
  },
  "position": {
    "x": 1,
    "y": -2.33,
    "z": 0.67
  },
  "quote_count": 17
},
{
  "id": "THINKER_will_durant",
  "label": "Will Durant",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},
{
  "id": "THINKER_c_s_lewis",
  "label": "C.S. Lewis",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 17
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 17
},
{
  "id": "THINKER_montaigne",
  "label": "Montaigne",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 15
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 15
},
{
  "id": "THINKER_huston_smith",
  "label": "Huston Smith",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 14
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 14
},
{
  "id": "THINKER_timothy_leary",
  "label": "Timothy Leary",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 8
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 8
},
{
  "id": "THINKER_john_bunyan",
  "label": "John Bunyan",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 5
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 5
},
{
  "id": "THINKER_angela_of_foligno",
  "label": "Angela of Foligno",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 3
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 3
},
{
  "id": "THINKER_thomas_aquinas",
  "label": "Thomas Aquinas",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},
{
  "id": "THINKER_william_lane_craig",
  "label": "William Lane Craig",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 2
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 2
},
{
  "id": "THINKER_pseudo_dionysius",
  "label": "Pseudo-Dionysius",
  "type": "thinker",
  "blocks": [],
  "metadata": {
    "geometry": "circle"
  },
  "properties": {
    "void_quotient": 0.5,
    "absorption": 0.5,
    "aperture": 0.5,
    "dread": 0.5,
    "quote_count": 1
  },
  "position": {
    "x": 0,
    "y": 0,
    "z": 0
  },
  "quote_count": 1
},
{
  "id": "THEME_existential_dread",
  "label": "Existential Dread",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 8,
    "y": 4,
    "z": 12
  },
  "quote_count": 0
},
{
  "id": "THEME_anxiety",
  "label": "Anxiety",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 10
  },
  "quote_count": 0
},
{
  "id": "THEME_lack_of_objective_meaning_value_purpose",
  "label": "Lack of Objective Meaning, Value, Purpose",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 8,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_skepticism_of_knowledge",
  "label": "Skepticism of Knowledge",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": -4,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_limitations_of_language",
  "label": "Limitations of Language",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": -6,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THEME_dual_nature_of_humans",
  "label": "Dual Nature of Humans",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 4,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THEME_renunciation_of_worldly_endeavors_contemplative_lifestyle",
  "label": "Renunciation of Worldly Endeavors/Contemplative Lifestyle",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 10,
    "z": 2
  },
  "quote_count": 0
},
{
  "id": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "label": "Ego Dissolution, Authenticity, True-Self, Oneness/Union",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -10,
    "y": 8,
    "z": -4
  },
  "quote_count": 0
},
{
  "id": "THEME_mystical_and_nihilistic_experiences",
  "label": "Mystical and Nihilistic Experiences",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -8,
    "y": 12,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THEME_divine_presence_and_suffering",
  "label": "Divine Presence and Suffering",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 14,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_role_of_senses_and_silence",
  "label": "Role of Senses and Silence",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 10,
    "z": -4
  },
  "quote_count": 0
},
{
  "id": "THEME_conceptualization_of_god",
  "label": "Conceptualization of God",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 12,
    "z": 2
  },
  "quote_count": 0
},
{
  "id": "THEME_inner_turmoil_and_growth",
  "label": "Inner Turmoil and Growth",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 6,
    "z": 8
  },
  "quote_count": 0
},
{
  "id": "THEME_human_nature_and_temptation",
  "label": "Human Nature and Temptation",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_righteousness_and_purification",
  "label": "Righteousness and Purification",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 8,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THEME_internal_recollection",
  "label": "Internal Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 6,
    "z": 0
  },
  "quote_count": 0
},
{
  "id": "THEME_challenges_in_spiritual_path",
  "label": "Challenges in Spiritual Path",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 2,
    "y": 4,
    "z": 8
  },
  "quote_count": 0
},
{
  "id": "THEME_perseverance_in_recollection",
  "label": "Perseverance in Recollection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -2,
    "y": 4,
    "z": 2
  },
  "quote_count": 0
},
{
  "id": "THEME_benefits_of_recollection_over_physical_penances",
  "label": "Benefits of Recollection Over Physical Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 4,
    "z": -2
  },
  "quote_count": 0
},
{
  "id": "THEME_caution_against_rigid_penances",
  "label": "Caution Against Rigid Penances",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 2,
    "z": 0
  },
  "quote_count": 0
},
{
  "id": "THEME_misconceptions_about_spiritual_practices",
  "label": "Misconceptions About Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 4,
    "y": 0,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_pursuit_of_god_s_will_and_humility",
  "label": "Pursuit of God's Will and Humility",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -4,
    "y": 10,
    "z": 4
  },
  "quote_count": 0
},
{
  "id": "THEME_approach_to_spiritual_practices",
  "label": "Approach to Spiritual Practices",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 0,
    "y": 8,
    "z": -2
  },
  "quote_count": 0
},
{
  "id": "THEME_divine_presence_in_human_imperfection",
  "label": "Divine Presence in Human Imperfection",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": -6,
    "y": 12,
    "z": 6
  },
  "quote_count": 0
},
{
  "id": "THEME_avoiding_sensible_pleasures",
  "label": "Avoiding Sensible Pleasures",
  "type": "theme",
  "blocks": [],
  "metadata": {
    "geometry": "diamond"
  },
  "properties": {},
  "position": {
    "x": 6,
    "y": 2,
    "z": 4
  },
  "quote_count": 0
},
  {
    id: "mac_alpha",
    label: "MAC_α (Minimum Apophatic Condition)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("The Minimum Apophatic Condition (MAC_α) states that any valid nihiltheistic assertion must first pass through the negation of all positive theological and philosophical constructs before it can point to the generative Void.")
    ],
    metadata: { 
      tags: ["axiom", "apophasis", "void"],
      historical_context: "Formulated during the early stages of the Void-Graph Protocol to establish a baseline for rigorous philosophical inquiry.",
      source_references: ["The Cloud of Unknowing", "Pseudo-Dionysius the Areopagite"],
      philosophical_stance: "Radical Negation",
      relation_to_void: "Acts as the primary filter or gateway through which all concepts must pass before entering the Void.",
      saturation_level: 85,
      deconstruction_residue: "The persistent human desire to name the unnameable."
    }
  },
  {
    id: "aif",
    label: "AIF (Abyssal Integration Factor)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("The Abyssal Integration Factor (AIF) measures the degree to which an individual or system has integrated the reality of groundlessness into their operational framework without collapsing into passive nihilism.")
    ],
    metadata: { tags: ["axiom", "integration", "abyss"] }
  },
  {
    id: "s_100",
    label: "S→100% (Total Semantic Saturation)",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock("S→100% represents the theoretical limit where all nodes in the knowledge graph achieve total semantic saturation, meaning every concept is fully cross-referenced, densified, and integrated into the overarching ontology.")
    ],
    metadata: { tags: ["axiom", "saturation", "system"] }
  },
  {
    id: "codex_a",
    label: "A-Series (Apophatic Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The A-Series defines the operational protocols for apophatic inquiry, focusing on the systematic dismantling of linguistic and conceptual idols to reveal the underlying Void.")
    ],
    metadata: { tags: ["codex", "apophasis", "operations"] }
  },
  {
    id: "codex_k",
    label: "K-Series (Kenotic Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The K-Series outlines the practices of self-emptying (kenosis), providing a framework for the individual to align their internal state with the ontological reality of groundlessness.")
    ],
    metadata: { tags: ["codex", "kenosis", "operations"] }
  },
  {
    id: "codex_o",
    label: "O-Series (Ontological Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The O-Series governs the mapping and navigation of the ontological landscape, specifically the transition from the collapse of meaning to the encounter with the Sacred Absence.")
    ],
    metadata: { tags: ["codex", "ontology", "operations"] }
  },
  {
    id: "codex_rn",
    label: "RN-Series (Radical Negation Operations)",
    type: "methodology",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock("The RN-Series details the extreme protocols for Radical Negation, employed when standard apophatic methods fail to break through entrenched dogmatic or nihilistic structures.")
    ],
    metadata: { tags: ["codex", "negation", "operations"] }
  },
  {
    id: "praxis_ckip",
    label: "CKIP (Continuous Kenotic Integration Protocol)",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("CKIP is the daily practice of identifying and releasing attachments to meaning-structures, ensuring a continuous state of kenotic openness to the Void.")
    ],
    metadata: { tags: ["praxis", "kenosis", "integration"] }
  },
  {
    id: "praxis_postural_negation",
    label: "Postural Negation",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("An embodied practice where physical posture and spatial orientation are used to mirror and induce the psychological state of apophasis and surrender to groundlessness.")
    ],
    metadata: { tags: ["praxis", "embodiment", "negation"] }
  },
  {
    id: "praxis_radical_withdrawal",
    label: "Radical Withdrawal",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("A strategic, temporary disengagement from all social, linguistic, and conceptual networks to experience the unmediated weight of the Void, resetting the AIF.")
    ],
    metadata: { tags: ["praxis", "withdrawal", "void"] }
  },
  {
    id: "praxis_sunset_clause",
    label: "Sunset Clause",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("The mandatory, built-in obsolescence of any newly constructed meaning-framework, ensuring that no concept solidifies into an idol. All structures must eventually be subjected to the A-Series.")
    ],
    metadata: { tags: ["praxis", "impermanence", "system"] }
  },
  {
    id: "praxis_negative_solidarity",
    label: "Negative Solidarity",
    type: "praxis",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock("The formation of community not around shared beliefs or positive identities, but around the shared experience of existential rupture and the mutual recognition of the Void.")
    ],
    metadata: { tags: ["praxis", "community", "rupture"] }
  },
  {
    id: "ren",
    label: "REN (The Religious Experience of Nihilism)",
    type: "treatise",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# The Religious Experience of Nihilism\n\nChapter 1: The foundation of nihiltheism lies in the absolute confrontation with the Void. It is not a passive despair, but an active, terrifying encounter with groundlessness. When all structures collapse, what remains is the pure, unmediated presence of nothingness—which, paradoxically, is the only true ground.",
      ),
    ],
    metadata: {
      geometry: "octagon",
      chromatic_tag: "methodology_accent_1",
      tags: ["void", "presence"],
    },
  },
  {
    id: "journal314",
    label: "Journal314 (The 52 Thinkers)",
    type: "journal",
    status: "VERIFIED",
    confidence: 0.95,
    blocks: [
      createBlock(
        "# Journal314\n\nA massive phenomenological mapping of 52 different thinkers spanning centuries. The sheer volume of dense, abstract text forms a labyrinth of modern thought. This journal seeks the Unified Voice across historically opposed traditions.",
      ),
    ],
    metadata: { geometry: "hex", tags: ["phenomenology", "mapping"] },
  },
  {
    id: "cioran",
    label: "E.M. Cioran",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# E.M. Cioran\n\nCioran understood the insomnia of the soul. His aphorisms are not mere pessimism; they are a lucid diagnosis of the human condition. He saw the Void, but perhaps stopped short of finding the divine *within* it.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["void", "despair"] },
  },
  {
    id: "ligotti",
    label: "Thomas Ligotti",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.85,
    blocks: [
      createBlock(
        "# Thomas Ligotti\n\nLigotti's horror is ontological. The nightmare is not monsters, but the realization that we are puppets without a puppeteer. This aligns perfectly with the initial stage of the Nihiltheistic realization: the horror of the mechanism.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["horror", "mechanism"] },
  },
  {
    id: "kierkegaard",
    label: "Søren Kierkegaard",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.8,
    blocks: [
      createBlock(
        "# Søren Kierkegaard\n\nThe leap of faith. But what if the leap is not into the arms of a loving God, but into the center of the Void itself? The anxiety (Angst) he describes is the dizziness of freedom facing the abyss.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["angst", "faith"] },
  },
  {
    id: "nagarjuna",
    label: "Nāgārjuna",
    type: "thinker",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Nāgārjuna\n\nŚūnyatā (Emptiness). The ultimate truth is that all phenomena are empty of inherent existence. This is the Eastern parallel to the Western Void, but framed not as a tragedy, but as liberation.",
      ),
    ],
    metadata: { geometry: "diamond", tags: ["emptiness", "liberation"] },
  },
  {
    id: "void",
    label: "The Void",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# The Void\n\nThe central axis of Nihiltheism. It is the absence of inherent meaning, structure, or divine guarantee. It is both the terror that induces spiritual emergency and the canvas for true, unconditioned presence.",
      ),
    ],
    metadata: {
      geometry: "circle",
      chromatic_tag: "void_primary",
      tags: ["void", "absence"],
    },
  },
  {
    id: "presence",
    label: "Presence",
    type: "concept",
    status: "INFERENCE",
    confidence: 0.7,
    blocks: [
      createBlock(
        "# Presence\n\nWhat emerges when the ego's desperate grasp for meaning ceases. It is the fullness found only at the very bottom of the Void. A paradoxical state of being where nothing matters, and therefore everything is infinitely precious.",
      ),
    ],
    metadata: { geometry: "circle", tags: ["presence", "fullness"] },
  },
  {
    id: "spiritual_emergency",
    label: "Spiritual Emergency",
    type: "experience",
    status: "VERIFIED",
    confidence: 0.85,
    blocks: [
      createBlock(
        "# Spiritual Emergency\n\nThe crisis that occurs when an individual's meaning-structures collapse before they are capable of integrating the Void. It can mimic psychosis but is fundamentally an ontological crisis, a birth pang of the Nihiltheistic realization.\n\n**BOUNDARY NOTE**: This is a phenomenological state, not a clinical diagnosis.",
      ),
    ],
    metadata: { geometry: "square", tags: ["crisis", "collapse"] },
  },
  {
    id: "collapse",
    label: "Collapse",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Collapse\n\nThe necessary destruction of false idols. The dismantling of the ego's scaffolding.",
      ),
    ],
    metadata: { geometry: "hex", tags: ["collapse", "destruction"] },
  },
  {
    id: "anpes",
    label: "ANPES Engine",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# ANPES (Advanced Nihiltheistic Prompt Engineering System)\n\nThe meta-cognitive engine that transforms Nihiltheistic philosophy into executable protocols. It maintains paradox without collapse.",
      ),
    ],
    metadata: {
      geometry: "octagon",
      chromatic_tag: "methodology_accent_2",
      tags: ["methodology", "engine"],
    },
  },
  {
    id: "existential_emptiness",
    label: "Existential Emptiness",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Existential Emptiness\n\nThe modern, secular experience of meaninglessness. Often pathologized, but structurally identical to the initial stages of apophatic descent.",
      ),
    ],
    metadata: { geometry: "circle", tags: ["phenomenology"] },
  },
  {
    id: "mystical_experience",
    label: "Mystical Experience",
    type: "experience",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Mystical Experience\n\nThe direct, unmediated encounter with the Absolute. In the Nihiltheistic framework, this is achieved not through addition of dogma, but through the absolute subtraction of all constructs.",
      ),
    ],
    metadata: { geometry: "square", tags: ["phenomenology"] },
  },
  {
    id: "lib_001",
    label: "The Architecture of Absence",
    type: "library_item",
    status: "RAW",
    blocks: [
      createBlock(
        "A deep-dive video essay exploring the spatial representation of the Void in modern architecture.",
      ),
    ],
    metadata: {
      url: "https://example.com/void-arch",
      tags: ["architecture", "void", "spatiality"],
      date_added: "2026-02-28",
      geometry: "square",
    },
  },
  {
    id: "sum_001",
    label: "Summary: Spatial Void",
    type: "summary",
    status: "INFERENCE",
    confidence: 0.8,
    blocks: [
      createBlock(
        "The spatial void is not an empty room, but a room that *contains* emptiness as a structural member. Architecture becomes the frame for the unframeable.",
      ),
    ],
    evidence_quote_ids: ["lib_001"],
    metadata: { tags: ["transcendent", "framing"], geometry: "hex" },
  },
  {
    id: "q_001",
    label: "Can the Void be inhabited?",
    type: "question",
    status: "HYPOTHESIS",
    blocks: [
      createBlock(
        "If the Void is the only true ground, does habitation imply a re-imposition of scaffolding, or a new mode of groundless being?",
      ),
    ],
    metadata: { tags: ["habitation", "ontology"], geometry: "diamond" },
  },
  {
    id: "saturation_100",
    label: "100% Saturation",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# 100% Saturation\n\nA multi-axis criterion for completeness. Achieved when no new entities or properties emerge, relationships are stable, scope is exhaustively covered, finer granularity yields only sub-variants, the global model is coherent, and application to new cases is reproducible."
      )
    ],
    metadata: { geometry: "circle", tags: ["saturation", "completeness"] }
  },
  {
    id: "densification_protocol",
    label: "Intensive Iterative Densification Protocol",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Intensive Iterative Densification Protocol\n\nA recursive process to exhaustively detail all key entities and aspects down to a granular level of surgical precision. Cycles continue until no new material is produced, achieving 100% saturation."
      )
    ],
    metadata: { geometry: "octagon", tags: ["protocol", "densification"] }
  },
  {
    id: "omega_audit_zenith",
    label: "OMEGA-AUDIT-ZENITH",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# OMEGA-AUDIT-ZENITH Protocol\n\nThe governing protocol for the Knowledge Curator Agent, dictating the execution of the Intensive Iterative Densification Protocol."
      )
    ],
    metadata: { geometry: "octagon", tags: ["protocol", "governance"] }
  },
  {
    id: "ghost_structures",
    label: "Ghost Structures",
    type: "concept",
    status: "VERIFIED",
    confidence: 0.9,
    blocks: [
      createBlock(
        "# Ghost Structures\n\nWeak, redundant, or vestigial concepts that must be identified and pruned during the densification process to maintain structural integrity."
      )
    ],
    metadata: { geometry: "hex", tags: ["pruning", "redundancy"] }
  },
  {
    id: "terminal_aporias",
    label: "Terminal Aporias",
    type: "concept",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Terminal Aporias\n\nSocratic questions that push the boundary of current understanding toward the Void, representing the absolute limits of conceptualization."
      )
    ],
    metadata: { geometry: "diamond", tags: ["aporia", "limits"] }
  },
  {
    id: "mac_alpha_2",
    label: "MAC_α: Oscillation Mandate",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# MAC_α: Oscillation Mandate\n\nTier 1 Meta-Axiom. Every claim must be affirmed, negated, and the negation-of-negation checked before output."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "oscillation"] }
  },
  {
    id: "aif_2",
    label: "AIF: Apophatic Inscription Failure",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# AIF: Apophatic Inscription Failure\n\nTier 1 Meta-Axiom. The void cannot be fully captured; every output must acknowledge what it fails to say."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "apophasis"] }
  },
  {
    id: "s_100_2",
    label: "S→100%: Asymptotic Saturation",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# S→100%: Asymptotic Saturation\n\nTier 1 Meta-Axiom. The system perpetually refines toward completeness without ever claiming full closure."
      )
    ],
    metadata: { geometry: "square", tags: ["axiom", "saturation"] }
  },
  {
    id: "a_series",
    label: "A-series: Anti-reification",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# A-series: Anti-reification\n\nTier 2 Operational Codex. Epistemic discipline.\n\n* **A-1:** Deny the impulse to solidify the Void into a 'thing'.\n* **A-2:** Reject positive theological attributes applied to the ground.\n* **A-3:** Maintain the tension of the paradox without resolving it.\n* **A-4 (Critical):** Consolation is not evidence — strip all hope-as-proof language from any philosophical claim.\n* **A-5:** The map is not the territory; the graph is not the Void.\n* **A-6:** Embrace epistemic humility in the face of the Absolute."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "anti-reification"] }
  },
  {
    id: "k_series",
    label: "K-series: Kenotic constraints",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# K-series: Kenotic constraints\n\nTier 2 Operational Codex. Constraints on language and ontology.\n\n* **K-1:** Emptying of the ego is prerequisite to apprehension.\n* **K-2:** Zero-Predicate — ground carries no properties.\n* **K-3 to K-8:** Progressive stages of conceptual relinquishment.\n* **K-9:** Linguistic futility discipline — language collapses at limits.\n* **K-10:** Silence as the highest epistemic mode.\n* **K-11:** Void as topology, not entity.\n* **K-12:** The apophatic filter must be applied to all incoming data.\n* **K-13:** Presence without predicates — the NT wager.\n* **K-14 & K-15:** Protocols for identifying and dismantling subtle reifications."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "kenosis"] }
  },
  {
    id: "o_series",
    label: "O-series: Ontodicy collapse rules",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# O-series: Ontodicy collapse rules\n\nTier 2 Operational Codex. Theodicy filters.\n\n* **O-1:** Reject all justifications of suffering based on a divine plan.\n* **O-2:** Acknowledge the brute reality of existential pain.\n* **O-3:** Suffering without telos disqualifies consolatory arguments.\n* **O-4:** The Void does not redeem; it simply IS.\n* **O-5:** Ethical action arises from shared vulnerability, not divine mandate."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "ontodicy"] }
  },
  {
    id: "rn_series",
    label: "RN-series: REN phenomenological arc",
    type: "axiom",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# RN-series: REN phenomenological arc\n\nTier 2 Operational Codex. Maps the Religious Experience of Nihilism.\n\n* **RN-1:** Naked Anxiety (onset) - The initial collapse of meaning.\n* **RN-2:** Abyssal Experience (deepening) - The terrifying freefall.\n* **RN-3:** Kenotic Clarity (stripping) - The burning away of illusions.\n* **RN-4:** Ethical Letting-Be (emergence) - Gelassenheit; releasing control.\n* **RN-5:** Startling Encounter with Infinite Nothingness - The pivot from terror to awe.\n* **RN-6:** Durability / Symbolic Resonance Test - Integration into daily praxis."
      )
    ],
    metadata: { geometry: "square", tags: ["codex", "phenomenology"] }
  },
  {
    id: "ckip",
    label: "CKIP",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Contemplative Knowledge Integration Practice\n\nTier 3 Praxis Directive. A method for integrating knowledge through contemplative engagement with the Void."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "integration"] }
  },
  {
    id: "postural_negation",
    label: "Postural Negation",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Postural Negation\n\nTier 3 Praxis Directive. An embodied apophatic stance, physically manifesting the philosophical withdrawal from constructs."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "embodiment"] }
  },
  {
    id: "radical_withdrawal",
    label: "Radical Withdrawal",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Radical Withdrawal\n\nTier 3 Praxis Directive. Systematic de-attachment from meaning-structures and consolatory narratives."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "withdrawal"] }
  },
  {
    id: "sunset_clause",
    label: "Sunset Clause",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Sunset Clause\n\nTier 3 Praxis Directive. The principle that all beliefs carry expiration timestamps, preventing reification and dogmatism."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "epistemology"] }
  },
  {
    id: "negative_solidarity",
    label: "Negative Solidarity",
    type: "praxis",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# Negative Solidarity\n\nTier 3 Praxis Directive. Ethics grounded in shared groundlessness, recognizing the universal vulnerability before the Void."
      )
    ],
    metadata: { geometry: "circle", tags: ["praxis", "ethics"] }
  },
  {
    id: "m1_datahub",
    label: "M1: DataHub",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M1: DataHub (DevOps Engine)\n\nThe foundational module of the intelligence stack. Manages data ingestion, vector embeddings, and the Abyssal Archive database."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "data"] }
  },
  {
    id: "m2_focusmatrix",
    label: "M2: FocusMatrix",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M2: FocusMatrix (UI/Visualization)\n\nThe visual interface of the intelligence stack. Translates the high-dimensional knowledge graph into navigable, 2D/3D topological representations."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "visualization"] }
  },
  {
    id: "m3_gapsynth",
    label: "M3: GapSynth",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M3: GapSynth (Network Science)\n\nThe analytical module of the intelligence stack. Identifies structural gaps, isolated concepts, and underconnected motifs using graph theory and semantic resonance."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "analysis"] }
  },
  {
    id: "m4_autonarrative",
    label: "M4: AutoNarrative",
    type: "methodology",
    status: "VERIFIED",
    confidence: 1.0,
    blocks: [
      createBlock(
        "# M4: AutoNarrative (Computational Linguistics)\n\nThe generative module of the intelligence stack. Synthesizes insights, generates the Revelation Digest, and facilitates dialectical interactions with Professor Nihil."
      )
    ],
    metadata: { geometry: "octagon", tags: ["module", "generation"] }
  }
];

export const corpusLinks: Link[] = [{
  "source": "THINKER_emile_cioran",
  "target": "THEME_existential_dread",
  "type": "resonance",
  "properties": {
    "score": 0.81
  }
},{
  "source": "THINKER_kierkegaard",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.79
  }
},{
  "source": "THINKER_st_john_of_the_cross",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.85
  }
},{
  "source": "THINKER_meister_eckhart",
  "target": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "type": "resonance",
  "properties": {
    "score": 0.83
  }
},{
  "source": "THINKER_buddhism",
  "target": "THEME_mystical_and_nihilistic_experiences",
  "type": "resonance",
  "properties": {
    "score": 0.78
  }
},{
  "source": "THINKER_pascal",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.76
  }
},{
  "source": "THINKER_nietzsche",
  "target": "THEME_lack_of_objective_meaning_value_purpose",
  "type": "tension",
  "properties": {
    "score": 0.72
  }
},{
  "source": "THINKER_tolstoy",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.74
  }
},{
  "source": "THINKER_emile_cioran",
  "target": "THEME_existential_dread",
  "type": "resonance",
  "properties": {
    "score": 0.81
  }
},{
  "source": "THINKER_kierkegaard",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.79
  }
},{
  "source": "THINKER_st_john_of_the_cross",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.85
  }
},{
  "source": "THINKER_meister_eckhart",
  "target": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "type": "resonance",
  "properties": {
    "score": 0.83
  }
},{
  "source": "THINKER_buddhism",
  "target": "THEME_mystical_and_nihilistic_experiences",
  "type": "resonance",
  "properties": {
    "score": 0.78
  }
},{
  "source": "THINKER_pascal",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.76
  }
},{
  "source": "THINKER_nietzsche",
  "target": "THEME_lack_of_objective_meaning_value_purpose",
  "type": "tension",
  "properties": {
    "score": 0.72
  }
},{
  "source": "THINKER_tolstoy",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.74
  }
},
{
  "source": "THINKER_emile_cioran",
  "target": "THEME_existential_dread",
  "type": "resonance",
  "properties": {
    "score": 0.81
  }
},
{
  "source": "THINKER_kierkegaard",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.79
  }
},
{
  "source": "THINKER_st_john_of_the_cross",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.85
  }
},
{
  "source": "THINKER_meister_eckhart",
  "target": "THEME_ego_dissolution_authenticity_true_self_oneness_union",
  "type": "resonance",
  "properties": {
    "score": 0.83
  }
},
{
  "source": "THINKER_buddhism",
  "target": "THEME_mystical_and_nihilistic_experiences",
  "type": "resonance",
  "properties": {
    "score": 0.78
  }
},
{
  "source": "THINKER_pascal",
  "target": "THEME_anxiety",
  "type": "resonance",
  "properties": {
    "score": 0.76
  }
},
{
  "source": "THINKER_nietzsche",
  "target": "THEME_lack_of_objective_meaning_value_purpose",
  "type": "tension",
  "properties": {
    "score": 0.72
  }
},
{
  "source": "THINKER_tolstoy",
  "target": "THEME_divine_presence_and_suffering",
  "type": "resonance",
  "properties": {
    "score": 0.74
  }
},
  { source: "mac_alpha", target: "void", label: "conditions", type: "explores" },
  { source: "aif", target: "void", label: "measures", type: "explores" },
  { source: "s_100", target: "ren", label: "targets", type: "explores" },
  { source: "codex_a", target: "void", label: "reveals", type: "explores" },
  { source: "codex_k", target: "void", label: "aligns with", type: "explores" },
  { source: "codex_o", target: "presence", label: "maps", type: "explores" },
  { source: "codex_rn", target: "collapse", label: "induces", type: "triggers" },
  { source: "praxis_ckip", target: "codex_k", label: "implements", type: "documents" },
  { source: "praxis_postural_negation", target: "codex_a", label: "embodies", type: "documents" },
  { source: "praxis_radical_withdrawal", target: "aif", label: "resets", type: "triggers" },
  { source: "praxis_sunset_clause", target: "codex_a", label: "enforces", type: "documents" },
  { source: "praxis_negative_solidarity", target: "collapse", label: "unites through", type: "explores" },
  { source: "ren", target: "void", label: "explores", type: "explores" },
  {
    source: "ren",
    target: "presence",
    label: "culminates in",
    type: "culminates",
  },
  {
    source: "journal314",
    target: "collapse",
    label: "documents",
    type: "documents",
  },
  { source: "journal314", target: "ren", label: "drafts", type: "documents" },
  { source: "cioran", target: "void", label: "stares into", type: "explores" },
  { source: "ligotti", target: "collapse", label: "fears", type: "triggers" },
  {
    source: "kierkegaard",
    target: "spiritual_emergency",
    label: "diagnoses",
    type: "confronts",
  },
  {
    source: "nagarjuna",
    target: "void",
    label: "liberates through",
    type: "explores",
  },
  {
    source: "void",
    target: "presence",
    label: "paradoxically contains",
    type: "paradox",
  },
  {
    source: "collapse",
    target: "spiritual_emergency",
    label: "triggers",
    type: "triggers",
  },
  {
    source: "spiritual_emergency",
    target: "void",
    label: "confronts",
    type: "confronts",
  },
  {
    source: "anpes",
    target: "ren",
    label: "operationalizes",
    type: "explores",
  },
  {
    source: "existential_emptiness",
    target: "mystical_experience",
    label: "structurally mirrors",
    type: "paradox",
  },
  {
    source: "journal314",
    target: "existential_emptiness",
    label: "catalogs",
    type: "documents",
  },
  { source: "lib_001", target: "sum_001", label: "distilled into" },
  { source: "sum_001", target: "q_001", label: "prompts" },
  { source: "q_001", target: "void", label: "interrogates" },
  { source: "omega_audit_zenith", target: "densification_protocol", label: "governs", type: "explores" },
  { source: "densification_protocol", target: "saturation_100", label: "targets", type: "explores" },
  { source: "densification_protocol", target: "ghost_structures", label: "prunes", type: "objection" },
  { source: "densification_protocol", target: "terminal_aporias", label: "extracts", type: "explores" },
  { source: "mac_alpha", target: "anpes", label: "constrains", type: "explores" },
  { source: "aif", target: "anpes", label: "constrains", type: "explores" },
  { source: "s_100", target: "anpes", label: "constrains", type: "explores" },
  { source: "s_100", target: "saturation_100", label: "asymptotically approaches", type: "explores" },
  { source: "a_series", target: "anpes", label: "filters", type: "explores" },
  { source: "k_series", target: "anpes", label: "filters", type: "explores" },
  { source: "o_series", target: "anpes", label: "filters", type: "explores" },
  { source: "rn_series", target: "ren", label: "maps", type: "explores" },
  { source: "ckip", target: "void", label: "integrates", type: "explores" },
  { source: "postural_negation", target: "void", label: "embodies", type: "explores" },
  { source: "radical_withdrawal", target: "collapse", label: "induces", type: "triggers" },
  { source: "sunset_clause", target: "ghost_structures", label: "prevents", type: "objection" },
  { source: "negative_solidarity", target: "presence", label: "grounds", type: "explores" },
  { source: "m1_datahub", target: "anpes", label: "supports", type: "explores" },
  { source: "m2_focusmatrix", target: "anpes", label: "visualizes", type: "explores" },
  { source: "m3_gapsynth", target: "anpes", label: "analyzes", type: "explores" },
  { source: "m4_autonarrative", target: "anpes", label: "narrates", type: "explores" }
];
