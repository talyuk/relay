# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-11-08

### Added
- WebSocket heartbeat mechanism - client now sends ping frames every 30 seconds to keep connections alive and prevent drops by network intermediaries

## [1.0.3] - 2025-11-06

### Added
- Subdomain persistence during automatic reconnections - random subdomains are now retained across reconnections within the same session

## [1.0.2] - 2025-11-06

### Fixed
- Response transmission reliability for large payloads

## [1.0.1] - 2025-11-06

### Fixed
- Binary data handling in request/response payloads

## [1.0.0] - 2025-11-05

### Added
- Initial public release
- Server command to run tunnel server
- Client mode to expose local services
- Random 3-word subdomain generation (e.g., quiet-snow-lamp)
- Custom subdomain support via `--subdomain` flag
- CLI flags for server, secret, and subdomain configuration
- WebSocket-based tunneling
- Secret-based authentication
- Auto-reconnect on connection loss
- Native Node.js APIs (http, fetch) - only 1 dependency
- Docker support with multi-platform images
- Comprehensive documentation and examples
