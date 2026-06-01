/**
 * Hosted ephemeral share for HTML Viewer — POST creates 24h id, GET retrieves JSON.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (Vercel / Upstash Marketplace).
 */
const crypto = require("crypto");
const { Redis } = require("@upstash/redis");
const { Ratelimit } = require("@upstash/ratelimit");

const MAX_BYTES = 400 * 1024;
const TTL_SEC = 86400;
const ID_RE = /^[a-f0-9]{32}$/;

let redisSingleton = null;
let ratelimitSingleton = null;

function getRedis() {
  var url = process.env.UPSTASH_REDIS_REST_URL;
  var token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redisSingleton) redisSingleton = new Redis({ url: url, token: token });
  return redisSingleton;
}

function getRatelimit(redis) {
  if (!ratelimitSingleton) {
    ratelimitSingleton = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "1 h"),
      prefix: "hibot:vshare",
    });
  }
  return ratelimitSingleton;
}

function clientIp(req) {
  var xf = req.headers["x-forwarded-for"];
  if (xf && typeof xf === "string") {
    var first = xf.split(",")[0];
    if (first) return first.trim();
  }
  return (req.socket && req.socket.remoteAddress) || "0.0.0.0";
}

function baseUrl(req) {
  var proto = req.headers["x-forwarded-proto"] || "https";
  var host = req.headers["x-forwarded-host"] || req.headers.host || "";
  return proto + "://" + host;
}

function viewerUrl(req, id) {
  return baseUrl(req) + "/viewer.html?share=" + encodeURIComponent(id);
}

function readJsonBody(req, maxBytes) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var total = 0;
    var failed = false;
    req.on("data", function (chunk) {
      if (failed) return;
      total += chunk.length;
      if (total > maxBytes) {
        failed = true;
        try {
          req.destroy();
        } catch (e) { /* ignore */ }
        reject(Object.assign(new Error("payload_too_large"), { code: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      if (failed) return;
      var raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(Object.assign(new Error("invalid_json"), { code: 400 }));
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store, max-age=0");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  var redis = getRedis();
  if (!redis) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "service_unavailable", message: "Hosted shares are not configured on this deployment." }));
    return;
  }

  try {
    if (req.method === "POST") {
      var rl = getRatelimit(redis);
      var ip = clientIp(req);
      var limit = await rl.limit("post:" + ip);
      if (!limit.success) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "rate_limited", message: "Too many short links created. Try again in an hour." }));
        return;
      }

      var body = await readJsonBody(req, MAX_BYTES + 65536);
      if (!body || typeof body !== "object") {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid_body", message: "Expected JSON object." }));
        return;
      }
      if (typeof body.html !== "string" || typeof body.css !== "string" || typeof body.js !== "string") {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid_shape", message: "Body must include html, css, and js strings." }));
        return;
      }

      var payload = JSON.stringify({ html: body.html, css: body.css, js: body.js });
      var bytes = Buffer.byteLength(payload, "utf8");
      if (bytes > MAX_BYTES) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: "payload_too_large", message: "Snapshot exceeds " + (MAX_BYTES / 1024) + " KB." }));
        return;
      }

      var id = crypto.randomBytes(16).toString("hex");
      var key = "vshare:" + id;
      await redis.set(key, payload, { ex: TTL_SEC });

      res.statusCode = 200;
      res.end(JSON.stringify({ id: id, url: viewerUrl(req, id) }));
      return;
    }

    if (req.method === "GET") {
      var id = "";
      try {
        var u = new URL(req.url || "/", "https://local.invalid");
        id = u.searchParams.get("id") || u.searchParams.get("share") || "";
      } catch (e1) {
        id = "";
      }
      if (!ID_RE.test(id)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid_id", message: "Missing or invalid share id." }));
        return;
      }

      var rawGet = await redis.get("vshare:" + id);
      if (rawGet == null) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not_found", message: "This link has expired or never existed." }));
        return;
      }

      var parsed;
      try {
        parsed = typeof rawGet === "string" ? JSON.parse(rawGet) : rawGet;
      } catch (e2) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "corrupt_entry", message: "Stored snapshot is invalid." }));
        return;
      }
      if (!parsed || typeof parsed.html !== "string") {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "corrupt_entry", message: "Stored snapshot is invalid." }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ html: parsed.html, css: parsed.css, js: parsed.js }));
      return;
    }

    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.end(JSON.stringify({ error: "method_not_allowed" }));
  } catch (err) {
    if (err && err.code === 413) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: "payload_too_large", message: "Request body too large." }));
      return;
    }
    if (err && err.code === 400) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "invalid_json", message: "Invalid JSON body." }));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "internal_error", message: "Something went wrong." }));
  }
};
