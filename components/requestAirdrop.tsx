import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import React, { FC, useCallback, useEffect, useState } from "react";
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

  const [balance, setBalance] = useState(0);
  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((val) => {
        setBalance(val);
      });
    }
  }, [publicKey, connection, loading]);

  return (
    <>
      <div className={"text-lg font-bold inline-flex"}>
        <span className={"text-xl"}>◎</span>{" "}
        <span>{balance / LAMPORTS_PER_SOL}</span>
      </div>
      <Button
        color="secondary"
        onClick={onClick}
        disabled={!publicKey}
        loading={loading}
      >
        ⛽️ Request Airdrop
      </Button>
    </>
  );
};
