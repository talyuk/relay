# 🔄 Relay

Dead-simple tunneling with random 3-word subdomains. Self-hosted alternative to ngrok.

```bash
relay 3000
# 🔄 Relay active!
#    https://quiet-snow-lamp.tunnel.example.com
#    → http://localhost:3000
```

## Features

- 🎲 **Random 3-word subdomains** - `agent-urge-dare.tunnel.example.com`
- 🚀 **Dead simple** - `relay 3000` and done
- 🔐 **Secret-based auth** - No complex OAuth flows
- 🐳 **Docker native** - Add to your compose file
- 🔄 **Auto-reconnect** - Handles network issues gracefully
- 🆓 **Self-hosted** - Your infrastructure, your control
- 📦 **Single binary** - Server and client in one package
- 🪶 **Lightweight** - Only 1 dependency (`ws`), uses native Node.js APIs

## Installation

### NPM (Global CLI)

```bash
npm install -g @talyuk/relay

# Quick start with flags
relay 3000 --server tunnel.example.com --secret your-secret

# Or with env vars
export SERVER=tunnel.example.com
export SECRET=your-secret
relay 3000

# Custom subdomain (persistent URL)
relay 3000 --subdomain myapp
# → https://myapp.tunnel.example.com (always the same!)
```

### Docker

```bash
docker run -e SERVER=tunnel.example.com \
           -e SECRET=your-secret \
           talyuk/relay 3000
```

### Docker Compose (Recommended for developers)

Add to your `docker-compose.dev.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"

  relay:
    image: talyuk/relay
    command: app:3000
    environment:
      SERVER: tunnel.example.com
      SECRET: ${SECRET}
    depends_on:
      - app
```

Then create `.env`:
```bash
SECRET=your-team-secret
```

Run:
```bash
docker compose -f docker-compose.dev.yml up
```

## Usage

### Client (Expose your local app)

```bash
# Expose localhost port (random subdomain)
relay 3000

# With server and secret as flags
relay 3000 --server tunnel.example.com --secret your-secret

# Custom subdomain (persistent URL)
relay 3000 --subdomain myapp
# → https://myapp.tunnel.example.com (stays the same every time)

# Expose service at host:port
relay app:8080 --subdomain myapi

# Short flags
relay 3000 -n myapp

# Or use environment variables
export SERVER=tunnel.example.com
export SECRET=your-secret
export SUBDOMAIN=myapp
relay 3000
```

### Server (Run on your infrastructure)

```bash
# Set up env vars
export HOSTNAME=tunnel.example.com
export SECRET=$(openssl rand -base64 32)

# Run server
relay server

# Or with Docker Compose
docker compose -f docker-compose.server.yml up -d
```

## Quick Start: Server Setup

### 1. Prerequisites

- A server with Docker installed
- Domain with wildcard DNS: `*.tunnel.example.com` → your server IP

### 2. DNS Configuration

Point both your domain and wildcard to your server:

```
A     tunnel.example.com      → 203.0.113.10
A     *.tunnel.example.com    → 203.0.113.10
```

### 3. Create `.env`:

```bash
HOSTNAME=tunnel.example.com
SECRET=$(openssl rand -base64 32)
```

### 4. Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  relay:
    image: talyuk/relay
    command: server
    ports:
      - "8080:8080"
    environment:
      HOSTNAME: ${HOSTNAME}
      SECRET: ${SECRET}
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    restart: unless-stopped

volumes:
  caddy_data:
```

### 5. Create `Caddyfile`:

```
tunnel.example.com, *.tunnel.example.com {
    reverse_proxy relay:8080
}
```

### 6. Start:

```bash
docker compose up -d
```

✅ Done! Share the `SECRET` with your team.

## Quick Start: Client Setup

### As Developer

1. Get `SECRET` from your team admin
2. Add to `.env`:
   ```bash
   SERVER=tunnel.example.com
   SECRET=your-team-secret
   ```
3. Add to your project's `docker-compose.dev.yml`:
   ```yaml
   services:
     app:
       build: .
       ports:
         - "3000:3000"
     
     relay:
       image: talyuk/relay
       command: app:3000
       environment:
         SERVER: ${SERVER}
         SECRET: ${SECRET}
       depends_on:
         - app
   ```
4. Run: `docker compose -f docker-compose.dev.yml up`

## Environment Variables & CLI Flags

### Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOSTNAME` | Yes | - | Your domain (e.g., `tunnel.example.com`) |
| `SECRET` | Yes | - | Authentication secret |
| `PORT` | No | `8080` | Server port |

### Client

| Variable / Flag | Required | Default | Description |
|----------------|----------|---------|-------------|
| `SERVER` / `--server` | Yes | - | Server hostname |
| `SECRET` / `--secret` | Yes | - | Authentication secret |
| `SUBDOMAIN` / `--subdomain`, `-n` | No | random | Custom subdomain (3-63 chars, alphanumeric + hyphens) |

Target can be passed as CLI argument or `TARGET` env var.

**CLI Examples:**
```bash
# With flags
relay 3000 --server tunnel.example.com --secret xxx --subdomain myapp

# With env vars
export SERVER=tunnel.example.com
export SECRET=xxx
export SUBDOMAIN=myapp
relay 3000

# Mix and match
export SERVER=tunnel.example.com
relay 3000 --secret xxx --subdomain myapp
```

## Use Cases

### 🔗 Persistent URLs with Custom Subdomains

Keep the same URL across restarts - perfect for webhooks and mobile apps.

```bash
# Random subdomain (changes each time)
relay 3000
# → https://quiet-snow-lamp.tunnel.example.com

# Custom subdomain (stays the same)
relay 3000 --subdomain myapp
# → https://myapp.tunnel.example.com (persistent!)

# Perfect for:
# - Webhook URLs that need to stay constant
# - Mobile app configs
# - Documentation/demos
# - Sharing with team over days/weeks
```

### 🪝 Webhook Testing

Perfect for testing webhooks from services like Stripe, GitHub, Twilio, etc.

```bash
# Start your local webhook handler
npm start  # Running on localhost:3000

# Expose it
relay 3000

# Use the URL in webhook configs
# https://quiet-snow-lamp.tunnel.example.com/webhook
```

### 📱 Mobile App Development

Test your mobile app against your local API without deploying.

```bash
# Expose your local API
relay 8080

# Use relay URL in mobile app config
# API_URL=https://bold-wave-tree.tunnel.example.com
```

### 🤝 Share Dev Environment

Share your local development environment with designers, PMs, or clients.

```bash
# Expose your local frontend
relay 5173

# Share with stakeholders
# https://calm-fire-drop.tunnel.example.com
```

### 🧪 CI/CD Integration Testing

Test integration flows in your CI pipeline.

```yaml
# GitHub Actions
- name: Expose service
  run: |
    docker run -d -e SERVER=${{ secrets.RELAY_SERVER }} \
                -e SECRET=${{ secrets.RELAY_SECRET }} \
                talyuk/relay app:3000
```

## Architecture

```
Developer Machine          Your Server (tunnel.example.com)
┌──────────────┐          ┌────────────────────────────┐
│ App :3000    │          │ Caddy (HTTPS, port 80/443) │
│      ↕       │          │           ↓                 │
│ Relay Client ├──WebSocket─→ Relay Server :8080       │
└──────────────┘          └────────────────────────────┘
                                        ↓
                          Public: https://xxx-yyy-zzz.tunnel.example.com
```

1. Client connects to server via WebSocket with authentication
2. Server generates random 3-word subdomain
3. Server proxies HTTP requests through WebSocket to client
4. Client forwards to local service and returns response

## Comparison with Alternatives

| Feature | Relay | ngrok | bore | sish |
|---------|-------|-------|------|------|
| Self-hosted | ✅ | ❌ | ✅ | ✅ |
| Random subdomains | ✅ | ✅ | ❌ (ports) | ✅ |
| Custom subdomains | ✅ | ✅ (paid) | ❌ | ✅ |
| Memorable URLs | ✅ | ⚠️ | ❌ | ⚠️ |
| Single binary | ✅ | ✅ | ✅ | ❌ |
| Docker native | ✅ | ⚠️ | ⚠️ | ❌ |
| Setup complexity | Low | N/A | Low | Medium |
| Open source | ✅ | ❌ | ✅ | ✅ |

## Security

- 🔐 Keep `SECRET` confidential - treat it like a password
- 🔒 Use HTTPS in production (Caddy handles this automatically)
- 👥 Only share SECRET with trusted team members
- 🔄 Rotate secrets periodically
- 🛡️ Consider IP whitelisting at infrastructure level
- 🔍 Monitor active relays for abuse
- ⚠️ Don't expose sensitive services without additional auth

## Troubleshooting

### "Relay not found"
- Client not connected - check client logs
- Verify SECRET matches server configuration
- Ensure client is still running

### "Invalid secret"
- Check for typos/whitespace in SECRET
- Verify you're connecting to correct server
- Make sure SECRET wasn't changed on server

### "Subdomain already in use"
- Someone else is using that custom subdomain
- Choose a different name: `--subdomain myapp2`
- Or omit `--subdomain` flag to get random subdomain
- Custom subdomains are first-come-first-served

### "Invalid subdomain format"
- Use only lowercase letters, numbers, and hyphens
- Must be 3-63 characters
- Cannot start or end with hyphen
- Examples: `myapp`, `api-dev`, `staging-2024`

### "Connection refused" to local service
- Ensure your app is running on the specified port
- In Docker, use service name (`app:3000`) not `localhost`
- For host machine services, use `host.docker.internal:3000`

### Connection keeps dropping
- Check network stability between client and server
- Client auto-reconnects every 5 seconds
- Review client and server logs for errors
- Verify firewall isn't blocking WebSocket connections

### "Gateway timeout"
- Your local service is taking too long to respond
- Check if local service is healthy
- Default timeout is 30 seconds

## Development

```bash
# Clone repo
git clone https://github.com/talyuk/relay
cd relay

# Install dependencies
npm install

# Run server (dev mode)
export HOSTNAME=localhost
export SECRET=test123
npm run dev:server

# In another terminal: Run client (dev mode)
export SERVER=localhost:8080
export SECRET=test123
npm run dev 3000

# Build
npm run build

# Build Docker image
docker build -t talyuk/relay .
```

## Advanced Configuration

### Multiple Secrets

You can configure multiple secrets for different teams:

```bash
# Server .env
ALLOWED_SECRETS=team-a-secret,team-b-secret,team-c-secret
```

### Custom Port

```bash
# Server .env
PORT=9000
```

### Using with Existing Reverse Proxy

If you're using nginx or another reverse proxy instead of Caddy:

```nginx
# nginx config
server {
    listen 80;
    server_name tunnel.example.com *.tunnel.example.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

MIT License - see [LICENSE](LICENSE) for details

## Author

Created by [talyuk](https://github.com/talyuk)

## Credits

Inspired by ngrok, bore, and sish. Built to be simpler and easier to self-host.
