#!/usr/bin/env node
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || "http://127.0.0.1:8787/oauth2callback";
const SCOPE = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

if (!CLIENT_ID) {
    console.error("Set YOUTUBE_CLIENT_ID before starting the one-time OAuth flow.");
    process.exit(1);
}

const state = randomUUID();
const authUrl = new URL(AUTH_ENDPOINT);
authUrl.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
}).toString();

const callback = new URL(REDIRECT_URI);
const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", REDIRECT_URI);
    if (requestUrl.pathname !== callback.pathname) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }
    if (requestUrl.searchParams.get("state") !== state) {
        response.writeHead(400);
        response.end("OAuth state mismatch");
        server.close();
        process.exitCode = 1;
        return;
    }
    const code = requestUrl.searchParams.get("code");
    const oauthError = requestUrl.searchParams.get("error");
    if (!code) {
        response.writeHead(400);
        response.end(`OAuth failed: ${oauthError || "missing authorization code"}`);
        server.close();
        process.exitCode = 1;
        return;
    }

    try {
        const tokenResponse = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });
        const payload = await tokenResponse.json();
        if (!tokenResponse.ok || !payload.refresh_token) {
            throw new Error(payload.error_description || payload.error || "Google did not return a refresh token.");
        }
        response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
        response.end("Authorization complete. You can close this window.");
        console.log("YOUTUBE_REFRESH_TOKEN=" + payload.refresh_token);
        console.log("Copy that value into the private GitHub Actions secret named YOUTUBE_REFRESH_TOKEN.");
        server.close();
    } catch (error) {
        response.writeHead(500);
        response.end("OAuth token exchange failed");
        console.error(error.stack || error.message);
        server.close();
        process.exitCode = 1;
    }
});

server.on("error", (error) => {
    console.error(`Could not listen on ${REDIRECT_URI}: ${error.message}`);
    process.exitCode = 1;
});

server.listen(Number(callback.port || 80), callback.hostname, () => {
    console.log("Open this URL in a browser, authorize the Orb Foundry YouTube channel, and wait for the callback:");
    console.log(authUrl.toString());
    console.log(`Listening for OAuth callback at ${REDIRECT_URI}`);
});
