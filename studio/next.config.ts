import type { NextConfig } from "next"

import { syncModels, watchModels } from "./scripts/sync-models.mjs"
import { syncSite } from "./scripts/sync-site.mjs"

// Keep the model barrel + registry items in sync with generation/catalog/models/*.
syncModels()
if (process.env.NODE_ENV === "development") watchModels()
// Host the FitLife static site from public/ alongside the studio.
syncSite()

const nextConfig: NextConfig = {
  agentRules: false,
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }]
  },
}

export default nextConfig
