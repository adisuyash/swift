import { ccc } from "@ckb-ccc/connector-react";

const MIN_FEE_RATE = 1000n;
const INITIAL_FEE_RATE = 3000n;
const MAX_FEE_ATTEMPTS = 3;

async function buildTransferTransaction(signer, toScript, amountShannon, feeRate) {
  const tx = ccc.Transaction.from({
    outputs: [
      {
        lock: toScript,
        capacity: amountShannon,
      },
    ],
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, feeRate);

  return tx;
}

export async function transferCKB(signer, toAddress, amountCKB) {
  const amountShannon = BigInt(Math.round(Number(amountCKB) * 10 ** 8));
  const to = await ccc.Address.fromString(toAddress, signer.client);
  let feeRate = INITIAL_FEE_RATE;
  let lastFeeError;

  for (let attempt = 0; attempt < MAX_FEE_ATTEMPTS; attempt += 1) {
    const tx = await buildTransferTransaction(
      signer,
      to.script,
      amountShannon,
      feeRate,
    );
    const signedTx = await signer.signTransaction(tx);
    const actualFee = await signedTx.getFee(signer.client);
    const requiredFee = signedTx.estimateFee(MIN_FEE_RATE);

    if (actualFee >= requiredFee) {
      return signer.client.sendTransaction(signedTx);
    }

    const feeScale =
      actualFee === 0n
        ? 2n
        : (requiredFee + actualFee - 1n) / actualFee;

    feeRate = feeRate * (feeScale > 1n ? feeScale : 2n) + MIN_FEE_RATE;
    lastFeeError = new Error(
      `Signed transaction fee ${actualFee} shannons is below the required minimum ${requiredFee} shannons.`,
    );
  }

  throw (
    lastFeeError ||
    new Error("Unable to assemble a transaction with sufficient fee.")
  );
}
