const fs = require('fs');
const path = require('path');

// Read translation files
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8'));
const fi = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/fi.json'), 'utf8'));
const sv = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/sv.json'), 'utf8'));

// Function to get all keys from an object recursively
function getAllKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return [...keys, ...getAllKeys(obj[key], newPrefix)];
    }
    return [...keys, newPrefix];
  }, []);
}

// Get all keys from both files
const enKeys = getAllKeys(en);
const fiKeys = getAllKeys(fi);
const svKeys = getAllKeys(sv);

// Find missing keys in Finnish translations
const missingInFi = enKeys.filter(key => {
  const parts = key.split('.');
  let current = fi;
  for (const part of parts) {
    if (current[part] === undefined) return true;
    current = current[part];
  }
  return false;
});

// Find missing keys in Swedish translations
const missingInSv = enKeys.filter(key => {
  const parts = key.split('.');
  let current = sv;
  for (const part of parts) {
    if (current[part] === undefined) return true;
    current = current[part];
  }
  return false;
});

// Find extra keys in Finnish translations
const extraInFi = fiKeys.filter(key => {
  const parts = key.split('.');
  let current = en;
  for (const part of parts) {
    if (current[part] === undefined) return true;
    current = current[part];
  }
  return false;
});

// Find extra keys in Swedish translations
const extraInSv = svKeys.filter(key => {
  const parts = key.split('.');
  let current = en;
  for (const part of parts) {
    if (current[part] === undefined) return true;
    current = current[part];
  }
  return false;
});

// Print results
console.log('Missing in Finnish:');
missingInFi.forEach(key => console.log(`- ${key}`));

console.log('\nExtra in Finnish:');
extraInFi.forEach(key => console.log(`- ${key}`));

console.log('\nMissing in Swedish:');
missingInSv.forEach(key => console.log(`- ${key}`));

console.log('\nExtra in Swedish:');
extraInSv.forEach(key => console.log(`- ${key}`));

console.log('\nSummary:');
console.log(`Total keys in English: ${enKeys.length}`);
console.log(`Total keys in Finnish: ${fiKeys.length}`);
console.log(`Total keys in Swedish: ${svKeys.length}`);
console.log(`Missing in Finnish: ${missingInFi.length}`);
console.log(`Extra in Finnish: ${extraInFi.length}`);
console.log(`Missing in Swedish: ${missingInSv.length}`);
console.log(`Extra in Swedish: ${extraInSv.length}`); 