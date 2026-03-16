const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const srcData = path.join(__dirname, '../src/data');

if (!fs.existsSync(srcData)) {
    fs.mkdirSync(srcData, { recursive: true });
}

// Read All_Names.json for Arabic text
let arabicMap = {};
try {
    const rawAllNames = fs.readFileSync(path.join(dataDir, "Allah's Names Explained", "json", "All_Names.json"), 'utf8');
    const allNames = JSON.parse(rawAllNames);
    allNames.forEach(n => {
        let e = n.name.replace(/^al-/i, '').replace(/^ar-/i, '').replace(/^as-/i, '').replace(/^ad-/i, '').replace(/^an-/i, '').replace(/^ash-/i, '').replace(/^az-/i, '').toLowerCase();
        arabicMap[e] = n.arabic;
    });
} catch (e) {
    console.warn("Could not load All_Names.json", e.message);
}

const categoriesTxt = fs.readFileSync(path.join(dataDir, 'Categorized Names of Allah.txt'), 'utf8');
const duasTxt = fs.readFileSync(path.join(dataDir, 'Duas With Allah’s Names.txt'), 'utf8');

const categories = [];
let currentCategory = null;
categoriesTxt.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    const catMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (catMatch && !line.includes('Ya ')) {
        currentCategory = catMatch[2];
        if (!categories.includes(currentCategory)) {
            categories.push(currentCategory);
        }
    }
});

// Name -> Category map
const nameCategoryMap = {};
currentCategory = null;
categoriesTxt.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    const catMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (catMatch && !line.includes('Ya ')) {
        currentCategory = catMatch[2];
    } else if (line.startsWith('*')) {
        const nameMatch = line.match(/\*\s+\d+\.\s+(.+)/);
        if (nameMatch) {
            let n = nameMatch[1].trim();
            n = n.replace(/\s*\(.*\)$/, '').trim();
            if (!nameCategoryMap[n]) {
                nameCategoryMap[n] = [];
            }
            if (!nameCategoryMap[n].includes(currentCategory)) {
                nameCategoryMap[n].push(currentCategory);
            }
        }
    }
});

const duaLines = duasTxt.split('\n');

// Names Explained
const namesExplained = {};
let currentExplainName = null;
let currentLines = [];

for (let i = 0; i < duaLines.length; i++) {
    const line = duaLines[i].trim();
    if (line === "Duaas For Each Name") {
        if (currentExplainName && currentLines.length > 0) {
            namesExplained[currentExplainName] = currentLines.join('\n');
        }
    }

    const nameMatch = line.match(/^\d+\.\s+(.+)/);
    if (nameMatch) {
        if (currentExplainName && currentLines.length > 0) {
            namesExplained[currentExplainName] = currentLines.join('\n');
        }
        currentExplainName = nameMatch[1].trim().replace(/\s*\(.*\)$/, '').trim();
        currentLines = [];
    } else if (line.startsWith('*')) {
        currentLines.push(line);
    }
}

// Duas
const namesDuas = {};
let parsingDuas = false;
let currentDuaName = null;
currentLines = [];

for (let i = 0; i < duaLines.length; i++) {
    const line = duaLines[i].trim();
    if (line === "Duaas For Each Name") {
        parsingDuas = true;
        continue;
    }
    if (line === "Transcript") {
        if (currentDuaName && currentLines.length > 0) {
            namesDuas[currentDuaName] = currentLines.join(' ');
        }
        break;
    }

    if (parsingDuas && line) {
        const nameMatch = line.match(/^\d+\.\s+(.+)/);
        if (nameMatch) {
            if (currentDuaName && currentLines.length > 0) {
                namesDuas[currentDuaName] = currentLines.join(' ');
            }
            currentDuaName = nameMatch[1].trim().replace(/\s*\(.*\)$/, '').trim();
            currentLines = [];
        } else if (!line.startsWith('Duaas For') && !line.startsWith('Names Explained') && !line.match(/^\d+\.\s+Ya/)) {
            currentLines.push(line);
        }
    }
}

// Combine
const finalNames = [];
let idCounter = 1;

// Get ALL unique names that have a dua
const allNamesWithDuas = Object.keys(namesDuas);

allNamesWithDuas.forEach(name => {
    const explain = namesExplained[name] || "";
    const dua = namesDuas[name] || "";
    let cats = nameCategoryMap[name] || [];
    
    if (cats.length === 0) {
        const baseName = name.replace(/^Ya\s+/i, '').replace(/^Al-/i, '').split('/')[0].trim();
        for (const [k, v] of Object.entries(nameCategoryMap)) {
            if (k.includes(baseName)) {
                cats = v;
                break;
            }
        }
    }

    const cleanedWord = name.replace(/^Ya\s+/i, '').replace(/^(Al|Ar|As|Ad|An|Ash|Az)-/i, '').split('/')[0].trim().toLowerCase();
    
    let ar = name;
    for (const [enKey, arVal] of Object.entries(arabicMap)) {
        if (enKey.includes(cleanedWord) || cleanedWord.includes(enKey)) {
            ar = arVal;
            break;
        }
    }

    finalNames.push({
        id: idCounter++,
        name: name,
        arabic: ar,
        categories: cats,
        meaningBlocks: explain.split('\n').filter(l => l.trim()).map(l => l.replace(/^\*\s*/, '')),
        dua: dua
    });
});

const allOriginalNamesMatch = duasTxt.match(/\d+\.\s+(.*?)\s+\((.*?)\)/g);
const nameToMeaning = {};
if (allOriginalNamesMatch) {
    allOriginalNamesMatch.forEach(m => {
        const res = m.match(/\d+\.\s+(.*?)\s+\((.*?)\)/);
        if (res) {
            nameToMeaning[res[1].trim()] = res[2].trim();
        }
    })
}

finalNames.forEach(n => {
    n.meaning = nameToMeaning[n.name] || n.name;
});

fs.writeFileSync(path.join(srcData, 'names.json'), JSON.stringify(finalNames, null, 2));
console.log('Successfully generated names.json with ' + finalNames.length + ' entries.');
