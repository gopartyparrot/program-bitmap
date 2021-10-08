import {
  Program,
  Provider,
  setProvider,
  web3,
  workspace,
} from "@project-serum/anchor";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { initOwnedBitmap, inspect, setIndex, close } from "./commands";

import idl from "./idl.json";

const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);

function getProgram(): Program {
  const provider = Provider.local(process.env.RPC_URL);
  return new Program(idl as any, PROGRAM_ID, provider);
}

yargs(hideBin(process.argv))
  .command(
    "init <capacity>",
    "init a owned bitmap with capacity",
    (y) => {
      y.positional("capacity", { desc: "capacity of bitmap", type: "number" });
    },
    async (args: { capacity: number }) => {
      await initOwnedBitmap(getProgram(), args.capacity);
    }
  )
  .command(
    "inspect <account>",
    "inspect owned bitmap account",
    (y) => {
      y.positional("account", { desc: "owned bitmap account", type: "string" });
    },
    async (args: { account: string }) => {
      await inspect(getProgram(), new web3.PublicKey(args.account));
    }
  )
  .command(
    "close <account>",
    "close owned bitmap account",
    (y) => {
      y.positional("account", { desc: "owned bitmap account", type: "string" });
    },
    async (args: { account: string }) => {
      await close(getProgram(), new web3.PublicKey(args.account));
    }
  )
  .command(
    "set <account> <index>",
    "set value of index to true ",
    (y) => {
      y.positional("account", {
        desc: "owned bitmap account",
        type: "string",
      }).positional("index", {
        desc: "index",
        type: "number",
        default: 0,
      });
    },
    async (args: { account: string; index: number }) => {
      await setIndex(
        getProgram(),
        new web3.PublicKey(args.account),
        args.index
      );
    }
  ).argv;
