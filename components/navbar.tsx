import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";
import Link from "next/link";

export const Navbar = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between p-2 mb-2 bg-white rounded shadow-lg bg-neutral text-neutral-content rounded-box">
        <div className="px-2 mx-2 ">
          <Link href="/" passHref>
            <span className="text-lg font-bold cursor-pointer">
              ANCHOR VOTING
            </span>
          </Link>
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
