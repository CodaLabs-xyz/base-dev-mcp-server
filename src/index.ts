#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

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

class BaseMiniKitMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'base-minikit-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
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
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        );
      }
    });
  }

  private async getBaseOverview(args: any) {
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
    } else {
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

  private async getSmartWalletQuickstart(args: any) {
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

  private async getSmartWalletConcepts(args: any) {
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
    } else {
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

  private async getSmartWalletGuides(args: any) {
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
    } else {
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

  private async getMiniKitGuides(args: any) {
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
    } else {
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

  private async generateProjectTemplate(args: any) {
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

  private async getNetworkConfig() {
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

  private async getDevelopmentTools() {
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new BaseMiniKitMCPServer();
server.run().catch(console.error);