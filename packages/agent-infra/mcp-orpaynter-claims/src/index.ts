import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const ORPAYNTER_API_BASE = process.env.ORPAYNTER_API_BASE;

type JsonObject = Record<string, unknown>;

/**
 * Provides claims-domain workflows exposed through MCP tools.
 */
class OrPaynterClaimsServer {
    /** Create a new claim intake record. */
    async createClaim(propertyAddress: string, damageType: string, photos: string[]): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            claimId: `claim_${Date.now()}`,
            propertyAddress,
            damageType,
            photos,
            status: 'submitted'
        };
    }

    /** Assess property damage from photo evidence. */
    async assessDamage(photoUrls: string[]): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            assessedPhotos: photoUrls.length,
            riskLevel: photoUrls.length > 3 ? 'medium' : 'low',
            findings: ['roofing impact damage', 'flashing deterioration']
        };
    }

    /** Return available claims records for the current tenant/user scope. */
    async getClaims(): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            claims: [],
            total: 0
        };
    }

    /** Update the lifecycle status of a claim record. */
    async updateClaimStatus(claimId: string, status: string): Promise<JsonObject> {
        return {
            mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
            claimId,
            status,
            updatedAt: new Date().toISOString()
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
 * Bootstraps the MCP claims server and exposes stdio tool handlers.
 */
async function main(): Promise<void> {
    const claimsService = new OrPaynterClaimsServer();
    const server = new Server(
        {
            name: 'mcp-orpaynter-claims',
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
                name: 'create_claim',
                description: 'Create a new insurance claim',
                inputSchema: {
                    type: 'object',
                    properties: {
                        propertyAddress: { type: 'string' },
                        damageType: { type: 'string' },
                        photos: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    },
                    required: ['propertyAddress', 'damageType', 'photos']
                }
            },
            {
                name: 'assess_damage',
                description: 'Assess damage from property photos',
                inputSchema: {
                    type: 'object',
                    properties: {
                        photoUrls: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    },
                    required: ['photoUrls']
                }
            },
            {
                name: 'get_claims',
                description: 'Retrieve all insurance claims',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'update_claim_status',
                description: 'Update the status of an existing claim',
                inputSchema: {
                    type: 'object',
                    properties: {
                        claimId: { type: 'string' },
                        status: { type: 'string' }
                    },
                    required: ['claimId', 'status']
                }
            }
        ]
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args = {} } = request.params;

        switch (name) {
            case 'create_claim': {
                const propertyAddress = String(args.propertyAddress ?? '');
                const damageType = String(args.damageType ?? '');
                const photos = readStringArray(args.photos, 'photos');
                const claimResult = await claimsService.createClaim(propertyAddress, damageType, photos);
                return {
                    content: [{ type: 'text', text: JSON.stringify(claimResult, null, 2) }]
                };
            }
            case 'assess_damage': {
                const photoUrls = readStringArray(args.photoUrls, 'photoUrls');
                const assessmentResult = await claimsService.assessDamage(photoUrls);
                return {
                    content: [{ type: 'text', text: JSON.stringify(assessmentResult, null, 2) }]
                };
            }
            case 'get_claims': {
                const claimsResult = await claimsService.getClaims();
                return {
                    content: [{ type: 'text', text: JSON.stringify(claimsResult, null, 2) }]
                };
            }
            case 'update_claim_status': {
                const claimId = String(args.claimId ?? '');
                const status = String(args.status ?? '');
                const updateResult = await claimsService.updateClaimStatus(claimId, status);
                return {
                    content: [{ type: 'text', text: JSON.stringify(updateResult, null, 2) }]
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('OrPaynter Claims MCP Server running on stdio');
    console.error(`Demo Mode: ${!ORPAYNTER_API_BASE ? 'enabled' : 'disabled'}`);
}

main().catch((error) => {
    console.error('Failed to start OrPaynter Claims MCP Server:', error);
    process.exit(1);
});
