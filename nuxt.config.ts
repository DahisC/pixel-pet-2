// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devServer: { port: 3005 },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  experimental: {
    serverAppConfig: false,
  },
  modules: ["@nuxt/content", "@pinia/nuxt"],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: "github-dark",
        },
      },
    },
  },
});
