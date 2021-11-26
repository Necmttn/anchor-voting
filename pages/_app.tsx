import type { AppProps } from "next/app";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { WalletModalProvider } from "@solana/wallet-adapter-ant-design";

import { Layout } from "../components/layout";

require("@solana/wallet-adapter-ant-design/styles.css");
import "../styles/globals.css";

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
  return (
    <WalletConnectionProvider>
      <WalletModalProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WalletModalProvider>
    </WalletConnectionProvider>
  );
}

export default MyApp;
