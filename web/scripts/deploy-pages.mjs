// 웹 빌드(dist)를 레포 루트로 옮긴다. GitHub Pages가 main 브랜치 루트를 서빙한다.
// 루트에는 web/(이 소스), docs/, mockups/ 같은 다른 파일도 있으므로 비우지 않고,
// 이전 빌드가 만든 파일(assets/, fonts/, index.html 등)만 교체한다.
import { createHash } from 'node:crypto'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(import.meta.dirname, '../dist')
const pagesDir = resolve(process.argv[2] ?? resolve(import.meta.dirname, '../..'))

if (!existsSync(resolve(pagesDir, '.git'))) {
  throw new Error(`Pages repo not found at ${pagesDir}`)
}

// 서비스워커는 캐시 우선이라 sw 파일 바이트가 바뀌어야 새 index.html 을 받는다.
// 빌드마다 바뀌는 index.html(해시된 asset 이름 포함)로 캐시 이름을 만든다.
const swPath = resolve(distDir, 'service-worker.js')
const buildHash = createHash('sha256').update(readFileSync(resolve(distDir, 'index.html'))).digest('hex').slice(0, 10)
const sw = readFileSync(swPath, 'utf8')
const swCacheName = /const CACHE_NAME = '[^']+';/
if (!swCacheName.test(sw)) throw new Error('CACHE_NAME not found in service-worker.js')
writeFileSync(swPath, sw.replace(swCacheName, `const CACHE_NAME = 'gym-pwa-${buildHash}';`))

// 이전 빌드 산출물과 바닐라 PWA 시절 파일을 지운다.
for (const stale of ['assets', 'fonts', 'routine.js']) {
  rmSync(resolve(pagesDir, stale), { recursive: true, force: true })
}

for (const entry of readdirSync(distDir)) {
  cpSync(resolve(distDir, entry), resolve(pagesDir, entry), { recursive: true })
}

console.log(`Deployed web build to ${pagesDir} (cache gym-pwa-${buildHash})`)
