import {
  BN,
  Program,
  Provider,
  setProvider,
  workspace,
} from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";

import assert from "assert";
import { BitmapReader } from "../lib/BitmapReader";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const provider = Provider.env();
setProvider(provider);
const program: Program = workspace.ProgramBitmap;

describe("program-bitmap", () => {
  const oBitmap = Keypair.generate();
  const adminAccounts = {
    accounts: {
      ob: oBitmap.publicKey,
      owner: provider.wallet.publicKey,
    },
  };

  const accountSize = 60;
  const bitmapCapacity = (60 - 44) * 8;

  it("Is initialized!", async () => {
    const txid = await program.rpc.initialize(new BN(bitmapCapacity), {
      accounts: {
        ob: oBitmap.publicKey,
        owner: provider.wallet.publicKey,
      },
      instructions: [
        await program.account.ownedBitmap.createInstruction(
          oBitmap,
          accountSize
        ),
      ],
      signers: [oBitmap],
    });
    console.log("Your transaction signature", txid);

    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.count(true), 0, "all should be false");
  });

  it("it should set success", async () => {
    await program.rpc.set(new BN(1), {
      ...adminAccounts,
    });
    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.read(1), true, "index 1 should be true");
    assert.equal(reader.count(true), 1, "should has 1 true");
  });

  it("it should set should fail when already set", async () => {
    await assert.rejects(async () => {
      await sleep(1 * 1000);
      await program.rpc.set(new BN(1), adminAccounts);
    }, "should failed");
  });

  it("it index overflow", async () => {
    await assert.rejects(async () => {
      await program.rpc.set(999999, adminAccounts);
    }, "should failed for index out of bound/overflow");
  });

  it("close bitmap", async () => {
    let bal = await provider.connection.getBalance(oBitmap.publicKey);
    assert(bal > 0);
    await program.rpc.close({
      accounts: {
        ob: oBitmap.publicKey,
        owner: provider.wallet.publicKey,
        solDest: provider.wallet.publicKey,
      },
    });

    bal = await provider.connection.getBalance(oBitmap.publicKey);
    assert.strictEqual(bal, 0, "lamports should be removed");
  });
});
