import Link from "next/link";
import { useRouter } from "next/router";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";

export const Navbar = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 bg-gray-400 rounded shadow-lg bg-neutral text-neutral-content rounded-box">
        <div className="px-2 mx-2 ">
          <span className="text-lg font-bold">ANCHOR VOTING</span>
        </div>
        <div className={"w-40"}>
          <WalletMultiButton />
        </div>
      </div>
    </>
  );
};

const NavButton = ({ href, text }: { href: string; text: string }) => {
  const { asPath } = useRouter();
  const active = asPath === href;
  return (
    <Link href={href} passHref>
      <a
        className={`btn ${
          active ? "btn-primary" : "btn-ghost"
        } btn-sm rounded-btn`}
      >
        {text}
      </a>
    </Link>
  );
};
