#!/usr/bin/env node

import { startServer } from './server';
import { startClient } from './client';

const args = process.argv.slice(2);

// Parse arguments
function parseArgs(args: string[]) {
  const parsed: any = { positional: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if (arg === '--server') {
      parsed.server = args[++i];
    } else if (arg === '--secret') {
      parsed.secret = args[++i];
    } else if (arg === '--subdomain' || arg === '--name' || arg === '-n') {
      parsed.subdomain = args[++i];
    } else if (!arg.startsWith('-')) {
      parsed.positional.push(arg);
    }
  }
  
  return parsed;
}

function printHelp() {
  console.log(`
🔄 relay - Dead-simple tunneling with random 3-word subdomains

USAGE:
  relay server                           Start tunnel server
  relay <port> [options]                 Expose local port
  relay <host:port> [options]            Expose service at host:port

EXAMPLES:
  relay server                           Start server
  relay 3000                             Expose localhost:3000 (random subdomain)
  relay 3000 --subdomain myapp           Expose with custom subdomain
  relay 3000 --server tunnel.example.com --secret xxx
  relay app:8080 -n myapp                Short flags

CLIENT OPTIONS:
  --server <host>                        Server hostname (or SERVER env var)
  --secret <secret>                      Authentication secret (or SECRET env var)
  --subdomain, -n <name>                 Custom subdomain (or SUBDOMAIN env var)
                                         If not set, random 3-word subdomain is used

SERVER ENV VARS:
  HOSTNAME                               Your domain (e.g., tunnel.example.com) [required]
  SECRET                                 Authentication secret [required]
  PORT                                   Server port (default: 8080)

CLIENT ENV VARS:
  SERVER                                 Server hostname (override with --server)
  SECRET                                 Authentication secret (override with --secret)
  SUBDOMAIN                              Custom subdomain (override with --subdomain)
  TARGET                                 Target to expose (override with CLI arg)

GLOBAL OPTIONS:
  --help, -h                             Show this help
  --version, -v                          Show version

DOCS: https://github.com/talyuk/relay
  `);
}

const parsed = parseArgs(args);

if (parsed.help) {
  printHelp();
  process.exit(0);
}

if (parsed.version) {
  const pkg = require('../package.json');
  console.log(pkg.version);
  process.exit(0);
}

const command = parsed.positional[0];

if (command === 'server') {
  startServer();
} else if (command) {
  // Client mode - pass target and options
  startClient({
    target: command,
    server: parsed.server,
    secret: parsed.secret,
    subdomain: parsed.subdomain
  });
} else {
  printHelp();
  process.exit(1);
}
