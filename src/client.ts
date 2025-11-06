import WebSocket from 'ws';

interface ClientOptions {
  target: string;
  server?: string;
  secret?: string;
  subdomain?: string;
}

export function startClient(options: ClientOptions) {
  const SERVER = options.server || process.env.SERVER;
  const SECRET = options.secret || process.env.SECRET;
  const SUBDOMAIN = options.subdomain || process.env.SUBDOMAIN;
  const TARGET = options.target || process.env.TARGET;

  if (!SERVER) {
    console.error('❌ ERROR: Server hostname required');
    console.error('   Use: relay 3000 --server tunnel.example.com');
    console.error('   Or set SERVER environment variable');
    process.exit(1);
  }

  if (!SECRET) {
    console.error('❌ ERROR: Authentication secret required');
    console.error('   Use: relay 3000 --secret your-secret');
    console.error('   Or set SECRET environment variable');
    process.exit(1);
  }

  if (!TARGET) {
    console.error('❌ ERROR: Target required');
    console.error('   Usage: relay 3000');
    console.error('   Usage: relay app:3000');
    process.exit(1);
  }

  // Parse target
  let targetHost: string;
  let targetPort: number;

  if (TARGET.includes(':')) {
    const [host, port] = TARGET.split(':');
    targetHost = host;
    targetPort = parseInt(port, 10);
  } else {
    targetHost = 'localhost';
    targetPort = parseInt(TARGET, 10);
  }

  if (isNaN(targetPort)) {
    console.error(`❌ ERROR: Invalid target port: ${TARGET}`);
    process.exit(1);
  }

  const localUrl = `http://${targetHost}:${targetPort}`;

  // Auto-detect protocol: use ws:// for localhost/127.0.0.1, wss:// for everything else
  let serverUrl: string;
  if (SERVER.startsWith('ws://') || SERVER.startsWith('wss://')) {
    serverUrl = SERVER;
  } else {
    const isLocalhost = SERVER.includes('localhost') || SERVER.includes('127.0.0.1');
    const protocol = isLocalhost ? 'ws' : 'wss';
    serverUrl = `${protocol}://${SERVER}/relay`;
  }

  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isConnected = false;

  function connect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    console.log(`Connecting to ${SERVER}...`);
    ws = new WebSocket(serverUrl);

    ws.on('open', () => {
      console.log('✓ Connected to server');
      isConnected = true;

      const authMessage: any = {
        type: 'auth',
        secret: SECRET
      };

      if (SUBDOMAIN) {
        authMessage.subdomain = SUBDOMAIN;
        console.log(`Requesting subdomain: ${SUBDOMAIN}`);
      }

      ws!.send(JSON.stringify(authMessage));
    });

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'ready') {
          console.log();
          console.log(`🔄 Relay active!`);
          console.log(`   ${msg.url}`);
          console.log(`   → ${localUrl}`);
          console.log();
        }

        if (msg.type === 'error') {
          console.error(`❌ Server error: ${msg.message}`);
          process.exit(1);
        }

        if (msg.type === 'request') {
          try {
            const url = localUrl + msg.path;
            const headers = {
              ...msg.headers,
              host: `${targetHost}:${targetPort}`
            };

            const response = await fetch(url, {
              method: msg.method,
              headers: headers as Headers,
              body: msg.body || undefined,
              redirect: 'manual'
            });

            // Read body as buffer to handle binary/large data properly
            const arrayBuffer = await response.arrayBuffer();
            const responseBody = Buffer.from(arrayBuffer).toString('base64');

            // Convert Headers to plain object
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });

            const responseMessage = {
              type: 'response',
              id: msg.id,
              status: response.status,
              headers: responseHeaders,
              body: responseBody,
              encoding: 'base64'
            };

            const responseMessageStr = JSON.stringify(responseMessage);

            // Send response - add error handling for large messages
            try {
              ws!.send(responseMessageStr);
              console.log(`${msg.method} ${msg.path} → ${response.status} (${Math.round(arrayBuffer.byteLength / 1024)}KB)`);
            } catch (sendError) {
              console.error(`Failed to send response: ${(sendError as Error).message}`);
              console.error(`Response size: ${Math.round(arrayBuffer.byteLength / 1024)}KB, JSON size: ${Math.round(responseMessageStr.length / 1024)}KB`);
            }
          } catch (error) {
            const err = error as Error;
            console.error(`Error forwarding request: ${err.message}`);

            ws!.send(JSON.stringify({
              type: 'response',
              id: msg.id,
              status: 502,
              headers: { 'content-type': 'text/plain' },
              body: Buffer.from(`Bad Gateway: ${err.message}`).toString('base64'),
              encoding: 'base64'
            }));
          }
        }
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => {
      isConnected = false;
      console.log('✗ Disconnected from server');
      console.log('Reconnecting in 5 seconds...');
      reconnectTimeout = setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  }

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (ws) {
      ws.close();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (ws) {
      ws.close();
    }
    process.exit(0);
  });

  connect();
}
