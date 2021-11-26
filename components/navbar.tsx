import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";

export const Navbar = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 bg-gray-400 rounded shadow-lg bg-neutral text-neutral-content rounded-box">
        <div className="px-2 mx-2 ">
          <span className="text-lg font-bold">ANCHOR VOTING</span>
        </div>
        <div className={"flex space-x-1"}>
          <WalletMultiButton />
          <WalletDisconnectButton />
        </div>
      </div>
    </>
  );
};
