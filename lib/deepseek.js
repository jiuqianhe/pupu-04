const windows = new Map();

function getBaseURL() {
  return (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").trim().replace(/\/+$/, "");
}

export function getDeepSeek() {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");
  return {
    chat: {
      completions: {
        async create(body) {
          const response = await fetch(`${getBaseURL()}/chat/completions`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error = new Error(data.error?.message || `DeepSeek request failed (${response.status})`);
            error.status = response.status;
            throw error;
          }
          return data;
        }
      }
    }
  };
}

export function getModel() {
  if (!process.env.DEEPSEEK_MODEL) throw new Error("DEEPSEEK_MODEL is not configured");
  return process.env.DEEPSEEK_MODEL;
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function readJSON(request) {
  if (request.method !== "POST") throw Object.assign(new Error("Method not allowed"), { status: 405 });
  if (Number(request.headers.get("content-length") || 0) > 4_000_000) throw Object.assign(new Error("Request is too large"), { status: 413 });
  return request.json();
}

export function allowRequest(request, bucket, limit = 18) {
  const rawIP = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "classroom-demo";
  const key = `${bucket}:${rawIP}`;
  const now = Date.now();
  const current = windows.get(key);
  if (!current || now - current.startedAt > 60_000) {
    windows.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export function outputText(response) {
  return String(response?.choices?.[0]?.message?.content || "").trim();
}

export function outputJSON(response) {
  const text = outputText(response);
  if (!text) throw new Error("The model returned an empty response");
  return JSON.parse(text);
}

export function apiError(error) {
  const status = Number(error?.status) || 500;
  const safeStatus = [400, 405, 413, 429].includes(status) ? status : 500;
  return json({ error: safeStatus === 500 ? "AI service is temporarily unavailable" : error.message }, safeStatus);
}
