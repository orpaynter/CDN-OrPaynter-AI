import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ORPAYNTER_API_BASE = process.env.ORPAYNTER_API_BASE;

type JsonObject = Record<string, unknown>;

/**
 * Provides claims-domain workflows exposed through MCP tools.
 */
class OrPaynterClaimsServer {
  /** Create a new claim intake record. */
  async createClaim(
    propertyAddress: string,
    damageType: string,
    photos: string[]
  ): Promise<JsonObject> {
    return {
      mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
      claimId: `claim_${Date.now()}`,
      propertyAddress,
      damageType,
      photos,
      status: 'submitted',
    };
  }

  /** Assess property damage from photo evidence. */
  async assessDamage(photoUrls: string[]): Promise<JsonObject> {
    const mode = ORPAYNTER_API_BASE ? 'live' : 'demo';

    const findings =
      mode === 'demo' ? this.generateDemoFindings(photoUrls) : [];

    return {
      mode,
      assessedPhotos: photoUrls.length,
      riskLevel: photoUrls.length > 3 ? 'medium' : 'low',
      findings,
    };
  }

  /**
   * Generate clearly synthetic findings for demo mode so callers are not misled.
   */
  private generateDemoFindings(photoUrls: string[]): string[] {
    if (photoUrls.length === 0) {
      return ['DEMO: no photos provided – synthetic assessment only'];
    }

    if (photoUrls.length === 1) {
      return ['DEMO: possible minor exterior wear (example finding)'];
    }

    if (photoUrls.length <= 3) {
      return [
        'DEMO: possible localized damage (example finding)',
        'DEMO: recommend in-person inspection (example finding)',
      ];
    }

    return [
      'DEMO: multiple areas of potential damage (example finding)',
      'DEMO: recommend comprehensive roof inspection (example finding)',
    ];
  }

  /** Return available claims records for the current tenant/user scope. */
  async getClaims(): Promise<JsonObject> {
    return {
      mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
      claims: [],
      total: 0,
    };
  }

  /** Update the lifecycle status of a claim record. */
  async updateClaimStatus(claimId: string, status: string): Promise<JsonObject> {
    return {
      mode: ORPAYNTER_API_BASE ? 'live' : 'demo',
      claimId,
      status,
      updatedAt: new Date().toISOString(),
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
 * Bootstraps the MCP claims server and exposes stdio tool handlers.
 */
async function main(): Promise<void> {
  const claimsService = new OrPaynterClaimsServer();
  const server = new Server(
    {
      name: 'mcp-orpaynter-claims',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
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
              items: { type: 'string' },
            },
          },
          required: ['propertyAddress', 'damageType', 'photos'],
        },
      },
      {
        name: 'assess_damage',
        description: 'Assess damage from property photos',
        inputSchema: {
          type: 'object',
          properties: {
            photoUrls: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['photoUrls'],
        },
      },
      {
        name: 'get_claims',
        description: 'Retrieve all insurance claims',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'update_claim_status',
        description: 'Update the status of an existing claim',
        inputSchema: {
          type: 'object',
          properties: {
            claimId: { type: 'string' },
            status: { type: 'string' },
          },
          required: ['claimId', 'status'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    switch (name) {
      case 'create_claim': {
        const propertyAddressRaw = args.propertyAddress;
        const damageTypeRaw = args.damageType;

        if (typeof propertyAddressRaw !== 'string' || propertyAddressRaw.trim() === '') {
          throw new Error(
            'create_claim: "propertyAddress" is required and must be a non-empty string.'
          );
        }

        if (typeof damageTypeRaw !== 'string' || damageTypeRaw.trim() === '') {
          throw new Error('create_claim: "damageType" is required and must be a non-empty string.');
        }

        const propertyAddress = propertyAddressRaw;
        const damageType = damageTypeRaw;
        const photos = readStringArray(args.photos, 'photos');
        validateUrls(photos, 'photos');

        const claimResult = await claimsService.createClaim(propertyAddress, damageType, photos);
        return {
          content: [{ type: 'text', text: JSON.stringify(claimResult, null, 2) }],
        };
      }
      case 'assess_damage': {
        const photoUrls = readStringArray(args.photoUrls, 'photoUrls');
        validateUrls(photoUrls, 'photoUrls');
        const assessmentResult = await claimsService.assessDamage(photoUrls);
        return {
          content: [{ type: 'text', text: JSON.stringify(assessmentResult, null, 2) }],
        };
      }
      case 'get_claims': {
        const claimsResult = await claimsService.getClaims();
        return {
          content: [{ type: 'text', text: JSON.stringify(claimsResult, null, 2) }],
        };
      }
      case 'update_claim_status': {
        const claimIdRaw = args.claimId;
        const statusRaw = args.status;

        if (typeof claimIdRaw !== 'string' || claimIdRaw.trim() === '') {
          throw new Error(
            'update_claim_status: "claimId" is required and must be a non-empty string.'
          );
        }

        if (typeof statusRaw !== 'string' || statusRaw.trim() === '') {
          throw new Error(
            'update_claim_status: "status" is required and must be a non-empty string.'
          );
        }

        const claimId = claimIdRaw;
        const status = statusRaw;
        const updateResult = await claimsService.updateClaimStatus(claimId, status);
        return {
          content: [{ type: 'text', text: JSON.stringify(updateResult, null, 2) }],
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
