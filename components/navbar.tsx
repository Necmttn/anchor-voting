import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";

export const Navbar = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between p-2 mb-2 bg-white rounded shadow-lg bg-neutral text-neutral-content rounded-box">
        <div className="px-2 mx-2 ">
          <span className="text-lg font-bold">ANCHOR VOTING</span>
        </div>
        <div className={"flex space-x-1 text-black hack"}>
          <WalletMultiButton />
          <WalletDisconnectButton />
        </div>
        <style>
          {`
          .hack > .ant-btn {
            width: 170px;
            display: flex;
          }
          `}
        </style>
      </div>
    </>
  );
};
