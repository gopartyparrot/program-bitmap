//create bitmap
//reset
//inspect
//set_owner

import {
  Program,
  Provider,
  setProvider,
  web3,
  workspace,
} from "@project-serum/anchor";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  initOwnedBitmap,
  inspect,
  mustSwap,
  reset,
  setOwner,
} from "./commands";

setProvider(Provider.local(process.env.RPC_URL));
const program: Program = workspace.ProgramBitmap;

yargs(hideBin(process.argv))
  .command(
    "init <capacity>",
    "init a owned bitmap with capacity",
    (y) => {
      y.positional("capacity", { desc: "capacity of bitmap", type: "number" });
    },
    async (args: { capacity: number }) => {
      await initOwnedBitmap(program, args.capacity);
    }
  )
  .command(
    "inspect <account>",
    "inspect owned bitmap account",
    (y) => {
      y.positional("account", { desc: "owned bitmap account", type: "string" });
    },
    async (args: { account: string }) => {
      await inspect(program, new web3.PublicKey(args.account));
    }
  )
  .command(
    "reset <account>",
    "reset owned bitmap account",
    (y) => {
      y.positional("account", { desc: "owned bitmap account", type: "string" });
    },
    async (args: { account: string }) => {
      await reset(program, new web3.PublicKey(args.account));
    }
  )
  .command(
    "swap <account> <index> <value>",
    "must swap value of $index to $value when it's current value is !$value",
    (y) => {
      y.positional("account", {
        desc: "owned bitmap account",
        type: "string",
      })
        .positional("index", {
          desc: "index",
          type: "number",
          default: 0,
        })
        .positional("value", {
          desc: "new value",
          type: "boolean",
        });
    },
    async (args: { account: string; index: number; value: boolean }) => {
      await mustSwap(
        program,
        new web3.PublicKey(args.account),
        args.index,
        args.value
      );
    }
  )
  .command(
    "inspect <account> <new_owner>",
    "inspect owned bitmap account",
    (y) => {
      y.positional("account", {
        desc: "owned bitmap account",
        type: "string",
      }).positional("new_owner", {
        desc: "owned bitmap account",
        type: "string",
      });
    },
    async (args: { account: string; new_owner: string }) => {
      await setOwner(
        program,
        new web3.PublicKey(args.account),
        new web3.PublicKey(args.new_owner)
      );
    }
  ).argv;
