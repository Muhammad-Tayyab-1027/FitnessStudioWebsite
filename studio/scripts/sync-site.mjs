// Copies the FitLife static website (the repository root, one level up) into
// public/ so the Next server hosts it next to the studio: "/" is the site's
// index.html and "/studio" is the AI Studio. The copies are build output and
// stay untracked; edit the originals at the repository root.
import { cpSync, existsSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SITE = resolve(ROOT, "..")
const PUBLIC = join(ROOT, "public")
const DIRS = ["css", "js", "images", "lightbox", "video"]

export function syncSite() {
  if (!existsSync(join(SITE, "index.html"))) {
    console.warn("[site] no index.html next to studio/, skipping site sync")
    return []
  }
  const pages = readdirSync(SITE).filter((file) => file.endsWith(".html"))
  for (const page of pages) cpSync(join(SITE, page), join(PUBLIC, page))
  for (const dir of DIRS)
    if (existsSync(join(SITE, dir)))
      cpSync(join(SITE, dir), join(PUBLIC, dir), { recursive: true })
  return pages
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`[site] ${syncSite().length} pages copied into public/`)
}
