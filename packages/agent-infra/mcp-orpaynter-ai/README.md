# MCP OrPaynter AI Server

MCP (Model Context Protocol) server for OrPaynter AI damage detection and cost estimation.

## Features

- **Image Analysis**: Analyze property images for damage detection using AI
- **Report Generation**: Generate detailed damage assessment reports
- **Cost Estimation**: Estimate repair costs based on damage types and property information
- **Model Status**: Check AI model health and performance metrics

## Installation

From the package directory:

```bash
npm install
```

Or from the root of the repository:

```bash
npm install --workspace=@orpaynter/mcp-orpaynter-ai
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

- `analyze_images`: Analyze property images for damage detection
- `generate_report`: Generate a detailed damage assessment report
- `estimate_costs`: Estimate repair costs based on damage and property info
- `get_model_status`: Get current AI model status and health metrics
