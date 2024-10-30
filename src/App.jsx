import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"; 
import { clusterApiUrl } from "@solana/web3.js";
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletConnectButton, WalletModalProvider, WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';
import { TokenLaunch } from "./Component/TokenCreation";
import { useMemo, useState } from "react";
import Text from "./Component/text";
function App() {
  const [token, setToken] = useState(null);
  const network = WalletAdapterNetwork.Devnet; 
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div className="bg-gradient-to-r from-[#110d36] to-purple-800   h-[1200px] ">

    <ConnectionProvider endpoint="https://solana-devnet.g.alchemy.com/v2/DEhoo-faZJyJO03UWMXSsKycjKrK_w9G">
      <WalletProvider wallets={[new UnsafeBurnerWalletAdapter()]} autoConnect>
        <WalletModalProvider  className=" mt-1ml-[900px]  text-blue-400">
        <div className="flex ">
        <WalletMultiButton className="mt-2 ml-auto mr-auto bg-[] text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300" />
        <WalletDisconnectButton />
        </div>
        <TokenLaunch/>
        <Text/>
        </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
    
    </div>
  );
}

export default App;
