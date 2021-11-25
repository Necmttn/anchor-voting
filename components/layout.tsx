import { Navbar } from "./navbar";
import { RequestAirdrop } from "./requestAirdrop";

export const Layout: React.FC = ({ children }) => {
  return (
    <main
      className={
        "flex flex-col items-center w-screen py-4 px-2 sm:px-none min-h-screen"
      }
    >
      <div className={"w-full max-w-5xl mb-4"}>
        <Navbar />
      </div>
      <div className={"w-full max-w-5xl"}>{children}</div>
      <div className={"absolute bottom-0 left-0 h-16 w-16"}>
        <RequestAirdrop />
      </div>
    </main>
  );
};
