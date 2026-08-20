/**
 * Cloudflare Worker Proxy for GitHub Storage Repo
 * 
 * ENVIRONMENT VARIABLES NEEDED (Set these in Cloudflare Dashboard):
 * - GITHUB_TOKEN: Your GitHub Personal Access Token (with repo scope)
 * - GITHUB_REPO: "Yonatan996/betelhem-storage"
 * - ADMIN_PASSWORD: "CreateYourOwnSecretPasswordHere"
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname; // e.g., /data/products.json

    // 1. Handle CORS so your website can talk to this proxy
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    // 2. GET requests (Public Website fetching data)
    if (request.method === "GET") {
      // Fetch directly from the private raw GitHub URL using the hidden token
      const ghUrl = `https://raw.githubusercontent.com/${env.GITHUB_REPO}/main${path}?t=${Date.now()}`;
      const ghRes = await fetch(ghUrl, {
        headers: {
          "Authorization": `token ${env.GITHUB_TOKEN}`,
          "User-Agent": "Cloudflare-Worker"
        }
      });

      if (!ghRes.ok) {
        return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: corsHeaders });
      }
      
      const rawText = await ghRes.text();
      return new Response(rawText, { headers: corsHeaders });
    }

    // 3. PUT requests (Admin Dashboard saving data)
    if (request.method === "PUT") {
      // Check Admin Password to prevent hackers from editing your site
      const authHeader = request.headers.get("Authorization");
      if (authHeader !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return new Response(JSON.stringify({ error: "Unauthorized. Incorrect Admin Password." }), { 
          status: 401, 
          headers: corsHeaders 
        });
      }

      const body = await request.json(); // Expected: { message: "...", content: "base64..." }
      
      // To update a file in GitHub API, we MUST provide its current 'sha' (version ID)
      const apiUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/contents${path}`;
      const getRes = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Cloudflare-Worker",
          "Authorization": `token ${env.GITHUB_TOKEN}`
        }
      });
      
      let sha = "";
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      // Push the new file content to GitHub
      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "User-Agent": "Cloudflare-Worker",
          "Authorization": `token ${env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: body.message || `Admin update to ${path}`,
          content: body.content, // File content (must be base64 encoded by the frontend)
          sha: sha || undefined
        })
      });

      if (putRes.ok) {
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } else {
        const err = await putRes.text();
        return new Response(err, { status: 400, headers: corsHeaders });
      }
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
};
