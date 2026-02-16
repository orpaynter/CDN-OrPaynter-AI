#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ORPAYNTER_API_BASE = process.env.ORPAYNTER_API_BASE;

type AnalysisType = 'damage_detection' | 'cost_estimation' | 'full_analysis';

interface AnalyzeImagesResult {
  analysisType: AnalysisType;
  imageCount: number;
  findings: string[];
  confidence: number;
}

interface GenerateReportResult {
  reportId: string;
  summary: string;
  generatedAt: string;
}

interface EstimateCostsResult {
  lowEstimate: number;
  highEstimate: number;
  currency: 'USD';
}

interface ModelStatusResult {
  status: 'healthy' | 'degraded';
  mode: 'demo' | 'live';
  latencyMsP95: number;
}

/**
 * Encapsulates API and demo behavior for OrPaynter AI workflows.
 */
class OrPaynterAIServer {
  /**
   * Analyze property images and return damage-oriented findings.
   */
  async analyzeImages(
    imageUrls: string[],
    analysisType: AnalysisType = 'full_analysis'
  ): Promise<AnalyzeImagesResult> {
    if (!ORPAYNTER_API_BASE) {
      return {
        analysisType,
        imageCount: imageUrls.length,
        findings: ['Missing shingles detected', 'Gutter impact damage observed'],
        confidence: 0.87,
      };
    }

    return this.post<AnalyzeImagesResult>('/ai/analyze-images', {
      imageUrls,
      analysisType,
    });
  }

  /**
   * Generate a structured report from model analysis output.
   */
  async generateReport(
    analysisData: Record<string, unknown>,
    propertyInfo: Record<string, unknown>
  ): Promise<GenerateReportResult> {
    if (!ORPAYNTER_API_BASE) {
      return {
        reportId: `demo-${Date.now()}`,
        summary: 'Demo report generated from provided analysis and property metadata.',
        generatedAt: new Date().toISOString(),
      };
    }

    return this.post<GenerateReportResult>('/ai/generate-report', {
      analysisData,
      propertyInfo,
    });
  }

  /**
   * Estimate cost ranges from damage categories and property context.
   */
  async estimateCosts(
    damageTypes: string[],
    propertySize: number,
    location: string
  ): Promise<EstimateCostsResult> {
    if (!ORPAYNTER_API_BASE) {
      const base = Math.max(500, propertySize * 3.5);
      return {
        lowEstimate: Math.round(base + damageTypes.length * 350),
        highEstimate: Math.round(base * 1.8 + damageTypes.length * 800),
        currency: 'USD',
      };
    }

    return this.post<EstimateCostsResult>('/ai/estimate-costs', {
      damageTypes,
      propertySize,
      location,
    });
  }

  /**
   * Retrieve health details for observability and routing decisions.
   */
  async getModelStatus(): Promise<ModelStatusResult> {
    if (!ORPAYNTER_API_BASE) {
      return {
        status: 'healthy',
        mode: 'demo',
        latencyMsP95: 220,
      };
    }

    return this.post<ModelStatusResult>('/ai/model-status', {});
  }

  /**
   * Send a JSON POST request to the configured OrPaynter API.
   */
  private async post<TResponse>(
    path: string,
    body: Record<string, unknown>
  ): Promise<TResponse> {
    const response = await fetch(`${ORPAYNTER_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`OrPaynter AI API request failed: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}

/**
 * Bootstraps MCP stdio transport and registers tool contracts.
 */
async function main(): Promise<void> {
  const aiService = new OrPaynterAIServer();
  const server = new Server(
    {
      name: 'mcp-orpaynter-ai',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Registers this server's tool catalog for MCP clients.
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'analyze_images',
        description: 'Analyze property images for damage detection with AI',
        inputSchema: {
          type: 'object',
          properties: {
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of image URLs to analyze',
            },
            analysisType: {
              type: 'string',
              enum: ['damage_detection', 'cost_estimation', 'full_analysis'],
              default: 'full_analysis',
            },
          },
          required: ['imageUrls'],
        },
      },
      {
        name: 'generate_report',
        description: 'Generate a detailed damage assessment report',
        inputSchema: {
          type: 'object',
          properties: {
            analysisData: { type: 'object' },
            propertyInfo: { type: 'object' },
          },
          required: ['analysisData', 'propertyInfo'],
        },
      },
      {
        name: 'estimate_costs',
        description:
          'Estimate repair costs based on damage types and property info',
        inputSchema: {
          type: 'object',
          properties: {
            damageTypes: {
              type: 'array',
              items: { type: 'string' },
            },
            propertySize: { type: 'number' },
            location: { type: 'string' },
          },
          required: ['damageTypes', 'propertySize', 'location'],
        },
      },
      {
        name: 'get_model_status',
        description: 'Get current AI model status and health metrics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  }));

  // Routes tool executions to local service methods.
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    switch (name) {
      case 'analyze_images': {
        const typedArgs = args as {
          imageUrls: string[];
          analysisType?: AnalysisType;
        };
        const analysisResult = await aiService.analyzeImages(
          typedArgs.imageUrls,
          typedArgs.analysisType
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(analysisResult, null, 2) }],
        };
      }

      case 'generate_report': {
        const typedArgs = args as {
          analysisData: Record<string, unknown>;
          propertyInfo: Record<string, unknown>;
        };
        const reportResult = await aiService.generateReport(
          typedArgs.analysisData,
          typedArgs.propertyInfo
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(reportResult, null, 2) }],
        };
      }

      case 'estimate_costs': {
        const typedArgs = args as {
          damageTypes: string[];
          propertySize: number;
          location: string;
        };
        const costResult = await aiService.estimateCosts(
          typedArgs.damageTypes,
          typedArgs.propertySize,
          typedArgs.location
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(costResult, null, 2) }],
        };
      }

      case 'get_model_status': {
        const statusResult = await aiService.getModelStatus();
        return {
          content: [{ type: 'text', text: JSON.stringify(statusResult, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('OrPaynter AI MCP Server running on stdio');
  console.error(`Demo Mode: ${!ORPAYNTER_API_BASE ? 'enabled' : 'disabled'}`);
}

main().catch((error) => {
  console.error('Fatal error in mcp-orpaynter-ai server:', error);
  process.exitCode = 1;
});
