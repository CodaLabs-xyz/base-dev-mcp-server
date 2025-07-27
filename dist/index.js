#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';
// Tool schemas
const GetOverviewSchema = z.object({
    section: z.enum(['smart-wallet', 'minikit', 'wallet-app', 'all']).default('all'),
});
const GetQuickstartSchema = z.object({
    framework: z.enum(['nextjs', 'react-native', 'existing-app']).default('nextjs'),
});
const GetSmartWalletConceptsSchema = z.object({
    concept: z.enum([
        'what-is-smart-wallet',
        'single-sign-on',
        'networks',
        'recovery-keys',
        'magic-spend',
        'gas-free-transactions',
        'spend-permissions',
        'batch-operations',
        'sub-accounts',
        'all'
    ]).default('all'),
});
const GetSmartWalletGuidesSchema = z.object({
    guide: z.enum([
        'siwe',
        'signing-and-verifying',
        'magic-spend',
        'batch-transactions',
        'paymasters',
        'sub-accounts',
        'spend-permissions',
        'all'
    ]).default('all'),
});
const GetMiniKitGuidesSchema = z.object({
    guide: z.enum([
        'overview',
        'quickstart',
        'existing-app-integration',
        'debugging',
        'all'
    ]).default('all'),
});
const GenerateProjectTemplateSchema = z.object({
    projectType: z.enum(['smart-wallet-nextjs', 'smart-wallet-react-native', 'minikit-app', 'minikit-integration']),
    projectName: z.string(),
    includeExamples: z.boolean().default(true),
});
const ScrapeBaseDocsSchema = z.object({
    url: z.string().default('https://docs.base.org'),
    section: z.enum(['get-started', 'base-chain', 'base-account', 'base-app', 'onchainkit', 'cookbook', 'learn', 'all']).optional(),
    depth: z.enum(['shallow', 'deep']).default('shallow'),
});
const SearchBaseDocsSchema = z.object({
    query: z.string(),
    section: z.enum(['get-started', 'base-chain', 'base-account', 'base-app', 'onchainkit', 'cookbook', 'learn', 'all']).default('all'),
    limit: z.number().min(1).max(50).default(10),
});
const GetBaseContractsSchema = z.object({
    network: z.enum(['mainnet', 'sepolia', 'all']).default('all'),
    contractType: z.enum(['core', 'defi', 'nft', 'governance', 'bridge', 'all']).default('all'),
});
const GetBaseRPCInfoSchema = z.object({
    network: z.enum(['mainnet', 'sepolia', 'all']).default('all'),
    includeArchive: z.boolean().default(false),
});
const GetOnchainKitComponentsSchema = z.object({
    component: z.enum(['wallet', 'identity', 'fund', 'transaction', 'frame', 'swap', 'all']).default('all'),
    includeCode: z.boolean().default(true),
});
const GetBaseEcosystemSchema = z.object({
    category: z.enum(['defi', 'nft', 'gaming', 'social', 'infrastructure', 'bridges', 'all']).default('all'),
    includeTestnet: z.boolean().default(false),
});
const GenerateBaseContractSchema = z.object({
    contractType: z.enum(['erc20', 'erc721', 'erc1155', 'multisig', 'dao', 'defi-vault']),
    name: z.string(),
    symbol: z.string().optional(),
    features: z.array(z.string()).default([]),
});
const GetBaseDeploymentGuideSchema = z.object({
    tool: z.enum(['hardhat', 'foundry', 'remix', 'thirdweb']).default('hardhat'),
    network: z.enum(['mainnet', 'sepolia']).default('sepolia'),
    verification: z.boolean().default(true),
});
const GetBaseBridgeInfoSchema = z.object({
    bridgeType: z.enum(['official', 'third-party', 'all']).default('all'),
    includeGas: z.boolean().default(true),
});
class BaseMiniKitMCPServer {
    server;
    documentationCache = new Map();
    constructor() {
        this.server = new Server({
            name: 'base-minikit-mcp-server',
            version: '1.0.0',
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_base_overview',
                        description: 'Get comprehensive overview of Base Smart Wallet, MiniKit, and Wallet App development',
                        inputSchema: GetOverviewSchema,
                    },
                    {
                        name: 'get_smart_wallet_quickstart',
                        description: 'Get Smart Wallet quickstart guides for different frameworks',
                        inputSchema: GetQuickstartSchema,
                    },
                    {
                        name: 'get_smart_wallet_concepts',
                        description: 'Get detailed Smart Wallet concepts and features documentation',
                        inputSchema: GetSmartWalletConceptsSchema,
                    },
                    {
                        name: 'get_smart_wallet_guides',
                        description: 'Get implementation guides for Smart Wallet features',
                        inputSchema: GetSmartWalletGuidesSchema,
                    },
                    {
                        name: 'get_minikit_guides',
                        description: 'Get MiniKit development guides and integration instructions',
                        inputSchema: GetMiniKitGuidesSchema,
                    },
                    {
                        name: 'generate_project_template',
                        description: 'Generate project templates for Base Smart Wallet or MiniKit applications',
                        inputSchema: GenerateProjectTemplateSchema,
                    },
                    {
                        name: 'get_network_config',
                        description: 'Get Base network configuration for mainnet and testnet',
                        inputSchema: z.object({}),
                    },
                    {
                        name: 'get_development_tools',
                        description: 'Get list of recommended development tools and resources for Base development',
                        inputSchema: z.object({}),
                    },
                    {
                        name: 'scrape_base_docs',
                        description: 'Scrape Base documentation links and content from docs.base.org',
                        inputSchema: ScrapeBaseDocsSchema,
                    },
                    {
                        name: 'search_base_docs',
                        description: 'Search through scraped Base documentation content',
                        inputSchema: SearchBaseDocsSchema,
                    },
                    {
                        name: 'get_base_contracts',
                        description: 'Get Base network contract addresses and ABIs for core protocols',
                        inputSchema: GetBaseContractsSchema,
                    },
                    {
                        name: 'get_base_rpc_info',
                        description: 'Get Base RPC endpoints, WebSocket URLs, and network configuration',
                        inputSchema: GetBaseRPCInfoSchema,
                    },
                    {
                        name: 'get_onchainkit_components',
                        description: 'Get OnchainKit component examples and implementation guides',
                        inputSchema: GetOnchainKitComponentsSchema,
                    },
                    {
                        name: 'get_base_ecosystem',
                        description: 'Get Base ecosystem projects, dApps, and protocols by category',
                        inputSchema: GetBaseEcosystemSchema,
                    },
                    {
                        name: 'generate_base_contract',
                        description: 'Generate Base-optimized smart contract templates with best practices',
                        inputSchema: GenerateBaseContractSchema,
                    },
                    {
                        name: 'get_base_deployment_guide',
                        description: 'Get deployment guides for Base with various tools and configurations',
                        inputSchema: GetBaseDeploymentGuideSchema,
                    },
                    {
                        name: 'get_base_bridge_info',
                        description: 'Get Base bridge information, supported tokens, and cross-chain options',
                        inputSchema: GetBaseBridgeInfoSchema,
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                switch (name) {
                    case 'get_base_overview':
                        return await this.getBaseOverview(args);
                    case 'get_smart_wallet_quickstart':
                        return await this.getSmartWalletQuickstart(args);
                    case 'get_smart_wallet_concepts':
                        return await this.getSmartWalletConcepts(args);
                    case 'get_smart_wallet_guides':
                        return await this.getSmartWalletGuides(args);
                    case 'get_minikit_guides':
                        return await this.getMiniKitGuides(args);
                    case 'generate_project_template':
                        return await this.generateProjectTemplate(args);
                    case 'get_network_config':
                        return await this.getNetworkConfig();
                    case 'get_development_tools':
                        return await this.getDevelopmentTools();
                    case 'scrape_base_docs':
                        return await this.scrapeBaseDocs(args);
                    case 'search_base_docs':
                        return await this.searchBaseDocs(args);
                    case 'get_base_contracts':
                        return await this.getBaseContracts(args);
                    case 'get_base_rpc_info':
                        return await this.getBaseRPCInfo(args);
                    case 'get_onchainkit_components':
                        return await this.getOnchainKitComponents(args);
                    case 'get_base_ecosystem':
                        return await this.getBaseEcosystem(args);
                    case 'generate_base_contract':
                        return await this.generateBaseContract(args);
                    case 'get_base_deployment_guide':
                        return await this.getBaseDeploymentGuide(args);
                    case 'get_base_bridge_info':
                        return await this.getBaseBridgeInfo(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
            }
        });
    }
    async getBaseOverview(args) {
        const { section } = GetOverviewSchema.parse(args);
        const overview = {
            'smart-wallet': {
                description: "Smart Wallet is a multi-chain self-custodial cryptocurrency wallet that enables users to create an account quickly without requiring an app or extension, leveraging Passkeys.",
                keyFeatures: [
                    "Passkeys-based authentication",
                    "Multi-chain support (Base, Ethereum, Arbitrum, Optimism, etc.)",
                    "Self-custodial design",
                    "MagicSpend: Use Coinbase balances onchain",
                    "Sponsored transactions: Up to $15k in gas credits",
                    "Sub accounts: Create embedded accounts",
                    "Spend permissions: Third-party signers"
                ],
                gettingStarted: [
                    "Quick Demo using OnchainKit (5 mins)",
                    "Add to Existing Next.js Project (15 mins)",
                    "Add to Existing React Native Project"
                ]
            },
            'minikit': {
                description: "MiniKit is the easiest way to build Mini Apps on Base. It simplifies Mini App development with minimal SDK knowledge required.",
                keyFeatures: [
                    "Simplified development approach",
                    "Integrates with OnchainKit components",
                    "CLI for quick scaffolding",
                    "Frontend and backend integration",
                    "Automatic account associations",
                    "Webhook and notification configuration"
                ],
                useCases: [
                    "Gaming mini apps",
                    "Social mini apps",
                    "Payment mini apps"
                ]
            },
            'wallet-app': {
                description: "Base Wallet App allows developers to build lightweight web applications that run natively in Coinbase Wallet without downloads.",
                keyFeatures: [
                    "Lightweight web applications",
                    "Native integration with Coinbase Wallet",
                    "Seamless wallet interactions",
                    "Social feed discovery",
                    "No complex rebuilding required"
                ],
                implementation: [
                    "Wrap existing web app with MiniKitProvider",
                    "Create farcaster.json manifest",
                    "Deploy to standard hosting platforms"
                ]
            }
        };
        if (section === 'all') {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(overview, null, 2)
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(overview[section], null, 2)
                    }
                ]
            };
        }
    }
    async getSmartWalletQuickstart(args) {
        const { framework } = GetQuickstartSchema.parse(args);
        const quickstarts = {
            'nextjs': {
                title: "Add Smart Wallet to Next.js Project",
                steps: [
                    {
                        step: 1,
                        title: "Install Dependencies",
                        code: "npm install @coinbase/wallet-sdk wagmi viem @tanstack/react-query"
                    },
                    {
                        step: 2,
                        title: "Create Wagmi Configuration",
                        description: "Configure Coinbase Wallet connector with Base Sepolia chain",
                        code: `import { createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Your App Name',
      preference: 'smartWalletOnly'
    })
  ]
})`
                    },
                    {
                        step: 3,
                        title: "Set up Providers",
                        description: "Wrap application with WagmiProvider and QueryClientProvider"
                    },
                    {
                        step: 4,
                        title: "Implement Connection Component",
                        description: "Create component with wallet connection and SIWE functionality"
                    }
                ]
            },
            'react-native': {
                title: "Add Smart Wallet to React Native Project",
                steps: [
                    {
                        step: 1,
                        title: "Install Dependencies",
                        code: `npm i @mobile-wallet-protocol/client@latest
npm i expo expo-web-browser @react-native-async-storage/async-storage
npm i expo-crypto expo-standard-web-crypto react-native-url-polyfill`
                    },
                    {
                        step: 2,
                        title: "Add Polyfills",
                        code: `import "react-native-url-polyfill/auto";
import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { randomUUID } from "expo-crypto";

polyfillWebCrypto();
crypto.randomUUID = randomUUID;`
                    },
                    {
                        step: 3,
                        title: "Configure Wallet Integration",
                        description: "Choose between EIP-1193 Provider or Wagmi Connector approach"
                    }
                ]
            },
            'existing-app': {
                title: "Add Smart Wallet to Existing App",
                steps: [
                    {
                        step: 1,
                        title: "Quick Demo",
                        description: "Clone onchain-app-template for 5-minute demo",
                        code: `git clone https://github.com/coinbase/onchain-app-template
cd onchain-app-template
bun i && bun run dev`
                    },
                    {
                        step: 2,
                        title: "Environment Setup",
                        description: "Configure CDP API key and WalletConnect Project ID"
                    },
                    {
                        step: 3,
                        title: "Explore Features",
                        description: "Test pre-integrated Wallet component and OnchainKit components"
                    }
                ]
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(quickstarts[framework], null, 2)
                }
            ]
        };
    }
    async getSmartWalletConcepts(args) {
        const { concept } = GetSmartWalletConceptsSchema.parse(args);
        const concepts = {
            'what-is-smart-wallet': {
                definition: "Smart Wallet is a multi-chain self-custodial cryptocurrency wallet that enables users to create an onchain account in seconds with no app or extension required, thanks to its reliance on Passkeys.",
                keyCharacteristics: [
                    "Passkeys-based authentication",
                    "Multi-chain support",
                    "Self-custodial design",
                    "No app or extension required",
                    "Quick onchain account creation"
                ],
                uniqueCapabilities: [
                    "MagicSpend: Use Coinbase balances onchain",
                    "Free Sponsored Transactions: Up to $15k in gas credits",
                    "Sub Accounts: Create embedded accounts",
                    "Spend Permissions: Third-party signers"
                ]
            },
            'single-sign-on': {
                description: "Smart Wallet provides SSO for onchain apps using passkeys",
                implementation: [
                    "Passkey storage on users' devices",
                    "SDK integration with keys.coinbase.com popups",
                    "Cross-domain messaging between SDK and popup"
                ],
                benefit: "Users bring the same account, identity, and assets across apps"
            },
            'networks': {
                mainnetNetworks: [
                    "Base", "Arbitrum", "Optimism", "Zora", "Polygon",
                    "BNB", "Avalanche", "Lordchain", "Ethereum mainnet"
                ],
                testnetNetworks: [
                    "Sepolia", "Base Sepolia", "Optimism Sepolia"
                ],
                note: "Smart Wallet contracts can be permissionlessly deployed on any EVM-compatible network"
            },
            'recovery-keys': {
                description: "Fallback authentication mechanism using standard Ethereum private keys",
                capabilities: [
                    "Wallet recovery if passkey is lost",
                    "Transaction signing without website",
                    "Multiple recovery keys per wallet",
                    "Add/remove by existing owners"
                ],
                technicalDetails: [
                    "Standard ECDSA signatures",
                    "Compatible with Ethereum tooling",
                    "Equivalent permissions to passkey owners"
                ]
            },
            'magic-spend': {
                description: "Enables Smart Wallet users to spend Coinbase balances directly onchain",
                benefits: [
                    "Remove funding friction for new users",
                    "Tap into Coinbase's user base",
                    "Enable instant transactions without onramps"
                ],
                supportedAssets: ["ETH"],
                supportedNetworks: ["Base"],
                bestPractices: [
                    "Detect auxiliaryFunds capability",
                    "Don't block interactions based on onchain balance"
                ]
            },
            'gas-free-transactions': {
                description: "Smart Wallet enables apps to pay for users' transaction gas fees",
                technicalImplementation: [
                    "ERC-4337 compliant paymasters",
                    "ERC-7677 compliant paymaster service required",
                    "Share paymaster via paymasterService capability"
                ]
            },
            'spend-permissions': {
                description: "Enable third-party signers to spend assets from users' wallets",
                features: [
                    "Support for native and ERC-20 tokens",
                    "Granular controls for recurring/one-time spending",
                    "Flexible recurrence controls",
                    "Time boundaries and allowance limits"
                ],
                useCases: ["Subscriptions", "Trading bots", "High-frequency game interactions"]
            },
            'batch-operations': {
                description: "Perform multiple operations in a single transaction",
                purpose: "Reduce transaction count for complex operations like swaps",
                technicalImplementation: "Facilitated via wallet_sendCalls RPC"
            },
            'sub-accounts': {
                description: "Hierarchical, app-specific accounts extending from primary Smart Wallet",
                features: [
                    "Execute transactions and sign messages",
                    "Separate asset management",
                    "Controlled by Smart Wallet and authorized app logic"
                ],
                status: "Currently only available in development environment"
            }
        };
        if (concept === 'all') {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(concepts, null, 2)
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(concepts[concept], null, 2)
                    }
                ]
            };
        }
    }
    async getSmartWalletGuides(args) {
        const { guide } = GetSmartWalletGuidesSchema.parse(args);
        const guides = {
            'siwe': {
                title: "Sign-In with Ethereum (SIWE) Implementation",
                steps: [
                    "Set up Next.js project with Wagmi",
                    "Install SIWE dependency: pnpm install siwe",
                    "Create SignInWithEthereum component",
                    "Generate SIWE message with user details",
                    "Verify signature using usePublicClient"
                ],
                keyCode: `const siweMessage = new SiweMessage({
  domain: document.location.host,
  address: account.address,
  chainId: account.chainId,
  uri: document.location.origin,
  version: '1',
  statement: 'Smart Wallet SIWE Example',
  nonce: '12345678', // Backend-generated nonce
});`,
                securityConsiderations: [
                    "Use backend-generated nonces",
                    "Implement proper nonce verification",
                    "Invalidate nonces on logout"
                ]
            },
            'signing-and-verifying': {
                title: "Signing and Verifying Messages",
                useCases: [
                    "Offchain verification: Authenticating users",
                    "Onchain verification: Signing permissions/batching"
                ],
                approaches: [
                    "Simple Message Signing (SIWE)",
                    "Typed Data Signing (EIP-712)",
                    "Onchain signature validation"
                ],
                technicalDetails: [
                    "Smart contracts use isValidSignature function (EIP-1271)",
                    "Supports deterministic wallet addresses via ERC-6492",
                    "Use ValidateSigOffchain helper contract"
                ]
            },
            'magic-spend': {
                title: "MagicSpend Implementation",
                overview: "Allows Smart Wallet users to use Coinbase balances onchain",
                implementation: `import { useCapabilities } from 'wagmi/experimental'

function App() {
  const { data: capabilities } = useCapabilities()
  // capabilities will show auxiliaryFunds support
}`,
                considerations: [
                    "Don't block actions based on balance if auxiliaryFunds present",
                    "Smart Wallet indicates limited balance info via wallet_getCapabilities"
                ]
            },
            'batch-transactions': {
                title: "Batch Transactions Implementation",
                overview: "Send multiple onchain calls in single transaction",
                implementation: `const { writeContracts } = useWriteContracts()

writeContracts({
  contracts: [
    {
      address: "0x...",
      abi,
      functionName: "safeMint",
      args: [account.address]
    }
  ]
})`,
                statusChecking: "Use useCallsStatus to monitor transaction status",
                considerations: [
                    "Requires new wallet RPC not supported by all wallets",
                    "Recommended to have fallback function"
                ]
            },
            'paymasters': {
                title: "Paymaster Implementation",
                steps: [
                    "Obtain Paymaster Service URL (Coinbase Developer Platform recommended)",
                    "Create Wagmi and Viem clients with Base Sepolia",
                    "Configure Coinbase Wallet with smartWalletOnly preference",
                    "Implement paymaster capabilities check",
                    "Use writeContracts with capabilities parameter"
                ],
                gasCredits: "Up to $15k via Base Gasless Campaign",
                security: [
                    "Use proxy to protect Paymaster service URL",
                    "Ensure ERC-7677 compliance",
                    "Set up contracts allowlist"
                ]
            },
            'sub-accounts': {
                title: "Sub Accounts Implementation",
                overview: "Hierarchical, app-specific accounts extending from Smart Wallet",
                features: [
                    "Execute transactions and sign messages",
                    "Separate asset management",
                    "Controlled by Smart Wallet and app logic"
                ],
                status: "Development environment only - contact Base team for production"
            },
            'spend-permissions': {
                title: "Spend Permissions Implementation",
                overview: "Enable third-party signers to spend user assets",
                structParameters: [
                    "account: Wallet owner",
                    "spender: Authorized third party",
                    "token: Asset type",
                    "allowance: Spending limit",
                    "period: Recurrence interval",
                    "start/end: Time boundaries"
                ],
                approvalProcess: [
                    "User signs ERC-712 typed object",
                    "Submit to SpendPermissionManager.approveWithSignature"
                ],
                useCases: ["Subscriptions", "Trading bots", "Game interactions"]
            }
        };
        if (guide === 'all') {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(guides, null, 2)
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(guides[guide], null, 2)
                    }
                ]
            };
        }
    }
    async getMiniKitGuides(args) {
        const { guide } = GetMiniKitGuidesSchema.parse(args);
        const guides = {
            'overview': {
                title: "MiniKit Overview",
                tagline: "Easiest way to build Mini Apps on Base",
                coreFeatures: [
                    "Simplified development with minimal SDK knowledge",
                    "Seamless OnchainKit integration",
                    "Coinbase Wallet-specific hooks",
                    "CLI for quick project scaffolding",
                    "Automatic configuration setup"
                ],
                useCases: ["Gaming mini apps", "Social mini apps", "Payment mini apps"],
                keyComponents: [
                    "MiniKitProvider: App wrapper and SDK context",
                    "useMiniKit: App initialization",
                    "useAddFrame: Add frames to user list",
                    "useNotification: Send notifications",
                    "useOpenUrl: Open URLs in different contexts"
                ]
            },
            'quickstart': {
                title: "MiniKit Quickstart",
                prerequisites: ["Farcaster Account", "Optional: Coinbase Developer Platform Account"],
                definition: "A mini app is a lightweight web app that runs directly inside Farcaster Frames",
                setup: [
                    "Create project: npx create-onchain --mini",
                    "Install dependencies: npm install",
                    "Run development: npm run dev"
                ],
                deployment: ["Vercel (recommended)", "ngrok for local testing"],
                keyFeatures: [
                    "MiniKitProvider for app initialization",
                    "usePrimaryButton for persistent bottom button",
                    "useClose for frame closing",
                    "useNotification for user notifications"
                ]
            },
            'existing-app-integration': {
                title: "Integrating MiniKit into Existing Next.js Apps",
                prerequisites: [
                    "Next.js with App Router",
                    "HTTPS deployed application",
                    "Farcaster account",
                    "Coinbase Developer Platform account"
                ],
                steps: [
                    {
                        step: 1,
                        title: "Install Dependencies",
                        code: "npm install @coinbase/onchainkit"
                    },
                    {
                        step: 2,
                        title: "Create MiniKit Provider",
                        code: `'use client';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';

export function MiniKitContextProvider({ children }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
}`
                    },
                    {
                        step: 3,
                        title: "Update Layout",
                        description: "Wrap app with MiniKitContextProvider"
                    },
                    {
                        step: 4,
                        title: "Initialize MiniKit",
                        code: `const { setFrameReady } = useMiniKit();
useEffect(() => {
  setFrameReady();
}, []);`
                    },
                    {
                        step: 5,
                        title: "Generate Manifest",
                        code: "npx create-onchain --manifest"
                    }
                ]
            },
            'debugging': {
                title: "MiniKit Debugging",
                commonIssues: [
                    "Frame readiness not set",
                    "Missing environment variables",
                    "Incorrect manifest configuration",
                    "HTTPS deployment issues"
                ],
                debuggingTips: [
                    "Check console for MiniKit initialization errors",
                    "Verify all environment variables are set",
                    "Test manifest at /.well-known/farcaster.json",
                    "Ensure HTTPS deployment for production testing"
                ]
            }
        };
        if (guide === 'all') {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(guides, null, 2)
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(guides[guide], null, 2)
                    }
                ]
            };
        }
    }
    async generateProjectTemplate(args) {
        const { projectType, projectName, includeExamples } = GenerateProjectTemplateSchema.parse(args);
        const templates = {
            'smart-wallet-nextjs': {
                title: `Smart Wallet Next.js Project: ${projectName}`,
                structure: {
                    'package.json': {
                        dependencies: [
                            "@coinbase/wallet-sdk",
                            "wagmi",
                            "viem",
                            "@tanstack/react-query",
                            "next",
                            "react",
                            "react-dom"
                        ]
                    },
                    'src/config/wagmi.ts': {
                        description: "Wagmi configuration with Coinbase Wallet connector",
                        code: `import { createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: '${projectName}',
      preference: 'smartWalletOnly'
    })
  ]
})`
                    },
                    'src/providers/Providers.tsx': {
                        description: "React providers setup",
                        code: `'use client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '../config/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}`
                    }
                },
                examples: includeExamples ? [
                    "Wallet connection component",
                    "SIWE implementation",
                    "Transaction examples",
                    "MagicSpend integration"
                ] : []
            },
            'smart-wallet-react-native': {
                title: `Smart Wallet React Native Project: ${projectName}`,
                structure: {
                    'package.json': {
                        dependencies: [
                            "@mobile-wallet-protocol/client",
                            "expo",
                            "expo-web-browser",
                            "@react-native-async-storage/async-storage",
                            "expo-crypto",
                            "expo-standard-web-crypto",
                            "react-native-url-polyfill"
                        ]
                    },
                    'polyfills.js': {
                        description: "Required polyfills for React Native",
                        code: `import "react-native-url-polyfill/auto";
import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { randomUUID } from "expo-crypto";

polyfillWebCrypto();
crypto.randomUUID = randomUUID;`
                    },
                    'src/wallet/config.ts': {
                        description: "Wallet configuration",
                        code: `import { EIP1193Provider, Wallets } from '@mobile-wallet-protocol/client'

const metadata = {
  name: "${projectName}",
  customScheme: "${projectName.toLowerCase()}://",
  chainIds: [8453], // Base
  logoUrl: "https://example.com/logo.png"
};

export const provider = new EIP1193Provider({
  metadata,
  wallet: Wallets.CoinbaseSmartWallet
});`
                    }
                }
            },
            'minikit-app': {
                title: `MiniKit Application: ${projectName}`,
                structure: {
                    'package.json': {
                        dependencies: [
                            "@coinbase/onchainkit",
                            "next",
                            "react",
                            "react-dom"
                        ]
                    },
                    'src/providers/MiniKitProvider.tsx': {
                        description: "MiniKit provider setup",
                        code: `'use client'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { base } from 'wagmi/chains'

export function MiniKitContextProvider({ children }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      chain={base}
    >
      {children}
    </MiniKitProvider>
  )
}`
                    },
                    'public/.well-known/farcaster.json': {
                        description: "Farcaster manifest file",
                        code: `{
  "accountAssociation": {
    "header": "eip191",
    "payload": "domain",
    "signature": "signature_hex"
  },
  "frame": {
    "name": "${projectName}",
    "iconUrl": "https://yourapp.com/icon.png",
    "homeUrl": "https://yourapp.com",
    "imageUrl": "https://yourapp.com/preview.png"
  }
}`
                    }
                },
                examples: includeExamples ? [
                    "Frame interaction hooks",
                    "Notification system",
                    "URL opening patterns",
                    "Primary button implementation"
                ] : []
            },
            'minikit-integration': {
                title: `MiniKit Integration for: ${projectName}`,
                steps: [
                    "Install @coinbase/onchainkit",
                    "Create MiniKit provider wrapper",
                    "Update app layout with provider",
                    "Initialize MiniKit in main component",
                    "Configure environment variables",
                    "Generate and configure manifest"
                ],
                requiredFiles: [
                    "providers/MiniKitProvider.tsx",
                    "app/layout.tsx (updated)",
                    ".env.local (environment variables)",
                    "public/.well-known/farcaster.json"
                ]
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(templates[projectType], null, 2)
                }
            ]
        };
    }
    async getNetworkConfig() {
        const config = {
            mainnet: {
                chainId: 8453,
                name: "Base",
                currency: "ETH",
                rpcUrls: [
                    "https://mainnet.base.org",
                    "https://base-mainnet.public.blastapi.io",
                    "https://1rpc.io/base"
                ],
                blockExplorerUrls: ["https://basescan.org"],
                iconUrls: ["https://bridge.base.org/icons/base.svg"]
            },
            testnet: {
                chainId: 84532,
                name: "Base Sepolia",
                currency: "ETH",
                rpcUrls: [
                    "https://sepolia.base.org",
                    "https://base-sepolia.public.blastapi.io"
                ],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
                iconUrls: ["https://bridge.base.org/icons/base.svg"]
            },
            contracts: {
                mainnet: {
                    smartWalletFactory: "0x...", // Would be actual addresses
                    paymasterService: "https://api.developer.coinbase.com/rpc/v1/base/paymaster"
                },
                testnet: {
                    smartWalletFactory: "0x...", // Would be actual addresses
                    paymasterService: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/paymaster"
                }
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(config, null, 2)
                }
            ]
        };
    }
    async getDevelopmentTools() {
        const tools = {
            essentialTools: [
                {
                    name: "OnchainKit",
                    description: "React components and TypeScript utilities for onchain apps",
                    url: "https://onchainkit.xyz",
                    category: "Components"
                },
                {
                    name: "Wagmi",
                    description: "React hooks for Ethereum development",
                    url: "https://wagmi.sh",
                    category: "Ethereum Integration"
                },
                {
                    name: "Viem",
                    description: "TypeScript interface for Ethereum",
                    url: "https://viem.sh",
                    category: "Ethereum Client"
                },
                {
                    name: "Coinbase Developer Platform",
                    description: "APIs and tools for Coinbase integration",
                    url: "https://portal.cdp.coinbase.com",
                    category: "APIs"
                }
            ],
            developmentResources: [
                {
                    name: "Base Builder MCP",
                    description: "Model Context Protocol server for Base development",
                    url: "https://github.com/base/base-builder-mcp",
                    category: "AI Tools"
                },
                {
                    name: "Agent Kit",
                    description: "Build AI agents using embedded Wallet APIs",
                    url: "https://docs.cdp.coinbase.com/agentkit/docs/welcome",
                    category: "AI Tools"
                },
                {
                    name: "Smart Wallet Template",
                    description: "Quick start template for Smart Wallet apps",
                    url: "https://github.com/coinbase/onchain-app-template",
                    category: "Templates"
                }
            ],
            testingTools: [
                {
                    name: "Base Sepolia Testnet",
                    description: "Test network for Base development",
                    faucet: "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet",
                    category: "Testing"
                },
                {
                    name: "Base Gasless Campaign",
                    description: "Up to $15k in gas credits for testing",
                    url: "https://base.org/gasless",
                    category: "Testing"
                }
            ],
            cliTools: [
                {
                    name: "create-onchain",
                    description: "CLI for creating onchain applications",
                    command: "npx create-onchain",
                    options: ["--mini (MiniKit apps)", "--manifest (generate manifest)"],
                    category: "CLI"
                }
            ]
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(tools, null, 2)
                }
            ]
        };
    }
    async getBaseContracts(args) {
        const { network, contractType } = GetBaseContractsSchema.parse(args);
        const contracts = {
            mainnet: {
                core: {
                    "L2OutputOracle": "0x56315b90c40730925ec5485cf004d835058518A0",
                    "L2CrossDomainMessenger": "0x4200000000000000000000000000000000000007",
                    "L1StandardBridge": "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
                    "L2StandardBridge": "0x4200000000000000000000000000000000000010",
                    "OptimismPortal": "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
                    "L1ERC721Bridge": "0x608d94945A64503E642E6370Ec598e519a2C1E53",
                    "L2ERC721Bridge": "0x4200000000000000000000000000000000000014"
                },
                defi: {
                    "Uniswap V3 Factory": "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
                    "Uniswap V3 Router": "0x2626664c2603336E57B271c5C0b26F421741e481",
                    "Compound cUSDC": "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
                    "Aave Pool": "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
                    "1inch Router": "0x1111111254EEB25477B68fb85Ed929f73A960582"
                },
                nft: {
                    "OpenSea Seaport": "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
                    "Base, Introduced": "0xd4307e0acd12cf46fd6cf93bc264f5d5d1598792",
                    "Coinbase Verifications": "0x357458739F90461b99789350868CD7CF330Dd7EE"
                },
                governance: {
                    "Base Timelock": "0x0000000000000000000000000000000000000000"
                }
            },
            sepolia: {
                core: {
                    "L2OutputOracle": "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254",
                    "L2CrossDomainMessenger": "0x4200000000000000000000000000000000000007",
                    "L1StandardBridge": "0xfd0Bf71F60660E2f608ed56e1659C450eB113120",
                    "L2StandardBridge": "0x4200000000000000000000000000000000000010",
                    "OptimismPortal": "0x49f53e41452C74589E85cA1677426Ba426459e85"
                },
                defi: {
                    "Uniswap V3 Factory": "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
                    "Test USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                    "Test DAI": "0x7683022d84f726bba04d5c85bf7f6049b3b84cfb"
                }
            }
        };
        const networkData = network === 'all' ? contracts : { [network]: contracts[network] };
        const result = {};
        for (const [net, netContracts] of Object.entries(networkData)) {
            result[net] = contractType === 'all' ? netContracts : { [contractType]: netContracts[contractType] };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        networks: result,
                        explorers: {
                            mainnet: "https://basescan.org",
                            sepolia: "https://sepolia.basescan.org"
                        },
                        chainIds: {
                            mainnet: 8453,
                            sepolia: 84532
                        }
                    }, null, 2)
                }
            ]
        };
    }
    async getBaseRPCInfo(args) {
        const { network, includeArchive } = GetBaseRPCInfoSchema.parse(args);
        const rpcInfo = {
            mainnet: {
                chainId: 8453,
                name: "Base",
                rpcUrls: [
                    "https://mainnet.base.org",
                    "https://base-mainnet.public.blastapi.io",
                    "https://1rpc.io/base",
                    "https://base.gateway.tenderly.co",
                    "https://base-rpc.publicnode.com"
                ],
                wsUrls: [
                    "wss://base-mainnet.public.blastapi.io"
                ],
                archiveRpc: includeArchive ? [
                    "https://base-mainnet-archive.public.blastapi.io",
                    "https://base.llamarpc.com"
                ] : [],
                explorer: "https://basescan.org",
                faucet: null,
                nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18
                }
            },
            sepolia: {
                chainId: 84532,
                name: "Base Sepolia",
                rpcUrls: [
                    "https://sepolia.base.org",
                    "https://base-sepolia.public.blastapi.io",
                    "https://base-sepolia-rpc.publicnode.com"
                ],
                wsUrls: [
                    "wss://base-sepolia.public.blastapi.io"
                ],
                archiveRpc: includeArchive ? [
                    "https://base-sepolia-archive.public.blastapi.io"
                ] : [],
                explorer: "https://sepolia.basescan.org",
                faucet: "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet",
                nativeCurrency: {
                    name: "Sepolia Ether",
                    symbol: "ETH",
                    decimals: 18
                }
            }
        };
        const result = network === 'all' ? rpcInfo : { [network]: rpcInfo[network] };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        networks: result,
                        gasPrice: {
                            standard: "0.1 gwei",
                            fast: "0.2 gwei",
                            instant: "0.3 gwei"
                        },
                        blockTime: "2 seconds",
                        finality: "Instant (soft) / 12 minutes (hard)"
                    }, null, 2)
                }
            ]
        };
    }
    async getOnchainKitComponents(args) {
        const { component, includeCode } = GetOnchainKitComponentsSchema.parse(args);
        const components = {
            wallet: {
                description: "Wallet connection and management components",
                components: ["Wallet", "ConnectWallet", "WalletDropdown", "WalletDropdownLink"],
                features: ["Smart Wallet integration", "Multiple wallet support", "Connection state management"],
                example: includeCode ? `import { Wallet, ConnectWallet, WalletDropdown } from '@coinbase/onchainkit/wallet';

function App() {
  return (
    <Wallet>
      <ConnectWallet>
        <WalletDropdown>
          <Identity />
        </WalletDropdown>
      </ConnectWallet>
    </Wallet>
  );
}` : null
            },
            identity: {
                description: "Identity verification and display components",
                components: ["Identity", "Avatar", "Name", "Badge", "Address"],
                features: ["ENS name resolution", "Avatar display", "Verification badges"],
                example: includeCode ? `import { Identity, Avatar, Name, Badge, Address } from '@coinbase/onchainkit/identity';

function UserProfile({ address }) {
  return (
    <Identity address={address}>
      <Avatar />
      <Name />
      <Badge />
      <Address />
    </Identity>
  );
}` : null
            },
            fund: {
                description: "Funding and payment components",
                components: ["FundButton", "CoinbaseWalletWidget"],
                features: ["Buy crypto", "Coinbase integration", "Multiple payment methods"],
                example: includeCode ? `import { FundButton } from '@coinbase/onchainkit/fund';

function FundWallet() {
  return (
    <FundButton 
      text="Fund Wallet"
      fundingUrl="https://pay.coinbase.com/buy"
    />
  );
}` : null
            },
            transaction: {
                description: "Transaction handling and UI components",
                components: ["Transaction", "TransactionButton", "TransactionSponsor", "TransactionStatus"],
                features: ["Gasless transactions", "Transaction status", "Error handling"],
                example: includeCode ? `import { Transaction, TransactionButton, TransactionSponsor } from '@coinbase/onchainkit/transaction';

function SendTransaction() {
  return (
    <Transaction>
      <TransactionButton />
      <TransactionSponsor />
    </Transaction>
  );
}` : null
            },
            frame: {
                description: "Farcaster Frame components",
                components: ["FrameMetadata", "getFrameMetadata", "getFrameHtmlResponse"],
                features: ["Frame creation", "Metadata generation", "Response handling"],
                example: includeCode ? `import { FrameMetadata } from '@coinbase/onchainkit/frame';

function MyFrame() {
  return (
    <FrameMetadata
      buttons={[{ label: 'Click me!' }]}
      image="https://example.com/image.png"
      postUrl="https://example.com/api/frame"
    />
  );
}` : null
            },
            swap: {
                description: "Token swap components",
                components: ["Swap", "SwapAmountInput", "SwapToggleButton", "SwapButton"],
                features: ["DEX integration", "Token selection", "Slippage control"],
                example: includeCode ? `import { Swap, SwapAmountInput, SwapToggleButton, SwapButton } from '@coinbase/onchainkit/swap';

function TokenSwap() {
  return (
    <Swap>
      <SwapAmountInput />
      <SwapToggleButton />
      <SwapButton />
    </Swap>
  );
}` : null
            }
        };
        const result = component === 'all' ? components : { [component]: components[component] };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        components: result,
                        installation: "npm install @coinbase/onchainkit",
                        documentation: "https://onchainkit.xyz",
                        github: "https://github.com/coinbase/onchainkit"
                    }, null, 2)
                }
            ]
        };
    }
    async getBaseEcosystem(args) {
        const { category, includeTestnet } = GetBaseEcosystemSchema.parse(args);
        const ecosystem = {
            defi: {
                protocols: [
                    {
                        name: "Uniswap V3",
                        description: "Decentralized exchange with concentrated liquidity",
                        url: "https://app.uniswap.org",
                        tvl: "$100M+",
                        category: "DEX"
                    },
                    {
                        name: "Compound",
                        description: "Lending and borrowing protocol",
                        url: "https://compound.finance",
                        tvl: "$50M+",
                        category: "Lending"
                    },
                    {
                        name: "Aave",
                        description: "Decentralized lending protocol",
                        url: "https://aave.com",
                        tvl: "$75M+",
                        category: "Lending"
                    },
                    {
                        name: "Aerodrome Finance",
                        description: "Next-generation AMM designed for Base",
                        url: "https://aerodrome.finance",
                        tvl: "$200M+",
                        category: "DEX"
                    }
                ]
            },
            nft: {
                marketplaces: [
                    {
                        name: "OpenSea",
                        description: "Leading NFT marketplace",
                        url: "https://opensea.io",
                        category: "Marketplace"
                    },
                    {
                        name: "Zora",
                        description: "Creator-focused NFT platform",
                        url: "https://zora.co",
                        category: "Marketplace"
                    }
                ],
                collections: [
                    {
                        name: "Base, Introduced",
                        description: "Official Base commemorative NFT",
                        contract: "0xd4307e0acd12cf46fd6cf93bc264f5d5d1598792"
                    }
                ]
            },
            gaming: {
                games: [
                    {
                        name: "Friend.tech",
                        description: "Social trading platform",
                        url: "https://friend.tech",
                        category: "Social Gaming"
                    }
                ]
            },
            social: {
                platforms: [
                    {
                        name: "Farcaster",
                        description: "Decentralized social network",
                        url: "https://farcaster.xyz",
                        category: "Social Network"
                    },
                    {
                        name: "Lens Protocol",
                        description: "Web3 social graph",
                        url: "https://lens.xyz",
                        category: "Social Graph"
                    }
                ]
            },
            infrastructure: {
                tools: [
                    {
                        name: "Chainlink",
                        description: "Decentralized oracle network",
                        url: "https://chain.link",
                        category: "Oracles"
                    },
                    {
                        name: "The Graph",
                        description: "Indexing protocol",
                        url: "https://thegraph.com",
                        category: "Indexing"
                    },
                    {
                        name: "Alchemy",
                        description: "Blockchain development platform",
                        url: "https://alchemy.com",
                        category: "RPC/API"
                    }
                ]
            },
            bridges: {
                official: [
                    {
                        name: "Base Bridge",
                        description: "Official Ethereum <> Base bridge",
                        url: "https://bridge.base.org",
                        supported: ["ETH", "USDC", "DAI"]
                    }
                ],
                thirdParty: [
                    {
                        name: "LayerZero",
                        description: "Omnichain interoperability protocol",
                        url: "https://layerzero.network",
                        supported: ["Multiple tokens"]
                    },
                    {
                        name: "Stargate",
                        description: "Liquidity transport protocol",
                        url: "https://stargate.finance",
                        supported: ["USDC", "USDT", "ETH"]
                    }
                ]
            }
        };
        const result = category === 'all' ? ecosystem : { [category]: ecosystem[category] };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        ecosystem: result,
                        stats: {
                            totalValueLocked: "$500M+",
                            dailyTransactions: "1M+",
                            activeProjects: "200+"
                        },
                        resources: {
                            ecosystem: "https://base.org/ecosystem",
                            grants: "https://paragraph.xyz/@grants.base.eth"
                        }
                    }, null, 2)
                }
            ]
        };
    }
    async generateBaseContract(args) {
        const { contractType, name, symbol, features } = GenerateBaseContractSchema.parse(args);
        const contracts = {
            erc20: {
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
${features.includes('pausable') ? 'import "@openzeppelin/contracts/security/Pausable.sol";' : ''}
${features.includes('burnable') ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";' : ''}

contract ${name} is ERC20, Ownable${features.includes('pausable') ? ', Pausable' : ''}${features.includes('burnable') ? ', ERC20Burnable' : ''} {
    constructor(address initialOwner) ERC20("${name}", "${symbol}") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    ${features.includes('pausable') ? `
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }` : ''}
}`,
                deployment: `// Hardhat deployment script
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const ${name} = await ethers.getContractFactory("${name}");
  const token = await ${name}.deploy(deployer.address);
  
  await token.waitForDeployment();
  
  console.log("${name} deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`
            },
            erc721: {
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ${name} is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    string private _baseTokenURI;
    uint256 public maxSupply = ${features.includes('limited') ? '10000' : 'type(uint256).max'};

    constructor(address initialOwner) ERC721("${name}", "${symbol}") Ownable(initialOwner) {}

    function mint(address to) public onlyOwner {
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}`
            },
            multisig: {
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${name} {
    address[] public owners;
    uint256 public requiredConfirmations;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    modifier onlyOwner() {
        require(isOwner(msg.sender), "Not an owner");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        require(_owners.length > 0, "Owners required");
        require(_requiredConfirmations > 0 && _requiredConfirmations <= _owners.length, "Invalid confirmations");
        
        owners = _owners;
        requiredConfirmations = _requiredConfirmations;
    }
    
    function isOwner(address addr) public view returns (bool) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == addr) return true;
        }
        return false;
    }
    
    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            confirmations: 0
        }));
    }
}`
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        contract: contracts[contractType],
                        gasOptimizations: [
                            "Use custom errors instead of require strings",
                            "Pack structs efficiently",
                            "Use events for off-chain indexing",
                            "Consider using CREATE2 for deterministic addresses"
                        ],
                        baseSpecific: [
                            "Low gas costs on Base",
                            "Fast 2-second block times",
                            "EVM equivalent - all Ethereum tools work",
                            "Consider using Base-native bridges for cross-chain"
                        ]
                    }, null, 2)
                }
            ]
        };
    }
    async getBaseDeploymentGuide(args) {
        const { tool, network, verification } = GetBaseDeploymentGuideSchema.parse(args);
        const guides = {
            hardhat: {
                setup: `// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
    baseSepolia: {
      url: "https://sepolia.base.org", 
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532,
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY!,
      baseSepolia: process.env.BASESCAN_API_KEY!,
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  }
};`,
                deployment: `// Deploy script
import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("YourContract");
  const contract = await Contract.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("Contract deployed to:", address);
  
  ${verification ? `
  // Wait for block confirmations
  await contract.deploymentTransaction()?.wait(6);
  
  // Verify contract
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [],
  });` : ''}
}`,
                commands: [
                    `npm install hardhat @nomicfoundation/hardhat-toolbox`,
                    `npx hardhat compile`,
                    `npx hardhat run scripts/deploy.ts --network ${network === 'mainnet' ? 'base' : 'baseSepolia'}`,
                    verification ? `npx hardhat verify CONTRACT_ADDRESS --network ${network === 'mainnet' ? 'base' : 'baseSepolia'}` : null
                ].filter(Boolean)
            },
            foundry: {
                setup: `# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"

[rpc_endpoints]
base = "https://mainnet.base.org"
base_sepolia = "https://sepolia.base.org"

[etherscan]
base = { key = "\${BASESCAN_API_KEY}" }
base_sepolia = { key = "\${BASESCAN_API_KEY}" }`,
                deployment: `// Deploy.s.sol
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/YourContract.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        YourContract contract = new YourContract();
        
        console.log("Contract deployed to:", address(contract));
        
        vm.stopBroadcast();
    }
}`,
                commands: [
                    `curl -L https://foundry.paradigm.xyz | bash`,
                    `foundryup`,
                    `forge build`,
                    `forge script script/Deploy.s.sol --rpc-url ${network === 'mainnet' ? 'base' : 'base_sepolia'} --broadcast --verify`,
                    verification ? `forge verify-contract CONTRACT_ADDRESS src/YourContract.sol:YourContract --chain ${network === 'mainnet' ? 'base' : 'base-sepolia'}` : null
                ].filter(Boolean)
            },
            remix: {
                steps: [
                    "Open Remix IDE at https://remix.ethereum.org",
                    "Create your Solidity contract",
                    "Compile with Solidity 0.8.20+",
                    "Go to Deploy & Run tab",
                    `Select 'Injected Provider - MetaMask' and switch to Base ${network}`,
                    "Deploy your contract",
                    verification ? "Use Remix verification plugin or manually verify on Basescan" : "Contract deployed successfully"
                ]
            },
            thirdweb: {
                setup: `npm install @thirdweb-dev/sdk ethers`,
                deployment: `import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const sdk = new ThirdwebSDK("base${network === 'sepolia' ? '-sepolia' : ''}", {
  clientId: process.env.THIRDWEB_CLIENT_ID,
});

// Deploy using thirdweb
const contractAddress = await sdk.deployer.deployContract({
  name: "YourContract",
  primary_sale_recipient: "0x...", // Your address
  voting_token_address: "0x...", // Token address
});`,
                commands: [
                    `npx thirdweb create contract`,
                    `npx thirdweb deploy`,
                    "Follow the CLI prompts to deploy to Base"
                ]
            }
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        tool: guides[tool],
                        network: network,
                        gasPrice: "0.1 gwei (very low on Base)",
                        blockTime: "2 seconds",
                        tips: [
                            "Base has very low gas costs compared to Ethereum",
                            "2-second block times for fast confirmations",
                            "All Ethereum tooling works on Base",
                            "Use Base Sepolia for testing",
                            "Consider using Coinbase Smart Wallet for users"
                        ]
                    }, null, 2)
                }
            ]
        };
    }
    async getBaseBridgeInfo(args) {
        const { bridgeType, includeGas } = GetBaseBridgeInfoSchema.parse(args);
        const bridges = {
            official: {
                "Base Bridge": {
                    url: "https://bridge.base.org",
                    description: "Official Ethereum <> Base bridge",
                    supportedTokens: ["ETH", "USDC", "DAI", "WETH"],
                    depositTime: "~20 minutes",
                    withdrawalTime: "7 days (challenge period)",
                    fees: includeGas ? {
                        deposit: "Ethereum gas + Base gas",
                        withdrawal: "Base gas + Ethereum gas for proving/finalizing"
                    } : "Variable gas fees",
                    security: "Optimistic rollup security model"
                }
            },
            thirdParty: {
                "LayerZero": {
                    url: "https://layerzero.network",
                    description: "Omnichain interoperability protocol",
                    supportedTokens: ["ETH", "USDC", "USDT", "WBTC"],
                    transferTime: "1-20 minutes",
                    fees: includeGas ? "0.1-1% + gas" : "Variable",
                    chains: ["Ethereum", "Arbitrum", "Optimism", "Polygon", "BSC"]
                },
                "Stargate": {
                    url: "https://stargate.finance",
                    description: "Liquidity transport protocol",
                    supportedTokens: ["USDC", "USDT", "ETH"],
                    transferTime: "1-20 minutes",
                    fees: includeGas ? "0.06% + gas" : "Variable",
                    chains: ["Ethereum", "Arbitrum", "Optimism", "Polygon"]
                },
                "Hop Protocol": {
                    url: "https://hop.exchange",
                    description: "Rollup-to-rollup token bridge",
                    supportedTokens: ["ETH", "USDC", "USDT", "DAI"],
                    transferTime: "5-10 minutes",
                    fees: includeGas ? "0.04% + gas" : "Variable",
                    chains: ["Ethereum", "Arbitrum", "Optimism", "Polygon"]
                },
                "Across": {
                    url: "https://across.to",
                    description: "Fast, cheap, and secure bridge",
                    supportedTokens: ["ETH", "USDC", "WETH", "DAI"],
                    transferTime: "1-4 minutes",
                    fees: includeGas ? "Dynamic fees based on demand" : "Variable",
                    chains: ["Ethereum", "Arbitrum", "Optimism", "Polygon"]
                }
            }
        };
        const result = bridgeType === 'all' ? bridges : { [bridgeType]: bridges[bridgeType] };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        bridges: result,
                        recommendations: {
                            largeAmounts: "Use official Base Bridge for maximum security",
                            fastTransfers: "Use Across or Stargate for speed",
                            multichain: "Use LayerZero for multiple destination chains",
                            cheapest: "Official bridge has lowest fees but longest withdrawal time"
                        },
                        security: {
                            official: "Optimistic rollup security - 7 day challenge period",
                            thirdParty: "Various security models - research before large transfers"
                        },
                        gasOptimization: includeGas ? {
                            ethereum: "Bridge during low gas times (weekends, late nights UTC)",
                            base: "Base gas is very cheap (~0.1 gwei)",
                            batching: "Consider batching multiple transactions"
                        } : null
                    }, null, 2)
                }
            ]
        };
    }
    async scrapeBaseDocs(args) {
        const { url, section, depth } = ScrapeBaseDocsSchema.parse(args);
        try {
            const cacheKey = `${url}-${section || 'all'}-${depth}`;
            if (this.documentationCache.has(cacheKey)) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(this.documentationCache.get(cacheKey), null, 2)
                        }
                    ]
                };
            }
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const scrapedData = {
                url,
                timestamp: new Date().toISOString(),
                sections: [],
                navigation: [],
                content: []
            };
            // Extract main navigation
            $('nav a, .nav a, [role="navigation"] a').each((i, element) => {
                const $el = $(element);
                const href = $el.attr('href');
                const text = $el.text().trim();
                if (href && text) {
                    scrapedData.navigation.push({
                        text,
                        href: href.startsWith('http') ? href : `https://docs.base.org${href}`,
                        section: this.categorizeLink(href)
                    });
                }
            });
            // Extract main content sections
            $('h1, h2, h3, h4, h5, h6').each((i, element) => {
                const $el = $(element);
                const text = $el.text().trim();
                const level = parseInt($el[0].tagName.charAt(1));
                const id = $el.attr('id') || text.toLowerCase().replace(/\s+/g, '-');
                scrapedData.sections.push({
                    level,
                    text,
                    id,
                    content: $el.next('p, div, ul, ol').text().trim().substring(0, 500)
                });
            });
            // Extract links within content
            $('main a, .content a, article a').each((i, element) => {
                const $el = $(element);
                const href = $el.attr('href');
                const text = $el.text().trim();
                if (href && text && href.includes('docs.base.org')) {
                    scrapedData.content.push({
                        text,
                        href: href.startsWith('http') ? href : `https://docs.base.org${href}`,
                        context: $el.parent().text().trim().substring(0, 200)
                    });
                }
            });
            // If deep scraping requested and specific section, scrape additional pages
            if (depth === 'deep' && section && section !== 'all') {
                const sectionLinks = scrapedData.navigation.filter(link => link.section === section || link.href.includes(section));
                for (const link of sectionLinks.slice(0, 5)) { // Limit to 5 additional pages
                    try {
                        const pageResponse = await axios.get(link.href);
                        const page$ = cheerio.load(pageResponse.data);
                        const pageData = {
                            url: link.href,
                            title: page$('h1').first().text().trim(),
                            sections: [],
                            content: page$('main, .content, article').text().trim().substring(0, 2000)
                        };
                        page$('h2, h3, h4').each((i, element) => {
                            const $el = page$(element);
                            pageData.sections.push({
                                level: parseInt($el[0].tagName.charAt(1)),
                                text: $el.text().trim(),
                                content: $el.next('p, div').text().trim().substring(0, 300)
                            });
                        });
                        scrapedData.content.push(pageData);
                    }
                    catch (error) {
                        console.error(`Error scraping ${link.href}:`, error.message);
                    }
                }
            }
            // Cache the results
            this.documentationCache.set(cacheKey, scrapedData);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(scrapedData, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to scrape Base documentation: ${error.message}`);
        }
    }
    async searchBaseDocs(args) {
        const { query, section, limit } = SearchBaseDocsSchema.parse(args);
        try {
            const searchResults = {
                query,
                section,
                results: [],
                totalFound: 0
            };
            // Search through cached documentation
            for (const [cacheKey, data] of this.documentationCache.entries()) {
                if (section !== 'all' && !cacheKey.includes(section)) {
                    continue;
                }
                // Search in navigation
                for (const navItem of data.navigation || []) {
                    if (this.matchesQuery(navItem.text, query) || this.matchesQuery(navItem.href, query)) {
                        searchResults.results.push({
                            type: 'navigation',
                            title: navItem.text,
                            url: navItem.href,
                            section: navItem.section,
                            relevance: this.calculateRelevance(navItem.text, query)
                        });
                    }
                }
                // Search in sections
                for (const sectionItem of data.sections || []) {
                    if (this.matchesQuery(sectionItem.text, query) || this.matchesQuery(sectionItem.content, query)) {
                        searchResults.results.push({
                            type: 'section',
                            title: sectionItem.text,
                            level: sectionItem.level,
                            content: sectionItem.content,
                            url: `${data.url}#${sectionItem.id}`,
                            relevance: this.calculateRelevance(`${sectionItem.text} ${sectionItem.content}`, query)
                        });
                    }
                }
                // Search in content
                for (const contentItem of data.content || []) {
                    if ('text' in contentItem && 'href' in contentItem) {
                        // This is a ContentItem
                        if (this.matchesQuery(contentItem.text, query)) {
                            searchResults.results.push({
                                type: 'link',
                                title: contentItem.text,
                                url: contentItem.href,
                                context: contentItem.context,
                                relevance: this.calculateRelevance(contentItem.text, query)
                            });
                        }
                    }
                    else if ('content' in contentItem) {
                        // This is a PageData
                        if (this.matchesQuery(contentItem.content, query) || this.matchesQuery(contentItem.title, query)) {
                            searchResults.results.push({
                                type: 'page',
                                title: contentItem.title,
                                url: contentItem.url,
                                content: contentItem.content.substring(0, 500),
                                relevance: this.calculateRelevance(`${contentItem.title} ${contentItem.content}`, query)
                            });
                        }
                    }
                }
            }
            // Sort by relevance and limit results
            searchResults.results.sort((a, b) => b.relevance - a.relevance);
            searchResults.totalFound = searchResults.results.length;
            searchResults.results = searchResults.results.slice(0, limit);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(searchResults, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to search Base documentation: ${error.message}`);
        }
    }
    categorizeLink(href) {
        if (href.includes('get-started'))
            return 'get-started';
        if (href.includes('base-chain'))
            return 'base-chain';
        if (href.includes('base-account'))
            return 'base-account';
        if (href.includes('base-app'))
            return 'base-app';
        if (href.includes('onchainkit'))
            return 'onchainkit';
        if (href.includes('cookbook'))
            return 'cookbook';
        if (href.includes('learn'))
            return 'learn';
        return 'other';
    }
    matchesQuery(text, query) {
        if (!text)
            return false;
        const normalizedText = text.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        return normalizedText.includes(normalizedQuery) ||
            query.split(' ').some(term => normalizedText.includes(term.toLowerCase()));
    }
    calculateRelevance(text, query) {
        if (!text)
            return 0;
        const normalizedText = text.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        let score = 0;
        // Exact match gets highest score
        if (normalizedText.includes(normalizedQuery)) {
            score += 10;
        }
        // Word matches get points
        const queryWords = query.split(' ');
        for (const word of queryWords) {
            if (normalizedText.includes(word.toLowerCase())) {
                score += 2;
            }
        }
        // Title/heading matches get bonus points
        if (text.length < 100) {
            score *= 1.5;
        }
        return score;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
const server = new BaseMiniKitMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map