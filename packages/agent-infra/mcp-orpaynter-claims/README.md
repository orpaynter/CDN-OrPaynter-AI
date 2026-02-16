# MCP OrPaynter Claims Server

MCP (Model Context Protocol) server for OrPaynter claims management and damage assessment.

## Features

- **Claim Creation**: Create new insurance claims with property and damage information
- **Damage Assessment**: Assess damage severity from property photos
- **Claims Retrieval**: List all insurance claims
- **Status Updates**: Update claim workflow status

## Installation

From the package directory:

```bash
npm install
```

Or from the root of the repository:

```bash
npm install --workspace=@orpaynter/mcp-orpaynter-claims
```

## Building

Build the TypeScript source:

```bash
npm run build
```

This compiles the TypeScript source files in `src/` to JavaScript in `dist/`.

## Running

Start the MCP server:

```bash
npm start
```

Or run directly:

```bash
node dist/index.js
```

The server runs on stdio and is designed to be used by MCP clients.

## Configuration

Set the `ORPAYNTER_API_BASE` environment variable to connect to a live OrPaynter API:

```bash
ORPAYNTER_API_BASE=https://api.orpaynter.com npm start
```

If not set, the server runs in demo mode with mock data.

## Available Tools

- `create_claim`: Create a new insurance claim
- `assess_damage`: Assess damage from property photos
- `get_claims`: Retrieve all insurance claims
- `update_claim_status`: Update the status of an existing claim
