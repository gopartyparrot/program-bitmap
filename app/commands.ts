import { web3, Program, Provider, BN } from "@project-serum/anchor";
import { BitmapReader } from "../lib/BitmapReader";

// ANCHOR_WALLET=~/.config/solana/id.json RPC_URL=https://api.devnet.solana.com ts-node app/cli.ts init 48
export async function initOwnedBitmap(program: Program, capacity: number) {
  // console.log(`Errors: 0xa4: maybe capacity too large`);
  console.log("program:", program.programId.toBase58());

  if (capacity % 8 !== 0) {
    throw Error("capacity must be 8x");
  }

  const oBitmap = web3.Keypair.generate();
  const accountSize = Math.ceil(capacity / 8) + 45;

  console.log("your bitmap address will be", oBitmap.publicKey.toBase58());
  console.log("capacity:", capacity, " account size: ", accountSize);

  const txid = await program.rpc.initialize(new BN(capacity), {
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

export async function setIndex(
  program: Program,
  ownedBitmapAddress: web3.PublicKey,
  index: number
) {
  await program.rpc.set(new BN(index), {
    accounts: {
      ob: ownedBitmapAddress,
      owner: program.provider.wallet.publicKey,
    },
  });
}

export async function close(
  program: Program,
  ownedBitmapAddress: web3.PublicKey
) {
  const txid = await program.rpc.close({
    accounts: {
      ob: ownedBitmapAddress,
      owner: program.provider.wallet.publicKey,
      solDest: program.provider.wallet.publicKey,
    },
  });
  console.log("close txid", txid);
}
