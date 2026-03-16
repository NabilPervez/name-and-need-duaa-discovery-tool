const fs = require('fs');
const names = require('../src/data/names.json');

const intentMap = {
  "Forgiveness": ["forgive", "pardon", "sin", "repent", "wrong", "fault", "erase", "conceal"],
  "Love": ["love", "affection", "heart", "gentle", "kindness", "beloved", "intimate"],
  "Mercy": ["mercy", "merciful", "compassion", "grace", "pity"],
  "Healing": ["heal", "cure", "sickness", "health", "disease", "pain", "illness"],
  "Lost": ["lost", "guide", "path", "wander", "blind", "direction", "confuse", "astray"],
  "Protection": ["protect", "guard", "safe", "shield", "secure", "shelter", "refuge"],
  "Strength": ["strength", "power", "weak", "support", "capable", "mighty", "able", "overcome"],
  "Anxiety": ["anxious", "worry", "stress", "peace", "calm", "tranquil", "fear", "panic"],
  "Distress": ["distress", "hardship", "difficulty", "ease", "relieve", "burden", "grief", "sadness"],
  "Provision": ["provide", "sustenance", "wealth", "poverty", "feed", "enrich", "provision", "needs", "lacking"],
  "Justice": ["justice", "oppress", "fair", "judge", "wronged", "rights"],
  "Broken Heart": ["broken", "mend", "restore", "shattered", "comfort", "grief", "loss"],
  "Knowledge": ["know", "wisdom", "understand", "clarity", "ignorant", "truth", "light", "unseen"],
  "Success": ["success", "victory", "triumph", "goal", "achieve", "open"],
  "Gratitude": ["grateful", "thank", "praise", "blessing", "gift"],
  "Patience": ["patience", "patient", "endure", "wait"]
};

names.forEach(n => {
  let text = (n.meaning + " " + n.dua + " " + (n.meaningBlocks || []).join(" ")).toLowerCase();
  let found = [];
  for (let [intent, words] of Object.entries(intentMap)) {
    if (words.some(w => text.includes(w))) {
      found.push(intent);
    }
  }
  
  if (found.length === 0) {
    found.push("Hope");
  }
  
  n.intents = found.slice(0, 4); // limit to max 4 intents
});

fs.writeFileSync(__dirname + '/../src/data/names.json', JSON.stringify(names, null, 2));
