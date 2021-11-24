import Link from "next/link";
import { useRouter } from "next/router";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";

export const Navbar = () => {
  return (
    <div className="mb-2 shadow-lg bg-neutral text-neutral-content rounded-box  flex flex-row rounded bg-gray-400 items-center">
      <div className="px-2 mx-2 ">
        <span className="text-lg font-bold">SOL $CROWD</span>
      </div>
      <div className="px-2 mx-2 navbar-center lg:flex ">
        <div className="flex items-stretch ">
          <NavButton href={"/"} text={"Home"} />
          <NavButton href={"/create"} text={"Create"} />
        </div>
        <div className={"flex flex-end ml-auto"}>
          <WalletMultiButton />
          <WalletDisconnectButton />
        </div>
      </div>
    </div>
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
