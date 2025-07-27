# Base Developer MCP Server

A comprehensive Model Context Protocol (MCP) server providing extensive Base blockchain development tools, documentation, and resources. This server enables AI assistants and development tools to access detailed information about Base ecosystem, smart contracts, deployment guides, OnchainKit integration, Smart Wallets, MiniKit, and much more.

## 🌟 Enhanced Features

### 📚 **Real-time Documentation & Search**
- **Live documentation scraping** from docs.base.org with intelligent caching
- **Smart search capabilities** across Base documentation with relevance scoring
- **Section-specific filtering** and deep content extraction
- **Cached results** for improved performance and reduced API calls

### 🔗 **Complete Base Chain Integration**
- **Contract addresses** for core protocols, DeFi, NFTs (mainnet & testnet)
- **Multiple RPC endpoints** with WebSocket support and archive nodes
- **Network configuration** with real-time gas prices and block information
- **Explorer links** and transaction monitoring tools

### 🧰 **Advanced Development Tools**
- **Smart contract generators** with Base-optimized templates (ERC20, ERC721, Multisig, DAO)
- **Deployment guides** for Hardhat, Foundry, Remix, Thirdweb with verification
- **Gas optimization strategies** and Base-specific best practices
- **Project templates** and boilerplate code generation

### 🎨 **OnchainKit Deep Integration**
- **Component examples** with production-ready code snippets
- **Wallet, Identity, Transaction, Swap, Frame** component guides
- **Installation instructions** and dependency management
- **API documentation** and usage patterns

### 🌐 **Comprehensive Ecosystem Mapping**
- **DeFi protocols** with TVL data, contract addresses, and integration guides
- **NFT marketplaces** and popular collections on Base
- **Gaming and social platforms** built on Base
- **Infrastructure tools** including oracles, indexers, and RPC providers

### 🌉 **Bridge & Cross-chain Solutions**
- **Official Base Bridge** detailed information and usage patterns
- **Third-party bridges** comparison (LayerZero, Stargate, Hop, Across)
- **Transfer time analysis**, fee structures, and security models
- **Gas optimization** strategies for cross-chain operations

## 🛠️ Available Tools (17 Total)

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `get_base_overview` | Comprehensive overview of Base Smart Wallet, MiniKit, and Wallet App | `section` |
| `get_smart_wallet_quickstart` | Framework-specific Smart Wallet quickstart guides | `framework` |
| `get_smart_wallet_concepts` | Detailed Smart Wallet concepts and features documentation | `concept` |
| `get_smart_wallet_guides` | Implementation guides for Smart Wallet features | `guide` |
| `get_minikit_guides` | MiniKit development guides and integration instructions | `guide` |
| `generate_project_template` | Generate Base application project templates | `projectType`, `projectName` |
| `get_network_config` | Base network configuration for mainnet and testnet | - |
| `get_development_tools` | Recommended development tools and resources | - |
| `scrape_base_docs` | **NEW** - Scrape Base documentation with smart caching | `url`, `section`, `depth` |
| `search_base_docs` | **NEW** - Search Base documentation with relevance scoring | `query`, `section`, `limit` |
| `get_base_contracts` | **NEW** - Contract addresses and ABIs for core protocols | `network`, `contractType` |
| `get_base_rpc_info` | **NEW** - RPC endpoints, WebSocket URLs, and network config | `network`, `includeArchive` |
| `get_onchainkit_components` | **NEW** - OnchainKit component examples and guides | `component`, `includeCode` |
| `get_base_ecosystem` | **NEW** - Base ecosystem projects and protocols by category | `category`, `includeTestnet` |
| `generate_base_contract` | **NEW** - Generate Base-optimized smart contract templates | `contractType`, `name`, `features` |
| `get_base_deployment_guide` | **NEW** - Deployment guides for various tools | `tool`, `network`, `verification` |
| `get_base_bridge_info` | **NEW** - Bridge information and cross-chain options | `bridgeType`, `includeGas` |

## Knowledge Base Coverage

### Core Documentation
- **Base OnchainKit** - React components, utilities, API reference, and types
- **Base Account** - Smart wallet implementation and integration
- **Base App** - Mini Apps development and deployment
- **Base Chain** - Network information, tools, and infrastructure
- **Base Cookbook** - Practical implementation recipes
- **Quickstart Guides** - Getting started across all Base products

### Key Topics Covered
- User onboarding and wallet integration
- Crypto payment acceptance and processing
- AI agent development and deployment
- Token launches and distribution
- Appchain deployment for dedicated infrastructure
- Social application development with user-owned identity
- DeFi integration with yield and trading features
- Gasless transactions with account abstraction
- Cross-chain interoperability and bridging
- Node operations and infrastructure management

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

1. Clone and install dependencies:
```bash
git clone https://github.com/CodaLabs-xyz/base-dev-mcp-server.git
cd base-dev-mcp-server
npm install
```

2. Build the server:
```bash
npm run build
```

3. Test the server:
```bash
npm start
```

## Integration with AI Coding Assistants

### Adding to Cursor IDE

1. **Clone and Build the Server:**
```bash
git clone https://github.com/CodaLabs-xyz/base-dev-mcp-server.git
cd base-dev-mcp-server
npm install
npm run build
```

2. **Open Cursor Settings:**
   - Press `Cmd/Ctrl + ,` to open settings
   - Navigate to "Extensions" → "Model Context Protocol"
   - Or search for "MCP" in settings

3. **Add MCP Server Configuration:**
   Add the following to your Cursor MCP settings (replace `/absolute/path/to/` with your actual path):

```json
{
  "mcpServers": {
    "base-dev-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/base-dev-mcp-server/dist/index.js"],
      "description": "Base Developer Server - Comprehensive Base ecosystem development assistance"
    }
  }
}
```

4. **Example with actual paths:**
```json
{
  "mcpServers": {
    "base-dev-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/Projects/base-dev-mcp-server/dist/index.js"],
      "description": "Base Developer Server - Comprehensive Base ecosystem development assistance"
    }
  }
}
```

### Adding to Claude Code (CLI)

1. **Clone and Build the Server:**
```bash
git clone https://github.com/CodaLabs-xyz/base-dev-mcp-server.git
cd base-dev-mcp-server
npm install
npm run build
```

2. **Install Claude Code CLI** (if not already installed):
```bash
npm install -g @anthropic/claude-code
```

3. **Configure MCP Server:**
   Create or edit your Claude Code configuration file at `~/.config/claude-code/config.json`:

```json
{
  "mcpServers": {
    "base-dev-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/base-dev-mcp-server/dist/index.js"],
      "description": "Base Developer Server - Complete Base ecosystem development assistant"
    }
  }
}
```

4. **Example with actual paths:**
```json
{
  "mcpServers": {
    "base-dev-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/Projects/base-dev-mcp-server/dist/index.js"],
      "description": "Base Developer Server - Complete Base ecosystem development assistant"
    }
  }
}
```

5. **Alternative: Using with project-specific setup:**
   Add to your project's `package.json`:
```json
{
  "scripts": {
    "mcp:base-dev": "node /absolute/path/to/base-dev-mcp-server/dist/index.js"
  }
}
```

Then configure Claude Code to use:
```json
{
  "mcpServers": {
    "base-dev-mcp-server": {
      "command": "npm",
      "args": ["run", "mcp:base-dev"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

### Adding to Other MCP-Compatible Tools

1. **Clone and build the server first:**
```bash
git clone https://github.com/CodaLabs-xyz/base-dev-mcp-server.git
cd base-dev-mcp-server
npm install
npm run build
```

2. **For any MCP-compatible AI coding assistant:**

```json
{
  "servers": {
    "base-dev-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/base-dev-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

## Usage Examples

Once integrated, you can ask your AI assistant questions like:

### OnchainKit Development
- "How do I integrate OnchainKit into my React app?"
- "Show me OnchainKit Swap component usage"
- "What are the available OnchainKit utility functions?"
- "Generate an OnchainKit transaction component example"

### Smart Wallet & Account Abstraction
- "How do I implement Smart Wallet in my Next.js app?"
- "Show me how to set up gasless transactions"
- "What are the benefits of account abstraction on Base?"
- "How do I configure a paymaster for sponsored transactions?"

### AI Agent Development
- "How do I build an AI agent that trades on Base?"
- "Show me how to create an autonomous DeFi agent"
- "What frameworks are available for Base AI agents?"
- "How do I deploy an AI agent on Base?"

### DeFi Integration
- "How do I add token swapping to my app?"
- "Show me how to implement yield farming features"
- "What DeFi protocols are available on Base?"
- "How do I integrate lending and borrowing?"

### Token & Project Launches
- "How do I launch a token on Base?"
- "What are the best platforms for token deployment?"
- "Show me how to create a memecoin"
- "How do I set up token liquidity?"

### Infrastructure & Node Operations
- "How do I run a Base node?"
- "What are the hardware requirements for Base nodes?"
- "Show me Base network configuration"
- "How do I troubleshoot node sync issues?"

### Cross-Chain & Bridging
- "How do I bridge tokens to Base?"
- "What cross-chain solutions work with Base?"
- "Show me how to implement cross-chain functionality"
- "How do I integrate LayerZero with Base?"

### Social & Mini Apps
- "How do I build a social app on Base?"
- "Show me MiniKit integration examples"
- "What are Base Mini Apps?"
- "How do I create a Farcaster Frame?"

## Configuration Options

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

### Server Configuration

The MCP server can be configured by modifying `src/index.ts`:

- Add new tools by extending the tool handlers
- Modify response formats
- Add custom documentation sources
- Extend knowledge base coverage

## Troubleshooting

### Common Issues

1. **Server won't start:**
   - Ensure Node.js 18+ is installed
   - Check that dependencies are installed: `npm install`
   - Verify the build completed: `npm run build`

2. **MCP connection issues:**
   - Verify the absolute path to `dist/index.js` is correct
   - Check that the server runs independently: `node dist/index.js`
   - Ensure proper JSON formatting in MCP configuration

3. **Tool responses are empty:**
   - Check server logs for errors
   - Verify tool parameters match expected schemas
   - Test individual tools with simple requests

### Debug Mode

Run the server with debug logging:
```bash
LOG_LEVEL=debug node dist/index.js
```

## Knowledge Base Files

The server includes comprehensive documentation from:

- `src/knowledge/base-onchainkit.json` - OnchainKit components, API, utilities, types
- `src/knowledge/base-account.json` - Smart wallet and account abstraction
- `src/knowledge/base-app.json` - Mini Apps and Base App development
- `src/knowledge/base-chain.json` - Network info, tools, infrastructure
- `src/knowledge/base-cookbook.json` - Implementation recipes and guides
- `src/knowledge/quickstart-guides.json` - Getting started guides

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add new tools or improve existing ones
4. Update documentation
5. Submit a pull request

### Adding New Tools

1. Define the tool schema in `src/index.ts`
2. Add the tool to the `ListToolsRequestSchema` handler
3. Implement the tool handler in the `CallToolRequestSchema` handler
4. Add comprehensive documentation and examples

### Updating Knowledge Base

1. Add new JSON files to `src/knowledge/`
2. Update tool handlers to include new knowledge
3. Test with relevant queries
4. Update README with new capabilities

## License

MIT

## Support

- [Base Documentation](https://docs.base.org)
- [OnchainKit Documentation](https://docs.base.org/onchainkit)
- [MCP Specification](https://modelcontextprotocol.io)
- [Issues](https://github.com/CodaLabs-xyz/base-dev-mcp-server/issues)

---

**Built for the Base ecosystem** 🔵 **Powered by MCP** 🤖