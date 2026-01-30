# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server that exposes Oura Ring health/biometric data to Claude. Built with TypeScript, the `@modelcontextprotocol/sdk`, Express, and Zod. Supports two transport modes: stdio (for Claude Desktop/Code) and HTTP (for remote deployment).

## Commands

- **Install**: `bun install`
- **Build**: `bun run build` (compiles TypeScript to `build/` and makes `build/index.js` executable)
- **Dev (stdio)**: `bun run dev` (runs TypeScript directly, no build step)
- **Dev (HTTP)**: `bun run dev:http` (runs HTTP server from TypeScript)
- **Start (stdio)**: `bun run start` (runs compiled JS)
- **Start (HTTP)**: `bun run start:http` (runs compiled JS with `--http` flag)
- **Test**: `bun test`

Tests require a built project and a valid `OURA_PERSONAL_ACCESS_TOKEN` in the environment — they spawn the server as a subprocess and make real API calls.

## Architecture

**Entry point** (`src/index.ts`): Loads `.env`, validates auth config, detects transport mode (`--http` flag or `MCP_TRANSPORT=http` env var), then starts either stdio or HTTP server.

- `startStdio()`: Creates `OuraProvider`, connects to `StdioServerTransport`. Used by Claude Desktop and Claude Code.
- `startHttp()`: Creates Express server with `StreamableHTTPServerTransport` on `/mcp`. Each MCP session gets its own `OuraProvider` instance. Includes `/health` endpoint and optional API key auth via `MCP_API_KEY`.

**OuraProvider** (`src/provider/oura_provider.ts`): Core server logic. Dynamically registers 15 Oura API endpoints as both MCP **resources** (URI scheme `oura://<name>`, returns last 7 days by default) and MCP **tools** (`get_<name>` with `startDate`/`endDate` params). Non-date endpoints (`personal_info`, `ring_configuration`) get only a resource.

**OuraAuth** (`src/provider/oura_connection.ts`): Handles dual auth — Personal Access Token (simple bearer token) or OAuth2 with automatic token refresh. Provides `getHeaders()` used by all API calls.

All Oura API calls go through `fetchOuraData()` in OuraProvider, which constructs URLs against `https://api.ouraring.com/v2/usercollection/<endpoint>`.

## Key Details

- ES Modules throughout (`"type": "module"` in package.json). All local imports use `.js` extensions even for `.ts` source files.
- TypeScript strict mode, target ES2022, module system Node16.
- Bun is the primary runtime; Node.js is also supported.
- `src/provider/resources/personal_info.ts` exists but is unused; the personal_info logic is handled inline in OuraProvider.
- Docker deployment uses `oven/bun` base image and runs in HTTP mode by default.
