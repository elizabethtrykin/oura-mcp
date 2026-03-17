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
      { name: 'personal_info', requiresDates: false, description: 'Get personal info. Returns JSON with: id, age, weight, height, biological_sex, email' },
      { name: 'daily_activity', requiresDates: true, description: 'Get daily activity data. Returns JSON with: id, day, timestamp, score, steps, active_calories, total_calories, target_calories, equivalent_walking_distance, target_meters, meters_to_target, high_activity_met_minutes, high_activity_time, medium_activity_met_minutes, medium_activity_time, low_activity_met_minutes, low_activity_time, sedentary_met_minutes, sedentary_time, resting_time, non_wear_time, average_met_minutes, inactivity_alerts, class_5_min, met, contributors' },
      { name: 'daily_readiness', requiresDates: true, description: 'Get daily readiness score. Returns JSON with: id, day, timestamp, score, temperature_deviation, temperature_trend_deviation, contributors (activity_balance, body_temperature, hrv_balance, previous_day_activity, previous_night, recovery_index, resting_heart_rate, sleep_balance, sleep_regularity)' },
      { name: 'daily_sleep', requiresDates: true, description: 'Get daily sleep score. Returns JSON with: id, day, timestamp, score, contributors (deep_sleep, efficiency, latency, rem_sleep, restfulness, timing, total_sleep)' },
      { name: 'sleep', requiresDates: true, description: 'Get detailed sleep periods. Returns JSON with: id, day, bedtime_start, bedtime_end, type, period, total_sleep_duration, time_in_bed, awake_time, light_sleep_duration, deep_sleep_duration, rem_sleep_duration, restless_periods, efficiency, latency, average_breath, average_heart_rate, average_hrv, lowest_heart_rate, heart_rate, hrv, movement_30_sec, sleep_phase_5_min, readiness' },
      { name: 'sleep_time', requiresDates: true, description: 'Get recommended bedtime window. Returns JSON with: id, day, recommendation, status, optimal_bedtime (day_tz, start_offset, end_offset)' },
      { name: 'workout', requiresDates: true, description: 'Get workout sessions. Returns JSON with: id, day, activity, calories, distance, intensity, label, source, start_datetime, end_datetime' },
      { name: 'session', requiresDates: true, description: 'Get relaxation/meditation sessions. Returns JSON with: id, day, type, mood, start_datetime, end_datetime, heart_rate, heart_rate_variability, motion_count' },
      { name: 'daily_spo2', requiresDates: true, description: 'Get daily blood oxygen saturation. Returns JSON with: id, day, spo2_percentage (average), breathing_disturbance_index' },
      { name: 'rest_mode_period', requiresDates: true, description: 'Get rest mode periods. Returns JSON with: id, start_day, end_day, start_time, end_time, episodes (tags, timestamp)' },
      { name: 'ring_configuration', requiresDates: false, description: 'Get Oura ring hardware info. Returns JSON with: id, color, design, firmware_version, hardware_type, set_up_at, size' },
      { name: 'daily_stress', requiresDates: true, description: 'Get daily stress data. Returns JSON with: id, day, day_summary, stress_high, recovery_high' },
      { name: 'daily_resilience', requiresDates: true, description: 'Get daily resilience score. Returns JSON with: id, day, level, contributors (sleep_recovery, daytime_recovery, stress)' },
      { name: 'daily_cardiovascular_age', requiresDates: true, description: 'Get estimated cardiovascular age. Returns JSON with: id, day, vascular_age' },
      { name: 'vO2_max', requiresDates: true, description: 'Get estimated VO2 max. Returns JSON with: id, day, timestamp, vo2_max' }
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