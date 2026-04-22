import { createReadStream, mkdirSync, createWriteStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const src =
  process.argv[2] ||
  'C:\\Users\\윤병철\\Downloads\\2023년 제주농업경영정보조사_REFINED_2023년_밭작물_데이터.csv'
const maxLines = Number(process.argv[3] || 2501)
const outPath = resolve(root, 'public', 'data', 'jeju-field-crops-sample.csv')

mkdirSync(dirname(outPath), { recursive: true })

const rl = readline.createInterface({
  input: createReadStream(src, { encoding: 'utf8' }),
  crlfDelay: Infinity,
})

let n = 0
const out = createWriteStream(outPath, { encoding: 'utf8' })

for await (const line of rl) {
  out.write(line + '\n')
  n += 1
  if (n >= maxLines) break
}

out.end()
await new Promise((res, rej) => out.on('finish', res).on('error', rej))
console.log('Wrote', n, 'lines to', outPath)
