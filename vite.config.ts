import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBasePath =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS && repositoryName && !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/')

const config = defineConfig({
  base: pagesBasePath,
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})

export default config
