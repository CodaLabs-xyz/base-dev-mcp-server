# Base Developer MCP Server - Claude Code Reference

This is a comprehensive Model Context Protocol (MCP) server for Base blockchain development. This document provides essential information for Claude Code instances working with this codebase.

## High-Level Architecture

This is a TypeScript-based MCP server that provides 17 specialized tools for Base blockchain development, including real-time documentation scraping, smart contract generation, ecosystem information, and deployment guides.

### Core Components

- **MCP Server**: Built using `@modelcontextprotocol/sdk` v0.4.0
- **Documentation Scraper**: Real-time Base docs scraping with cheerio
- **Smart Contract Templates**: Base-optimized contract generators
- **Ecosystem Data**: Comprehensive Base project and protocol information
- **Bridge Information**: Cross-chain and Layer 2 bridge details

### Key Dependencies

- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `axios`: HTTP client for documentation scraping
- `cheerio`: Server-side HTML parsing and manipulation
- `zod`: Runtime type validation and schema definition
- `typescript`: Type safety and compilation

## Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the MCP server
npm start

# Development mode with hot reload
npm run dev

# Run tests
npm run test
```

### Project Structure
```
src/
├── index.ts              # Main MCP server implementation (2,330+ lines)
├── knowledge/            # Static knowledge base files (if present)
dist/                     # Compiled JavaScript output
package.json              # Dependencies and scripts
tsconfig.json            # TypeScript configuration
README.md                # Comprehensive documentation
LICENSE                   # MIT License
```

## Key Tool Categories

### 1. Documentation Tools
- `scrape_base_docs`: Real-time Base documentation scraping
- `search_base_docs`: Intelligent search across Base docs

### 2. Smart Contract Tools
- `generate_base_contract`: Base-optimized contract templates
- `get_base_contracts`: Contract addresses and ABIs

### 3. Network & Infrastructure
- `get_base_rpc_info`: RPC endpoints and network configuration
- `get_base_deployment_guide`: Deployment guides for various tools

### 4. OnchainKit Integration
- `get_onchainkit_components`: Component examples and guides

### 5. Ecosystem Information
- `get_base_ecosystem`: DeFi, NFT, gaming projects on Base
- `get_base_bridge_info`: Bridge and cross-chain information

### 6. Development Templates
- `generate_project_template`: Full project boilerplate generation

## Common Development Tasks

### Adding New Tools

1. **Define Schema** in `src/index.ts`:
```typescript
const NewToolSchema = z.object({
  parameter: z.string(),
  optionalParam: z.boolean().default(false),
});
```

2. **Add to Tool List** in the `ListToolsRequestSchema` handler:
```typescript
{
  name: "new_tool",
  description: "Description of what the tool does",
  inputSchema: NewToolSchema,
}
```

3. **Implement Handler** in the `CallToolRequestSchema` handler:
```typescript
case "new_tool":
  const args = NewToolSchema.parse(request.params.arguments);
  // Implementation logic
  return { content: [...] };
```

### Key Implementation Patterns

#### Tool Response Format
```typescript
return {
  content: [
    {
      type: "text",
      text: "Response content here"
    }
  ]
};
```

#### Error Handling
```typescript
try {
  // Tool logic
} catch (error) {
  throw new McpError(
    ErrorCode.InternalError,
    `Error message: ${error instanceof Error ? error.message : String(error)}`
  );
}
```

#### Caching Pattern
```typescript
// Check cache first
if (this.documentationCache.has(cacheKey)) {
  return this.documentationCache.get(cacheKey);
}

// Fetch and cache result
const result = await fetchData();
this.documentationCache.set(cacheKey, result);
return result;
```

## Testing and Validation

### Manual Testing
```bash
# Build and start server
npm run build
npm start

# Test with MCP inspector (if available)
npx @modelcontextprotocol/inspector
```

### Integration Testing
The server integrates with Claude Code via MCP protocol. Test by:
1. Building the server: `npm run build`
2. Installing with Claude Code: `claude mcp add base-dev-mcp-server node $(pwd)/dist/index.js`
3. Verifying: `claude mcp list`

## Configuration and Setup

### Environment Variables
- `NODE_ENV`: development/production
- `LOG_LEVEL`: debug/info/warn/error

### TypeScript Configuration
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Source maps and declarations generated

### Key Features
- **Real-time documentation scraping** with intelligent caching
- **Base-optimized smart contract templates** (ERC20, ERC721, DAO, Multisig)
- **Comprehensive ecosystem mapping** (DeFi, NFT, Gaming, Infrastructure)
- **Multiple deployment tool support** (Hardhat, Foundry, Remix, Thirdweb)
- **Cross-chain bridge information** with gas optimization strategies

## Debugging Tips

1. **Check server logs**: The server outputs detailed logs for debugging
2. **Verify tool schemas**: Zod validation will show schema errors
3. **Test individual tools**: Use MCP inspector to test specific tools
4. **Network issues**: Check if Base documentation URLs are accessible
5. **Cache issues**: Clear `documentationCache` Map if needed

## Important Notes

- The server maintains a documentation cache for performance
- All tools use Zod schemas for input validation
- The codebase follows strict TypeScript patterns
- Error handling uses MCP-specific error codes
- Real-time documentation scraping may fail if Base docs are unavailable

## Repository Information

- **GitHub**: https://github.com/CodaLabs-xyz/base-dev-mcp-server
- **License**: MIT License (2025)
- **Version**: 2.0.0
- **Last Updated**: July 27, 2025

This MCP server provides comprehensive Base blockchain development assistance through its 17 specialized tools and extensive knowledge base.