import fs from 'fs';

const updatedDataStr = `
{
  "nodes": [
    {
      "id": "thinker:Swami Vivekananda",
      "label": "Swami Vivekananda",
      "type": "thinker"
    },
    {
      "id": "thinker:Edgar Saltus",
      "label": "Edgar Saltus",
      "type": "thinker"
    },
    {
      "id": "thinker:Kierkegaard",
      "label": "Kierkegaard",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas Merton",
      "label": "Thomas Merton",
      "type": "thinker"
    },
    {
      "id": "thinker:Emile Cioran",
      "label": "Emile Cioran",
      "type": "thinker"
    },
    {
      "id": "thinker:Evelyn Underhill",
      "label": "Evelyn Underhill",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas Keating",
      "label": "Thomas Keating",
      "type": "thinker"
    },
    {
      "id": "thinker:Miguel de Molinos",
      "label": "Miguel de Molinos",
      "type": "thinker"
    },
    {
      "id": "thinker:Mitchell Heisman",
      "label": "Mitchell Heisman",
      "type": "thinker"
    },
    {
      "id": "thinker:A. W. Tozer",
      "label": "A. W. Tozer",
      "type": "thinker"
    },
    {
      "id": "thinker:Augustine",
      "label": "Augustine",
      "type": "thinker"
    },
    {
      "id": "thinker:Paul Tillich",
      "label": "Paul Tillich",
      "type": "thinker"
    },
    {
      "id": "thinker:Nietzsche",
      "label": "Nietzsche",
      "type": "thinker"
    },
    {
      "id": "thinker:Martin Heidegger",
      "label": "Martin Heidegger",
      "type": "thinker"
    },
    {
      "id": "thinker:Lev Shestov",
      "label": "Lev Shestov",
      "type": "thinker"
    },
    {
      "id": "thinker:Ecclesiastes",
      "label": "Ecclesiastes",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas à Kempis",
      "label": "Thomas à Kempis",
      "type": "thinker"
    },
    {
      "id": "thinker:William James",
      "label": "William James",
      "type": "thinker"
    },
    {
      "id": "thinker:Ernest Becker",
      "label": "Ernest Becker",
      "type": "thinker"
    },
    {
      "id": "thinker:Jesus Christ",
      "label": "Jesus Christ",
      "type": "thinker"
    },
    {
      "id": "thinker:Plato /Socrates",
      "label": "Plato /Socrates",
      "type": "thinker"
    },
    {
      "id": "thinker:Pascal",
      "label": "Pascal",
      "type": "thinker"
    },
    {
      "id": "thinker:Fr. Seraphim Rose",
      "label": "Fr. Seraphim Rose",
      "type": "thinker"
    },
    {
      "id": "thinker:Miguel de Unamuno",
      "label": "Miguel de Unamuno",
      "type": "thinker"
    },
    {
      "id": "thinker:Meister Eckhart",
      "label": "Meister Eckhart",
      "type": "thinker"
    },
    {
      "id": "thinker:John of the Cross",
      "label": "John of the Cross",
      "type": "thinker"
    },
    {
      "id": "thinker:Aldous Huxley",
      "label": "Aldous Huxley",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas Ligotti",
      "label": "Thomas Ligotti",
      "type": "thinker"
    },
    {
      "id": "thinker:Teresa of Ávila",
      "label": "Teresa of Ávila",
      "type": "thinker"
    },
    {
      "id": "thinker:Herman Tønnessen",
      "label": "Herman Tønnessen",
      "type": "thinker"
    },
    {
      "id": "thinker:Buddhism",
      "label": "Buddhism",
      "type": "thinker"
    },
    {
      "id": "thinker:Bertrand Russell",
      "label": "Bertrand Russell",
      "type": "thinker"
    },
    {
      "id": "thinker:Taoism",
      "label": "Taoism",
      "type": "thinker"
    },
    {
      "id": "thinker:Martin Luther",
      "label": "Martin Luther",
      "type": "thinker"
    },
    {
      "id": "thinker:Tolstoy",
      "label": "Tolstoy",
      "type": "thinker"
    },
    {
      "id": "thinker:GK Chesterton",
      "label": "GK Chesterton",
      "type": "thinker"
    },
    {
      "id": "thinker:Huston Smith",
      "label": "Huston Smith",
      "type": "thinker"
    },
    {
      "id": "thinker:Will Durant",
      "label": "Will Durant",
      "type": "thinker"
    },
    {
      "id": "thinker:Therese of Lisieux",
      "label": "Therese of Lisieux",
      "type": "thinker"
    },
    {
      "id": "thinker:John Shelby Spong",
      "label": "John Shelby Spong",
      "type": "thinker"
    },
    {
      "id": "thinker:Hinduism",
      "label": "Hinduism",
      "type": "thinker"
    },
    {
      "id": "thinker:Peter Wessel Zapffe",
      "label": "Peter Wessel Zapffe",
      "type": "thinker"
    },
    {
      "id": "thinker:C. S. Lewis",
      "label": "C. S. Lewis",
      "type": "thinker"
    },
    {
      "id": "thinker:Schopenhauer",
      "label": "Schopenhauer",
      "type": "thinker"
    },
    {
      "id": "thinker:Albert Camus",
      "label": "Albert Camus",
      "type": "thinker"
    },
    {
      "id": "thinker:Montaigne",
      "label": "Montaigne",
      "type": "thinker"
    },
    {
      "id": "thinker:Timothy Leary",
      "label": "Timothy Leary",
      "type": "thinker"
    },
    {
      "id": "thinker:John Bunyan",
      "label": "John Bunyan",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas Aquinas",
      "label": "Thomas Aquinas",
      "type": "thinker"
    },
    {
      "id": "thinker:Angela of Foligno",
      "label": "Angela of Foligno",
      "type": "thinker"
    },
    {
      "id": "thinker:Pseudo-Dionysius",
      "label": "Pseudo-Dionysius",
      "type": "thinker"
    },
    {
      "id": "thinker:William Lane Craig-",
      "label": "William Lane Craig-",
      "type": "thinker"
    },
    {
      "id": "thinker:Jesus",
      "label": "Jesus",
      "type": "thinker"
    },
    {
      "id": "thinker:St. John of the Cross",
      "label": "St. John of the Cross",
      "type": "thinker"
    },
    {
      "id": "thinker:Theresa of Avila",
      "label": "Theresa of Avila",
      "type": "thinker"
    },
    {
      "id": "thinker:Peter Zappfe",
      "label": "Peter Zappfe",
      "type": "thinker"
    },
    {
      "id": "thinker:Thomas Kempis",
      "label": "Thomas Kempis",
      "type": "thinker"
    },
    {
      "id": "term:god",
      "label": "god",
      "type": "term"
    },
    {
      "id": "term:self",
      "label": "self",
      "type": "term"
    },
    {
      "id": "term:death",
      "label": "death",
      "type": "term"
    },
    {
      "id": "term:truth",
      "label": "truth",
      "type": "term"
    },
    {
      "id": "term:nothingness",
      "label": "nothingness",
      "type": "term"
    },
    {
      "id": "term:despair",
      "label": "despair",
      "type": "term"
    },
    {
      "id": "term:divine",
      "label": "divine",
      "type": "term"
    },
    {
      "id": "term:suffering",
      "label": "suffering",
      "type": "term"
    },
    {
      "id": "term:ultimate",
      "label": "ultimate",
      "type": "term"
    },
    {
      "id": "term:meaning",
      "label": "meaning",
      "type": "term"
    },
    {
      "id": "term:value",
      "label": "value",
      "type": "term"
    },
    {
      "id": "term:ground",
      "label": "ground",
      "type": "term"
    },
    {
      "id": "term:salvation",
      "label": "salvation",
      "type": "term"
    },
    {
      "id": "term:union",
      "label": "union",
      "type": "term"
    },
    {
      "id": "term:beauty",
      "label": "beauty",
      "type": "term"
    },
    {
      "id": "term:silence",
      "label": "silence",
      "type": "term"
    },
    {
      "id": "term:dread",
      "label": "dread",
      "type": "term"
    },
    {
      "id": "term:void",
      "label": "void",
      "type": "term"
    },
    {
      "id": "term:annihilation",
      "label": "annihilation",
      "type": "term"
    },
    {
      "id": "term:transcendence",
      "label": "transcendence",
      "type": "term"
    },
    {
      "id": "term:transcendent",
      "label": "transcendent",
      "type": "term"
    },
    {
      "id": "level:0",
      "label": "Level 0",
      "type": "elevation_level"
    },
    {
      "id": "level:1",
      "label": "Level 1",
      "type": "elevation_level"
    },
    {
      "id": "level:2",
      "label": "Level 2",
      "type": "elevation_level"
    },
    {
      "id": "level:3",
      "label": "Level 3",
      "type": "elevation_level"
    },
    {
      "id": "level:4",
      "label": "Level 4",
      "type": "elevation_level"
    }
  ]
}
\`;

fs.writeFileSync('new_data.json', updatedDataStr);
