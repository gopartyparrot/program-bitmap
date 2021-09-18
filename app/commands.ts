import { web3, Program, Provider } from "@project-serum/anchor";
import { BitmapReader } from "../lib/BitmapReader";

// ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts init 123
export async function initOwnedBitmap(program: Program, capacity: number) {
  const oBitmap = web3.Keypair.generate();
  console.log("your bitmap address will be", oBitmap.publicKey.toBase58());
  const accountSize = Math.ceil(capacity / 8) + 45;
  console.log("capacity:", capacity, " account size: ", accountSize);

  const txid = await program.rpc.initialize({
    accounts: {
      ob: oBitmap.publicKey,
      owner: program.provider.wallet.publicKey,
    },
    instructions: [
      await program.account.ownedBitmap.createInstruction(oBitmap, accountSize),
    ],
    signers: [oBitmap],
  });
  console.log("Your transaction signature", txid);
}

export async function inspect(
  program: Program,
  ownedBitmapAddress: web3.PublicKey
) {
  const state = await program.account.ownedBitmap.fetch(ownedBitmapAddress);
  const reader = BitmapReader.from(state["bitmap"]);
  console.log("owner", state["owner"].toBase58());
  console.log("capacity", reader.capacity());
  console.log("true count", reader.count(true));
  console.log("values", reader.valuesUtil(reader.capacity()));
}

export async function reset(
  program: Program,
  ownedBitmapAddress: web3.PublicKey
) {
  const txid = await program.rpc.reset({
    accounts: {
      ob: ownedBitmapAddress,
      owner: program.provider.wallet.publicKey,
    },
  });
  console.log("reset txid", txid);
  console.log("you can inspect now");
}

export async function setOwner(
  program: Program,
  ownedBitmapAddress: web3.PublicKey,
  newOwner: web3.PublicKey
) {
  console.log(
    "set new owner",
    ownedBitmapAddress.toBase58(),
    newOwner.toBase58()
  );
  const txid = await program.rpc.setOwner({
    accounts: {
      ob: ownedBitmapAddress,
      owner: program.provider.wallet.publicKey,
      newOwner,
    },
  });
  console.log("set new owner txid", txid);
}
