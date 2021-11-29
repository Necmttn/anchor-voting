import { message } from "antd";
import { Program, Provider, web3, BN } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { AnchorVoting } from "../anchor-voting/target/types/anchor_voting";
import idl from "./idl.json";
import kp from "../keypair.json";
import useSWR, { mutate } from "swr";

export const PROGRAM_ID = new PublicKey(idl.metadata.address);

const { SystemProgram } = web3;
const baseAccount = web3.Keypair.fromSecretKey(
  new Uint8Array(Object.values(kp._keypair.secretKey))
);

const opts: { commitment: Commitment } = {
  commitment: "processed",
};

const getProvider = () => {
  // Set our network to devnet.
  const network = clusterApiUrl("devnet");
  const connection = new Connection(network, opts.commitment);
  const provider = new Provider(connection, (window as any)?.solana, opts);
  return provider;
};

const getNumberBuffer = (total: number, alloc = 8) => {
  const totalProposalAccountBuf = Buffer.alloc(alloc);
  totalProposalAccountBuf.writeUIntLE(total, 0, 6);
  return totalProposalAccountBuf;
};

export const createProposal = async (proposal: {
  title: string;
  description: string;
  timeEnd: number;
}) => {
  const provider = getProvider();
  const program = getProgram();
  const account = await program.account.baseAccount.fetch(
    baseAccount.publicKey
  );
  const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
  const [proposalAccountPublicKey, accountBump] =
    await web3.PublicKey.findProgramAddress(
      [Buffer.from("proposal_account"), proposalId],
      PROGRAM_ID
    );

  await program.rpc.addProposal(
    new BN(accountBump),
    account.totalProposalCount,
    proposal.title,
    proposal.description,
    new BN(proposal.timeEnd),
    {
      accounts: {
        baseAccount: baseAccount.publicKey,
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );
  // refetch the base account
  mutate("/baseAccount");
  mutate("/proposal");
};

export const voteForProposal = async (id: BN, vote: boolean) => {
  const hide = message.loading("Voting in progress..", 0);
  try {
    const provider = getProvider();
    const program = getProgram();

    const [proposalAccountPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("proposal_account"), id.toBuffer()],
      PROGRAM_ID
    );

    const [voteAccountPublicKey, voteBump] =
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          id.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );
    await program.rpc.voteForProposal(voteBump, new BN(id), true, {
      accounts: {
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    mutate("/proposal");
    mutate(`/proposal/${id.toNumber()}`);
    message.success("Voted");
  } catch (err) {
    message.error((err as Error)?.message);
  } finally {
    setTimeout(hide, 100);
  }
};

const getProgram = (): Program<AnchorVoting> => {
  const provider = getProvider();
  const program: Program<AnchorVoting> = new Program(
    idl as any,
    PROGRAM_ID,
    provider
  );
  return program;
};

const programFetcher = async (...args: any[]) => {
  const provider = getProvider();
  const program: Program<AnchorVoting> = new Program(
    idl as any,
    PROGRAM_ID,
    provider
  );
  return program.account.baseAccount.fetch(baseAccount.publicKey);
};

export const useBaseAccount = () => {
  const { data, error } = useSWR(`/baseAccount`, programFetcher);
  return {
    baseAccount: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const createBaseAccountForProposals = async () => {
  try {
    const provider = getProvider();
    const program: Program<AnchorVoting> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );
    await program.rpc.initializeVoting({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    message.success(
      `Created a new BaseAccount w/ address: ${baseAccount.publicKey.toString()}`
    );
    // refetch the base account
    mutate("/baseAccount");
  } catch (e) {
    console.error("Error creating BaseAccount account:", e);
  }
};
