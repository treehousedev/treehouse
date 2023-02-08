export default {
  site: "Treehouse",
  backend: {
    name: Deno.env.get("BACKEND") || "browser",
    url: Deno.env.get("BACKEND_URL")
  }
}