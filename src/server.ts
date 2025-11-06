import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomBytes } from 'crypto';

const WORDLIST = [
  'able', 'acid', 'aged', 'also', 'area', 'army', 'away', 'baby', 'back', 'ball',
  'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been', 'beer', 'bell', 'belt',
  'best', 'bill', 'bird', 'blow', 'blue', 'boat', 'body', 'bone', 'book', 'born',
  'boss', 'both', 'bowl', 'bulk', 'burn', 'bush', 'busy', 'call', 'calm', 'came',
  'camp', 'card', 'care', 'case', 'cash', 'cast', 'cell', 'chat', 'chip', 'city',
  'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool', 'cope', 'copy',
  'core', 'cost', 'crew', 'crop', 'dark', 'data', 'date', 'dawn', 'days', 'dead',
  'deal', 'dean', 'dear', 'debt', 'deep', 'deny', 'desk', 'dial', 'diet', 'disc',
  'disk', 'does', 'done', 'door', 'dose', 'down', 'draw', 'drew', 'drop', 'drug',
  'dual', 'duke', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy', 'edge',
  'else', 'even', 'ever', 'evil', 'exit', 'face', 'fact', 'fail', 'fair', 'fall',
  'farm', 'fast', 'fate', 'fear', 'feed', 'feel', 'feet', 'fell', 'felt', 'file',
  'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'five', 'flat', 'flow',
  'food', 'foot', 'ford', 'form', 'fort', 'four', 'free', 'from', 'fuel', 'full',
  'fund', 'gain', 'game', 'gate', 'gave', 'gear', 'gene', 'gift', 'girl', 'give',
  'glad', 'goal', 'goes', 'gold', 'golf', 'gone', 'good', 'gray', 'grew', 'grey',
  'grow', 'gulf', 'hair', 'half', 'hall', 'hand', 'hang', 'hard', 'harm', 'hate',
  'have', 'head', 'hear', 'heat', 'held', 'hell', 'help', 'here', 'hero', 'high',
  'hill', 'hire', 'hold', 'hole', 'holy', 'home', 'hope', 'host', 'hour', 'huge',
  'hung', 'hunt', 'hurt', 'idea', 'inch', 'into', 'iron', 'item', 'jack', 'jane',
  'jean', 'john', 'join', 'jump', 'jury', 'just', 'keen', 'keep', 'kent', 'kept',
  'kick', 'kill', 'kind', 'king', 'knee', 'knew', 'know', 'lack', 'lady', 'laid',
  'lake', 'land', 'lane', 'last', 'late', 'lead', 'left', 'less', 'life', 'lift',
  'like', 'line', 'link', 'list', 'live', 'load', 'loan', 'lock', 'long', 'look',
  'lord', 'lose', 'loss', 'lost', 'love', 'luck', 'made', 'mail', 'main',
  'make', 'male', 'mall', 'many', 'mark', 'mass', 'matt', 'meal', 'mean', 'meat',
  'meet', 'menu', 'mere', 'mike', 'mile', 'milk', 'mill', 'mind', 'mine', 'miss',
  'mode', 'mood', 'moon', 'more', 'most', 'move', 'much', 'must', 'name', 'navy',
  'near', 'neck', 'need', 'news', 'next', 'nice', 'nick', 'nine', 'none', 'noon',
  'norm', 'nose', 'note', 'okay', 'once', 'only', 'onto', 'open', 'oral', 'over',
  'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'palm', 'park', 'part', 'pass',
  'past', 'path', 'peak', 'pick', 'pink', 'pipe', 'plan', 'play', 'plot', 'plug',
  'plus', 'poll', 'pool', 'poor', 'port', 'post', 'pull', 'pure', 'push', 'quit',
  'race', 'rail', 'rain', 'rank', 'rare', 'rate', 'read', 'real', 'rear', 'rely',
  'rent', 'rest', 'rice', 'rich', 'ride', 'ring', 'rise', 'risk', 'road', 'rock',
  'role', 'roll', 'roof', 'room', 'root', 'rose', 'rule', 'rush', 'ruth', 'safe',
  'said', 'sake', 'sale', 'salt', 'same', 'sand', 'save', 'seat', 'seed', 'seek',
  'seem', 'seen', 'self', 'sell', 'send', 'sent', 'sept', 'ship', 'shop', 'shot',
  'show', 'shut', 'sick', 'side', 'sign', 'sing', 'site', 'size', 'skin', 'slip',
  'slow', 'snow', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'sort',
  'soul', 'spot', 'star', 'stay', 'step', 'stop', 'such', 'suit', 'sure', 'take',
  'tale', 'talk', 'tall', 'tank', 'tape', 'task', 'team', 'tech', 'tell', 'tend',
  'term', 'test', 'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this',
  'thus', 'tide', 'tied', 'tier', 'tile', 'till', 'time', 'tiny', 'told', 'toll',
  'tone', 'tony', 'took', 'tool', 'tops', 'torn', 'tour', 'town', 'tree', 'trip',
  'true', 'tune', 'turn', 'twin', 'type', 'unit', 'upon', 'used', 'user', 'vary',
  'vast', 'very', 'vice', 'view', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall',
  'want', 'ward', 'warm', 'warn', 'wash', 'wave', 'ways', 'weak', 'wear', 'week',
  'well', 'went', 'were', 'west', 'what', 'when', 'wide', 'wife', 'wild', 'will',
  'wind', 'wine', 'wing', 'wire', 'wise', 'wish', 'with', 'wood', 'word', 'wore',
  'work', 'worn', 'wrap', 'yard', 'yeah', 'year', 'your', 'zero', 'zone'
];

interface PendingRequest {
  res: ServerResponse;
  timeout: NodeJS.Timeout;
}

interface TunnelConnection {
  ws: WebSocket;
  subdomain: string;
  connectedAt: Date;
}

function generateSubdomain(): string {
  const words: string[] = [];
  for (let i = 0; i < 3; i++) {
    words.push(WORDLIST[Math.floor(Math.random() * WORDLIST.length)]);
  }
  return words.join('-');
}

function generateRequestId(): string {
  return randomBytes(16).toString('hex');
}

export function startServer() {
  const ALLOWED_SECRETS = new Set(
    (process.env.SECRET || process.env.ALLOWED_SECRETS || '').split(',').filter(Boolean)
  );
  const HOSTNAME = process.env.HOSTNAME;
  const PORT = parseInt(process.env.PORT || '8080', 10);
  const REQUEST_TIMEOUT = 30000;

  if (!HOSTNAME || !HOSTNAME.includes('.')) {
    console.error('❌ ERROR: HOSTNAME must be a valid domain');
    console.error('   Example: HOSTNAME=tunnel.example.com');
    console.error('   Current value:', HOSTNAME || '(not set)');
    process.exit(1);
  }

  if (ALLOWED_SECRETS.size === 0) {
    console.error('❌ ERROR: SECRET environment variable required');
    console.error('   Example: SECRET=your-random-secret');
    process.exit(1);
  }

  const app = createServer();
  const wss = new WebSocketServer({ server: app, path: '/relay' });

  const tunnels = new Map<string, TunnelConnection>();
  const pendingRequests = new Map<string, PendingRequest>();

  wss.on('connection', (ws) => {
    let connection: TunnelConnection | null = null;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'auth') {
          if (!ALLOWED_SECRETS.has(msg.secret)) {
            console.log('❌ Invalid secret attempt');
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid secret' }));
            ws.close();
            return;
          }

          let subdomain: string;

          // Check if client requested a custom subdomain
          if (msg.subdomain) {
            const requested = msg.subdomain.toLowerCase().trim();

            // Validate subdomain format (alphanumeric + hyphens, 3-63 chars)
            if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(requested)) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens (3-63 chars)'
              }));
              ws.close();
              return;
            }

            // Check if subdomain is available
            if (tunnels.has(requested)) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `Subdomain '${requested}' is already in use. Choose a different name or omit --subdomain for random.`
              }));
              ws.close();
              return;
            }

            subdomain = requested;
            console.log(`✓ Custom subdomain requested: ${subdomain}`);
          } else {
            // Generate random subdomain
            let attempts = 0;
            do {
              subdomain = generateSubdomain();
              attempts++;
            } while (tunnels.has(subdomain) && attempts < 10);

            if (tunnels.has(subdomain)) {
              ws.send(JSON.stringify({ type: 'error', message: 'Failed to generate unique subdomain' }));
              ws.close();
              return;
            }
          }

          connection = { ws, subdomain, connectedAt: new Date() };
          tunnels.set(subdomain, connection);

          const url = `https://${subdomain}.${HOSTNAME}`;
          console.log(`✓ Relay established: ${url}`);

          ws.send(JSON.stringify({ type: 'ready', subdomain, url }));
        }

        if (msg.type === 'response') {
          const pending = pendingRequests.get(msg.id);
          if (pending) {
            clearTimeout(pending.timeout);
            pendingRequests.delete(msg.id);

            // Decode body first if present
            let body: Buffer | undefined;
            if (msg.body !== undefined && msg.body !== null) {
              body = msg.encoding === 'base64'
                ? Buffer.from(msg.body, 'base64')
                : Buffer.from(typeof msg.body === 'string' ? msg.body : JSON.stringify(msg.body));
            }

            // Set headers before writeHead
            if (msg.headers) {
              Object.entries(msg.headers).forEach(([key, value]) => {
                // Skip content-encoding and transfer-encoding since we're sending uncompressed data
                // Also skip content-length as we'll set it based on actual body size
                const lowerKey = key.toLowerCase();
                if (lowerKey !== 'content-encoding' && 
                    lowerKey !== 'transfer-encoding' && 
                    lowerKey !== 'content-length') {
                  pending.res.setHeader(key, value as string);
                }
              });
            }

            // Set correct content-length if we have a body
            if (body) {
              pending.res.setHeader('content-length', body.length);
            }

            pending.res.writeHead(msg.status || 200);

            // Send body
            if (body) {
              pending.res.end(body);
            } else {
              pending.res.end();
            }
          }
        }
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => {
      if (connection) {
        tunnels.delete(connection.subdomain);
        console.log(`✗ Relay closed: ${connection.subdomain}.${HOSTNAME}`);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  });

  app.on('request', (req: IncomingMessage, res: ServerResponse) => {
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];

    // Health check
    if (subdomain === HOSTNAME.split('.')[0] || host === HOSTNAME) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        activeRelays: tunnels.size,
        hostname: HOSTNAME
      }));
      return;
    }

    const connection = tunnels.get(subdomain);

    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Relay not found or disconnected');
      return;
    }

    const requestId = generateRequestId();
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end('Gateway timeout');
      }
    }, REQUEST_TIMEOUT);

    pendingRequests.set(requestId, { res, timeout });

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined;

      connection.ws.send(JSON.stringify({
        type: 'request',
        id: requestId,
        method: req.method,
        path: req.url,
        headers: req.headers,
        body
      }));
    });
  });

  app.listen(PORT, () => {
    console.log(`🔄 Relay server running`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Hostname: ${HOSTNAME}`);
    console.log(`   Secrets: ${ALLOWED_SECRETS.size} configured`);
    console.log();
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    app.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    app.close();
    process.exit(0);
  });
}
