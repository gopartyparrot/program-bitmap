import {
  Program,
  Provider,
  setProvider,
  workspace,
} from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";

import assert from "assert";
import { BitmapReader } from "../lib/BitmapReader";

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

  it("Is initialized!", async () => {
    const txid = await program.rpc.initialize({
      accounts: {
        ob: oBitmap.publicKey,
        owner: provider.wallet.publicKey,
      },
      instructions: [
        await program.account.ownedBitmap.createInstruction(oBitmap, 60),
      ],
      signers: [oBitmap],
    });
    console.log("Your transaction signature", txid);

    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.count(true), 0, "all should be false");
  });

  it("it must swap should fail", async () => {
    await assert.rejects(async () => {
      await program.rpc.mustSwap({ index: 0, value: false }, adminAccounts);
    }, "should failed");
  });

  it("it must swap", async () => {
    await program.rpc.mustSwap(
      { index: 1, value: true },
      {
        ...adminAccounts,
        instructions: [await program.instruction.reset(adminAccounts)],
      }
    );
    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.read(1), true, "index 1 should be true");
    assert.equal(reader.count(true), 1, "should has 1 true");
  });
  it("it must swap batch", async () => {
    await program.rpc.mustSwapBatch(
      [
        { index: 1, value: true },
        { index: 3, value: true },
      ],
      {
        ...adminAccounts,
        instructions: [await program.instruction.reset(adminAccounts)],
      }
    );
    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.read(1), true, "index 1 should be true");
    assert.equal(reader.read(3), true, "index 3 should be true");
    assert.equal(reader.count(true), 2, "should has 2 true");
  });

  it("it set success", async () => {
    await program.rpc.set(
      { index: 4, value: true },
      {
        ...adminAccounts,
        instructions: [await program.instruction.reset(adminAccounts)],
      }
    );
    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.read(4), true, "index 4 should be true");
    assert.equal(reader.count(true), 1, "should has 1 true");
  });

  it("it set batch success", async () => {
    await program.rpc.setBatch(
      [
        { index: 2, value: false },
        { index: 5, value: true },
        { index: 7, value: true },
        { index: 8, value: true },
      ],
      {
        ...adminAccounts,
        instructions: [await program.instruction.reset(adminAccounts)],
      }
    );
    const state = await program.account.ownedBitmap.fetch(oBitmap.publicKey);
    const reader = BitmapReader.from(state["bitmap"]);
    assert.equal(reader.read(5), true, "index 5 should be true");
    assert.equal(reader.read(7), true, "index 7 should be true");
    assert.equal(reader.read(8), true, "index 8 should be true");
    assert.equal(reader.count(true), 3, "should has 3 true");
  });

  it("it index overflow", async () => {
    await assert.rejects(async () => {
      await program.rpc.set({ index: 999999, value: true }, adminAccounts);
    }, "should failed for index out of bound/overflow");
  });

  it("set owner", async () => {
    const newOwner = Keypair.generate();
    await program.rpc.setOwner({
      accounts: { ...adminAccounts.accounts, newOwner: newOwner.publicKey },
    });
    const state: any = await program.account.ownedBitmap.fetch(
      oBitmap.publicKey
    );
    assert.equal(state.owner.toBase58(), newOwner.publicKey.toBase58());
  });
});
