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
import * as bs58 from "bs58";

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
  console.log("ACCOUNT", account);
  const proposalId = getNumberBuffer(account.totalProposalCount.toNumber());
  const [proposalAccountPublicKey, accountBump] =
    await web3.PublicKey.findProgramAddress(
      [Buffer.from("proposal_account"), proposalId],
      PROGRAM_ID
    );

  console.log("PROPOSAL ID", {
    proposalId,
    proposalAccountPublicKey,
    accountBump,
  });
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

    const proposalId = getNumberBuffer(id.toNumber());
    const [proposalAccountPublicKey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("proposal_account"), proposalId],
      PROGRAM_ID
    );

    const [voteAccountPublicKey, voteBump] =
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from("vote_account"),
          proposalId,
          provider.wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );
    await program.rpc.voteForProposal(voteBump, new BN(id), vote, {
      accounts: {
        proposal: proposalAccountPublicKey,
        user: provider.wallet.publicKey,
        vote: voteAccountPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    mutate("/proposal");
    mutate(`/proposal/${id.toNumber()}`);
    mutate(`/proposal/${id.toNumber()}/votes`);
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

export const useBaseAccount = () => {
  const programFetcher = async (...args: any[]) => {
    const provider = getProvider();
    const program: Program<AnchorVoting> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );
    return program.account.baseAccount.fetch(baseAccount.publicKey);
  };
  const { data, error } = useSWR(`/baseAccount`, programFetcher);
  return {
    baseAccount: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useProposaList = () => {
  const proposalListFetcher = async (...args: any[]) => {
    const provider = getProvider();
    const program: Program<AnchorVoting> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );
    return await program.account.proposal.all();
  };
  const { data, error } = useSWR(`/proposal`, proposalListFetcher);
  return {
    proposalList: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useProposal = (id: number) => {
  const proposalFetcher = async (...args: any[]) => {
    const provider = getProvider();
    const program: Program<AnchorVoting> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );
    return await program.account.proposal.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(getNumberBuffer(id)),
        },
      },
    ]);
  };

  const { data, error } = useSWR(`/proposal/${id}`, proposalFetcher);
  return {
    proposal: data && data[0],
    isLoading: !error && !data,
    isError: error,
  };
};

export const useVotesForProposal = (id: BN) => {
  const proposalVotesFetcher = async (...args: any[]) => {
    const provider = getProvider();
    const program: Program<AnchorVoting> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );
    return await program.account.vote.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: bs58.encode(getNumberBuffer(id.toNumber())),
        },
      },
    ]);
  };
  const { data, error } = useSWR(
    `/proposal/${id.toNumber()}/votes`,
    proposalVotesFetcher
  );
  return {
    voters: data,
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
