import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ORPAYNTER_API_BASE = process.env.ORPAYNTER_API_BASE;

interface ClaimRecord {
  claimId: string;
  propertyAddress: string;
  damageType: string;
  photoCount: number;
  status: string;
}

interface DamageAssessmentResult {
  severity: 'minor' | 'moderate' | 'major';
  estimatedLossUsd: number;
  observations: string[];
}

/**
 * Coordinates claims operations for MCP tool handlers.
 */
class OrPaynterClaimsServer {
  /**
   * Create a new claim record with required claim metadata.
   */
  async createClaim(
    propertyAddress: string,
    damageType: string,
    photos: string[]
  ): Promise<ClaimRecord> {
    if (!ORPAYNTER_API_BASE) {
      return {
        claimId: `clm-${Date.now()}`,
        propertyAddress,
        damageType,
        photoCount: photos.length,
        status: 'submitted',
      };
    }

    return this.post<ClaimRecord>('/claims/create', {
      propertyAddress,
      damageType,
      photos,
    });
  }

  /**
   * Evaluate uploaded photos and return damage characteristics.
   */
  async assessDamage(photoUrls: string[]): Promise<DamageAssessmentResult> {
    if (!ORPAYNTER_API_BASE) {
      return {
        severity: 'moderate',
        estimatedLossUsd: 7250,
        observations: ['Wind uplift pattern detected', 'Water ingress indicators present'],
      };
    }

    return this.post<DamageAssessmentResult>('/claims/assess-damage', { photoUrls });
  }

  /**
   * Fetch all claims available to the current tenant/context.
   */
  async getClaims(): Promise<ClaimRecord[]> {
    if (!ORPAYNTER_API_BASE) {
      return [
        {
          claimId: 'clm-demo-001',
          propertyAddress: '123 Sample St, Austin, TX',
          damageType: 'hail',
          photoCount: 8,
          status: 'in_review',
        },
      ];
    }

    return this.post<ClaimRecord[]>('/claims/list', {});
  }

  /**
   * Update workflow status for an existing claim.
   */
  async updateClaimStatus(claimId: string, status: string): Promise<ClaimRecord> {
    if (!ORPAYNTER_API_BASE) {
      return {
        claimId,
        propertyAddress: 'Unknown in demo mode',
        damageType: 'unknown',
        photoCount: 0,
        status,
      };
    }

    return this.post<ClaimRecord>('/claims/update-status', { claimId, status });
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
      let errorBodySnippet = '';
      try {
        const rawBody = await response.text();
        if (rawBody) {
          const maxLength = 500;
          const trimmed =
            rawBody.length > maxLength ? rawBody.slice(0, maxLength) + '…' : rawBody;
          errorBodySnippet = ` | body: ${trimmed}`;
        }
      } catch {
        // Ignore errors while reading error body; fall back to status information only.
      }

      const statusTextPart = response.statusText ? ` ${response.statusText}` : '';
      throw new Error(
        `OrPaynter Claims API request failed: ${response.status}${statusTextPart}${errorBodySnippet}`
      );
    }

    return (await response.json()) as TResponse;
  }
}

/**
 * Bootstraps MCP stdio transport and registers tool contracts.
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

  // Registers this server's tool catalog for MCP clients.
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

  // Routes tool executions to local service methods.
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    switch (name) {
      case 'create_claim': {
        const typedArgs = args as {
          propertyAddress: string;
          damageType: string;
          photos: string[];
        };
        const claimResult = await claimsService.createClaim(
          typedArgs.propertyAddress,
          typedArgs.damageType,
          typedArgs.photos
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(claimResult, null, 2) }],
        };
      }

      case 'assess_damage': {
        const typedArgs = args as { photoUrls: string[] };
        const assessmentResult = await claimsService.assessDamage(typedArgs.photoUrls);
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
        const typedArgs = args as {
          claimId: string;
          status: string;
        };
        const updateResult = await claimsService.updateClaimStatus(
          typedArgs.claimId,
          typedArgs.status
        );
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
  console.error('Fatal error in mcp-orpaynter-claims server:', error);
  process.exitCode = 1;
});
