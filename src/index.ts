#!/usr/bin/env node

import { config as dotenvConfig } from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OuraProvider } from './provider/oura_provider.js';

dotenvConfig();

const config = {
  api: {
    baseUrl: 'https://api.ouraring.com/v2',
  },
  auth: {
    personalAccessToken: process.env.OURA_PERSONAL_ACCESS_TOKEN || '',
    clientId: process.env.OURA_CLIENT_ID || '',
    clientSecret: process.env.OURA_CLIENT_SECRET || '',
    redirectUri: process.env.OURA_REDIRECT_URI || 'http://localhost:3000/callback'
  },
  server: {
    name: 'oura-provider',
    version: '1.0.0'
  }
};

function validateConfig() {
  const { personalAccessToken, clientId, clientSecret } = config.auth;
  
  if (!personalAccessToken && (!clientId || !clientSecret)) {
    throw new Error('Either OURA_PERSONAL_ACCESS_TOKEN or both OURA_CLIENT_ID and OURA_CLIENT_SECRET must be provided');
  }
}

async function main() {
  // Validate configuration
  validateConfig();

  // Create and initialize the provider
  const provider = new OuraProvider({
    personalAccessToken: config.auth.personalAccessToken,
    clientId: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
    redirectUri: config.auth.redirectUri
  });
  
  const transport = new StdioServerTransport();
  
  await provider.getServer().connect(transport);
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});
