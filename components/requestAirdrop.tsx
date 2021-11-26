import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { FC, useCallback, useState } from "react";
import { Button, message } from "antd";

export const RequestAirdrop: FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    setLoading(true);
    if (!publicKey) {
      message.error("Wallet not connected!");
      return;
    }

    let signature: TransactionSignature = "";
    try {
      signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      message.info(`Airdrop requested: ${signature}`);
      await connection.confirmTransaction(signature, "processed");
      message.success(`Airdrop successful!: ${signature}`);
    } catch (error: any) {
      message.error(`Airdrop failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  return (
    <Button
      color="secondary"
      onClick={onClick}
      disabled={!publicKey}
      loading={loading}
    >
      ⛽️ Request Airdrop
    </Button>
  );
};
