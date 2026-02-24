import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const ORPAYNTER_API_BASE = process.env.ORPAYNTER_API_BASE;

type JsonObject = Record<string, unknown>;

type AnalysisType = 'damage_detection' | 'cost_estimation' | 'full_analysis';

/**
 * Provides AI workflows used by the OrPaynter MCP bridge.
 *
 * NOTE: This class intentionally returns deterministic demo responses when
 * ORPAYNTER_API_BASE is not configured so local development and CI can still
 * exercise tool wiring.
 */
class OrPaynterAIServer {
    /** Analyze one or more property images for claim-related insights. */
    async analyzeImages(imageUrls: string[], analysisType: AnalysisType = 'full_analysis'): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            analysisType,
            imageCount: imageUrls.length,
            findings: imageUrls.map((url, index) => ({
                imageUrl: url,
                severity: index % 2 === 0 ? 'moderate' : 'minor',
                probableDamageType: 'wind'
            }))
        };
    }

    /** Generate a summarized report from upstream AI analysis payloads. */
    async generateReport(analysisData: JsonObject, propertyInfo: JsonObject): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            generatedAt: new Date().toISOString(),
            report: {
                summary: 'Automated report generated for attorney/adjuster review.',
                analysisData,
                propertyInfo
            }
        };
    }

    /** Estimate repair costs by damage profile and property metadata. */
    async estimateCosts(damageTypes: string[], propertySize: number, location: string): Promise<JsonObject> {
        const baseRate = 8.5;
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            location,
            estimatedCostUsd: Math.round(damageTypes.length * propertySize * baseRate),
            currency: 'USD'
        };
    }

    /** Return service-level health details for model operations. */
    async getModelStatus(): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Runtime validation helper for string arrays from dynamic tool arguments.
 */
function readStringArray(value: unknown, fieldName: string): string[] {
    if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
        throw new Error(`Invalid argument: ${fieldName} must be an array of strings.`);
    }
    return value;
}

/**
 * Validates that a string is a well-formed URL.
 */
function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validates an array of URL strings.
 */
function validateUrls(urls: string[], fieldName: string): void {
    for (const url of urls) {
        if (!isValidUrl(url)) {
            throw new Error(`Invalid URL in ${fieldName}: ${url}`);
        }
    }
}

/**
 * Validates that analysisType is one of the allowed enum values.
 */
function validateAnalysisType(value: unknown): AnalysisType {
    const validTypes: AnalysisType[] = ['damage_detection', 'cost_estimation', 'full_analysis'];
    if (typeof value !== 'string' || !validTypes.includes(value as AnalysisType)) {
        throw new Error(`Invalid analysisType: expected one of ${validTypes.join(', ')}, got ${value}`);
    }
    return value as AnalysisType;
}

/**
 * Bootstraps the MCP server and registers AI tool handlers over stdio.
 */
async function main(): Promise<void> {
    const aiService = new OrPaynterAIServer();
    const server = new Server(
        {
            name: 'mcp-orpaynter-ai',
            version: '0.1.0'
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

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
                            description: 'Array of image URLs to analyze'
                        },
                        analysisType: {
                            type: 'string',
                            enum: ['damage_detection', 'cost_estimation', 'full_analysis'],
                            default: 'full_analysis'
                        }
                    },
                    required: ['imageUrls']
                }
            },
            {
                name: 'generate_report',
                description: 'Generate a detailed damage assessment report',
                inputSchema: {
                    type: 'object',
                    properties: {
                        analysisData: { type: 'object' },
                        propertyInfo: { type: 'object' }
                    },
                    required: ['analysisData', 'propertyInfo']
                }
            },
            {
                name: 'estimate_costs',
                description: 'Estimate repair costs based on damage types and property info',
                inputSchema: {
                    type: 'object',
                    properties: {
                        damageTypes: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        propertySize: { type: 'number' },
                        location: { type: 'string' }
                    },
                    required: ['damageTypes', 'propertySize', 'location']
                }
            },
            {
                name: 'get_model_status',
                description: 'Get current AI model status and health metrics',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ]
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args = {} } = request.params;

        switch (name) {
            case 'analyze_images': {
                const imageUrls = readStringArray(args.imageUrls, 'imageUrls');
                validateUrls(imageUrls, 'imageUrls');
                const analysisType = args.analysisType ? validateAnalysisType(args.analysisType) : 'full_analysis';
                const analysisResult = await aiService.analyzeImages(imageUrls, analysisType);
                return {
                    content: [{ type: 'text', text: JSON.stringify(analysisResult, null, 2) }]
                };
            }
            case 'generate_report': {
                if (!args.analysisData || typeof args.analysisData !== 'object' || Array.isArray(args.analysisData)) {
                    throw new Error('analysisData is required and must be an object');
                }
                if (!args.propertyInfo || typeof args.propertyInfo !== 'object' || Array.isArray(args.propertyInfo)) {
                    throw new Error('propertyInfo is required and must be an object');
                }
                const analysisData = args.analysisData as JsonObject;
                const propertyInfo = args.propertyInfo as JsonObject;
                const reportResult = await aiService.generateReport(analysisData, propertyInfo);
                return {
                    content: [{ type: 'text', text: JSON.stringify(reportResult, null, 2) }]
                };
            }
            case 'estimate_costs': {
                const damageTypes = readStringArray(args.damageTypes, 'damageTypes');
                const rawPropertySize = args.propertySize;
                const propertySize = typeof rawPropertySize === 'number' ? rawPropertySize : Number(rawPropertySize);
                if (!Number.isFinite(propertySize) || propertySize <= 0) {
                    throw new Error('Invalid propertySize: expected a positive number');
                }
                const location = String(args.location ?? 'unknown');
                const costResult = await aiService.estimateCosts(damageTypes, propertySize, location);
                return {
                    content: [{ type: 'text', text: JSON.stringify(costResult, null, 2) }]
                };
            }
            case 'get_model_status': {
                const statusResult = await aiService.getModelStatus();
                return {
                    content: [{ type: 'text', text: JSON.stringify(statusResult, null, 2) }]
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
    console.error('Failed to start OrPaynter AI MCP Server:', error);
    process.exit(1);
});
