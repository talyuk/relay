# Contributing to Relay

Thanks for your interest in contributing! 

## Development Setup

```bash
# Clone the repo
git clone https://github.com/talyuk/relay
cd relay

# Install dependencies
npm install

# Run in dev mode
npm run dev:server  # Start server
npm run dev:client  # Start client (in another terminal)
```

## Project Structure

```
relay/
├── src/
│   ├── cli.ts          # CLI entry point
│   ├── server.ts       # Server implementation
│   └── client.ts       # Client implementation
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Making Changes

1. Fork the repo on GitHub
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally (see Testing section below)
5. Build: `npm run build`
6. Commit with clear, descriptive messages
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request on GitHub

## Testing

```bash
# Terminal 1: Start server
export HOSTNAME=localhost
export SECRET=test123
npm run dev:server

# Terminal 2: Start a test app
python3 -m http.server 3000

# Terminal 3: Start client
export SERVER=ws://localhost:8080/relay
export SECRET=test123
npm run dev 3000

# Test it
curl -H "Host: mytest.localhost" http://localhost:8080
```

## Code Style

- Use TypeScript
- Follow existing code patterns
- Keep functions small and focused
- Add comments for complex logic

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Ensure code builds successfully: `npm run build`
- Test your changes locally before submitting

## Questions?

Open an issue for questions or discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
