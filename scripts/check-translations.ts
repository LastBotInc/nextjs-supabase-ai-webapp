import fs from 'fs'
import path from 'path'

// Flatten nested object with dot notation
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = String(obj[k])
    }
    return acc
  }, {})
}

function checkTranslations() {
  const enPath = path.join(process.cwd(), 'messages', 'en.json')
  const fiPath = path.join(process.cwd(), 'messages', 'fi.json')
  const svPath = path.join(process.cwd(), 'messages', 'sv.json')

  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const fiContent = JSON.parse(fs.readFileSync(fiPath, 'utf8'))
  const svContent = JSON.parse(fs.readFileSync(svPath, 'utf8'))

  const enFlat = flattenObject(enContent)
  const fiFlat = flattenObject(fiContent)
  const svFlat = flattenObject(svContent)

  const enKeys = Object.keys(enFlat)
  const fiKeys = Object.keys(fiFlat)
  const svKeys = Object.keys(svFlat)

  const missingInFi = enKeys.filter(key => !fiKeys.includes(key))
  const missingInEn = fiKeys.filter(key => !enKeys.includes(key))
  const missingInSv = enKeys.filter(key => !svKeys.includes(key))

  console.log('Missing in Finnish:')
  missingInFi.forEach(key => console.log(`- ${key}`))

  console.log('\nMissing in English:')
  missingInEn.forEach(key => console.log(`- ${key}`))

  console.log('\nMissing in Swedish:')
  missingInSv.forEach(key => console.log(`- ${key}`))

  console.log('\nSummary:')
  console.log(`Total keys in English: ${enKeys.length}`)
  console.log(`Total keys in Finnish: ${fiKeys.length}`)
  console.log(`Total keys in Swedish: ${svKeys.length}`)
  console.log(`Missing in Finnish: ${missingInFi.length}`)
  console.log(`Missing in English: ${missingInEn.length}`)
  console.log(`Missing in Swedish: ${missingInSv.length}`)
}

checkTranslations() 