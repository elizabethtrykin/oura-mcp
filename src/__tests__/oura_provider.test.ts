import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('OuraProvider', () => {
  let client: Client;
  let serverProcess: any;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    // Start the server process
    const serverPath = join(__dirname, '../../build/index.js');
    serverProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        OURA_PERSONAL_ACCESS_TOKEN: process.env.OURA_PERSONAL_ACCESS_TOKEN,
      },
    });

    // Create MCP client
    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        OURA_PERSONAL_ACCESS_TOKEN: process.env.OURA_PERSONAL_ACCESS_TOKEN ?? '',
      }
    });

    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    if (transport) {
      await (transport as any).stop();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should list available resources', async () => {
    const resources = await client.listResources();
    expect(resources).toContainEqual(
      expect.objectContaining({
        name: 'personal_info',
      })
    );
  });

  it('should list available tools', async () => {
    const tools = await client.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({
        name: 'get_sleep',
      })
    );
  });

  it('should fetch personal info', async () => {
    const resource = await client.readResource({
      uri: 'oura://personal_info'
    });
    expect(resource).toBeDefined();
  });

  it('should get sleep data', async () => {
    const result = await client.callTool({
      name: 'get_sleep',
      arguments: {
        startDate: '2024-03-14',
        endDate: '2024-03-15',
      },
    });
    expect(result).toBeDefined();
  });
}); 