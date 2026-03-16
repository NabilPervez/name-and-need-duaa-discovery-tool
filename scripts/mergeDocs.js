const fs = require('fs');
const path = require('path');

const namesFile = path.join(__dirname, '../src/data/names.json');
const docsDir = path.join(__dirname, '../data/Allahs Names Explained In json');

let names = JSON.parse(fs.readFileSync(namesFile, 'utf8'));
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));

const docs = [];
for (const f of files) {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(docsDir, f), 'utf8'));
        docs.push(data);
    } catch(e) {}
}

names.forEach(n => {
    let cleanOriginal = n.name.toLowerCase().replace(/^ya\s+/, '').replace(/^(al|ar|as|ad|an|ash|az)-/, '').trim();
    let match = docs.find(d => {
        let dClean = d.name.toLowerCase().replace(/^(al|ar|as|ad|an|ash|az)-/, '').trim();
        return dClean === cleanOriginal || dClean.includes(cleanOriginal) || cleanOriginal.includes(dClean);
    });
    
    if (match) {
        n.explanationData = match.explanation;
        n.sourceUrl = match.source;
    }
});

fs.writeFileSync(namesFile, JSON.stringify(names, null, 2));
