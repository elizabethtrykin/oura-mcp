import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OuraAuth } from './oura_connection.js';

export interface OuraConfig {
  personalAccessToken?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export class OuraProvider {
  private server: McpServer;
  private auth: OuraAuth;

  constructor(config: OuraConfig) {
    this.auth = new OuraAuth(
      config.personalAccessToken,
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.server = new McpServer({
      name: "oura-provider",
      version: "1.0.0"
    });

    this.initializeResources();
  }

  private async fetchOuraData(endpoint: string, params?: Record<string, string>): Promise<any> {
    const headers = await this.auth.getHeaders();
    const url = new URL(`${this.auth.getBaseUrl()}/usercollection/${endpoint}`);
    
    if (params) {
      // Log the incoming date parameters
      console.log(`Fetching ${endpoint} with dates:`, params);
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    // Log the response data dates
    if (data.data && data.data.length > 0) {
      console.log(`Response data for ${endpoint}:`, data.data.map((d: { day?: string; timestamp?: string }) => d.day || d.timestamp));
    }
    return data;
  }

  private initializeResources(): void {
    // Define the date range schema for tools
    const dateRangeSchema = {
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format")
    };

    // Add resources and tools for each endpoint
    const endpoints = [
      { name: 'personal_info', requiresDates: false, description: 'Get personal info (age, weight, height, etc.)' },
      { name: 'daily_activity', requiresDates: true, description: 'Get daily activity data (steps, calories, movement, etc.)' },
      { name: 'daily_readiness', requiresDates: true, description: 'Get daily readiness score and contributors' },
      { name: 'daily_sleep', requiresDates: true, description: 'Get daily sleep score and contributors' },
      { name: 'sleep', requiresDates: true, description: 'Get detailed sleep period data (stages, HR, HRV, etc.)' },
      { name: 'sleep_time', requiresDates: true, description: 'Get recommended sleep time windows' },
      { name: 'workout', requiresDates: true, description: 'Get workout sessions (type, duration, intensity, etc.)' },
      { name: 'session', requiresDates: true, description: 'Get relaxation/meditation session data' },
      { name: 'daily_spo2', requiresDates: true, description: 'Get daily blood oxygen (SpO2) readings' },
      { name: 'rest_mode_period', requiresDates: true, description: 'Get rest mode periods and recovery data' },
      { name: 'ring_configuration', requiresDates: false, description: 'Get Oura ring hardware configuration' },
      { name: 'daily_stress', requiresDates: true, description: 'Get daily stress levels and recovery data' },
      { name: 'daily_resilience', requiresDates: true, description: 'Get daily resilience score and contributors' },
      { name: 'daily_cardiovascular_age', requiresDates: true, description: 'Get estimated cardiovascular age' },
      { name: 'vO2_max', requiresDates: true, description: 'Get estimated VO2 max values' }
    ];

    // Add resources
    endpoints.forEach(({ name, requiresDates }) => {
      this.server.resource(
        name,
        `oura://${name}`,
        async (uri) => {
          let data;
          if (requiresDates) {
            // For date-based resources, fetch last 7 days by default
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            data = await this.fetchOuraData(name, { start_date: startDate, end_date: endDate });
          } else {
            data = await this.fetchOuraData(name);
          }

          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(data, null, 2)
            }]
          };
        }
      );
    });

    // Add tools
    endpoints.filter(e => e.requiresDates).forEach(({ name, description }) => {
      this.server.tool(
        `get_${name}`,
        description,
        dateRangeSchema,
        async ({ startDate, endDate }) => {
          const data = await this.fetchOuraData(name, {
            start_date: startDate,
            end_date: endDate
          });

          return {
            content: [{
              type: "text",
              text: JSON.stringify(data, null, 2)
            }]
          };
        }
      );
    });
  }

  getServer(): McpServer {
    return this.server;
  }
} 