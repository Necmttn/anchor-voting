import type { AppProps } from "next/app";
import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import { Cluster, Keypair } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-ant-design";

import { GlobalContext } from "../context";
import { Layout } from "../components/layout";

import "../styles/globals.css";
require("@solana/wallet-adapter-ant-design/styles.css");

const WalletConnectionProvider = dynamic<{ children: ReactNode }>(
  () =>
    import("../context/WalletConnectionProvider").then(
      ({ WalletConnectionProvider }) => WalletConnectionProvider
    ),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  const [network, setNetwork] = useState<Cluster | undefined>("devnet");
  const [account, setAccount] = useState<Keypair | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  return (
    <GlobalContext.Provider
      value={{
        network,
        setNetwork,
        account,
        setAccount,
        mnemonic,
        setMnemonic,
        balance,
        setBalance,
      }}
    >
      <WalletConnectionProvider>
        <WalletModalProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WalletModalProvider>
      </WalletConnectionProvider>
    </GlobalContext.Provider>
  );
}

export default MyApp;
