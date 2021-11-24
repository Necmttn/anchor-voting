import Wallet from "@project-serum/sol-wallet-adapter";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import { Schema, serialize } from "borsh";

const CLUSTER = clusterApiUrl("devnet");
const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID as string);
const connection = new Connection(CLUSTER, "confirmed");
const wallet = new Wallet("https://www.sollet.io", CLUSTER);
