const { Liquidity, Token, TokenAmount, Percent, SPL_ACCOUNT_LAYOUT, BigNumberish, TxVersion } = require( "@raydium-io/raydium-sdk");
const dotenv = require("dotenv");
const {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  getMint,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  transferChecked,
  transfer,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountIdempotentInstruction,
} = require("@solana/spl-token");
const bs58 = require('bs58');

dotenv.config();

const REWARD_TOKEN = process.env.TOKEN_ADDRESS

const { PublicKey, Keypair, Connection, Transaction } = require('@solana/web3.js');
const { verify_key, getPubKey } = require("./web3");

/** Address of the SPL Token program */
// const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
/** Address of the SPL Token 2022 program */
// const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
/** Address of the SPL Associated Token Account program */
// const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
/** Address of the special mint for wrapped native SOL in spl-token */
// const NATIVE_MINT = new PublicKey('So11111111111111111111111111111111111111112');
/** Address of the special mint for wrapped native SOL in spl-token-2022 */
const NATIVE_MINT_2022 = new PublicKey('9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP');


let latestBlockHash = "";
let latestBlockHashDate = 0;
async function getLatestBlockHash() {
  if (Date.now() - latestBlockHashDate > 10000) {
    latestBlockHash = (await G.conn().getLatestBlockhash()).blockhash;
    latestBlockHashDate = Date.now();
  }
  return latestBlockHash;
}

async function transfer_token(conn, payer, receiver, token, amount) {
  G.log("❔ reward token should trasfered to", payer.publicKey.toBase58());
  try {
    const mint = new PublicKey(token);
    const fromATA = getAssociatedTokenAddressSync(mint, payer.publicKey);
    const toATA = getAssociatedTokenAddressSync(mint, receiver);

    let instructions = [];
    const info = await conn.getAccountInfo(toATA);
    if (!info) {
      instructions.push(createAssociatedTokenAccountInstruction(payer.publicKey, toATA, receiver, mint));
    }
    instructions.push(createTransferInstruction(fromATA, toATA, payer.publicKey, amount));
    const tx = new Transaction().add(...instructions);
    await sendAndConfirmTransaction(conn, tx, [payer]);
    G.log("✅ reward token trasfered", payer.publicKey.toBase58(), tx.signatures[0].signature);
    return true;
  } catch (err) {
    // G.log(err);
  }
  return false;
}

async function getTokenDecimals(tokenAddress) {
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=5c2e7676-8a44-414f-9ea6-97004d81bcb8'); // or a testnet endpoint
  const mintPublicKey = new PublicKey(tokenAddress);

  const mintInfo = await getMint(connection, mintPublicKey);
  return mintInfo.decimals;

    // console.log(`Decimals: ${mintInfo.decimals}`);
}

async function transferToken(conn, senderPrivKey, receiverPubKey, tokenAddress, amount) {
  // console.log("transferToken");
  // console.log("------");
  // console.log(receiverPubKey, "---",amount);
  
  try {
    const privKeyBytes = bs58.decode(senderPrivKey)
    
    if (privKeyBytes.length !== 64) {
      throw new Error('Invalid private key length. It must be 64 bytes.');
    }
    const senderKeyPair = Keypair.fromSecretKey(privKeyBytes);
    // const pubkey = await getPubKey(senderPrivKey);
    // if(pubkey != senderKeyPair.publicKey.toBase58()) {
    //   console.log("Invalid key format!");
    // } 
    // console.log(pubkey);
    
    // console.log(senderKeyPair.publicKey.toBase58());
    
    console.log("❔ reward token should trasfered to", senderKeyPair.publicKey.toBase58());
    // Define the recipient's public key
    const recvPubKey = new PublicKey(receiverPubKey);

    // Token mint address (the token you want to transfer)
    const tokenPubKey = new PublicKey(tokenAddress);

    // Get or create the associated token account for the sender
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      conn,
      senderKeyPair,  // Payer for transaction
      tokenPubKey,  // Token mint address
      senderKeyPair.publicKey  // Owner of the sender token account
    );
    
    let recvTokenAddress = await getAssociatedTokenAddress(
			tokenPubKey,
			recvPubKey
		);
    
    const recvTokenAccountInfo = await conn.getAccountInfo(recvTokenAddress);
  
    if (!recvTokenAccountInfo) {
			console.log('Creating associated token account for receiver...');

      const createAssocTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
        senderKeyPair.publicKey, // The wallet funding the account creation
        recvTokenAddress,        // The newly created token account
        recvPubKey,              // The receiver's public key
        tokenPubKey              // The mint address of the token
      );
      
      const transaction = new Transaction().add(createAssocTokenAccountIx);

      // Send the transaction
      const signature = await conn.sendTransaction(transaction, [senderKeyPair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await conn.confirmTransaction(signature, 'confirmed');
      console.log('Associated token account created:', signature);
    } else {
      console.log('Associated token account already exists.');
    }
    // decimal = await getTokenDecimals(tokenAddress);
    // console.log("decimal", decimal);
    // Transfer tokens from sender to recipient
    const decimal = await getTokenDecimals(tokenAddress);
    console.log("decimal = ", decimal);
    transAmount = amount * 10 ** decimal;
    console.log("tamount = ", transAmount);
    const transactionSignature = await transfer(
      conn,  // Solana connection
      senderKeyPair,  // Sender's keypair (signer)
      senderTokenAccount.address,  // Sender's token account
      recvTokenAddress,  // Recipient's token account
      senderKeyPair,  // Signer
      transAmount // Amount of tokens to transfer (in smallest unit of token, typically "mint decimals")
    );

    console.log('Transaction successful with signature:', transactionSignature);

    console.log("✅ reward token trasfered", recvPubKey.toBase58(), transactionSignature);
    return true;
    
  } catch (err) {
    // G.log(err);
    console.log("error ==========", err)
  }
  return false;
}


const getWalletTokenAccount = async (conn, wallet, isToken2022 = true) => {
  // assert(conn);
  const walletTokenAccount = await conn.getTokenAccountsByOwner(wallet, {
    programId: isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
  });

  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
};

const getWalletTokenBalance = async (conn, wallet, mint, decimal = 0) => {
  const walletTokenAccounts = await getWalletTokenAccount(conn, new PublicKey(wallet), false);
  console.log("Wallet Addresss =====", wallet)
  let tokenBalance = 0;
  if (walletTokenAccounts && walletTokenAccounts.length > 0) {
    for (const acc of walletTokenAccounts) {
      if (acc.accountInfo.mint.toBase58() === mint) {
        if (!decimal) decimal = (await getMint(conn, new PublicKey(mint))).decimals;
        tokenBalance = Number(acc.accountInfo.amount) / 10 ** decimal;
        break;
      }
    }
  }
  return tokenBalance;
};

const getWalletSOLBalance_bn = async (conn, wallet) => {
  try {
    let balance = await conn.getBalance(new PublicKey(wallet));
    return balance;
  } catch (error) {
    // G.log(error);
  }
  return BigInt(0);
};

const getWalletSOLBalance = async (conn, wallet) => {
  try {
    let balance = (await conn.getBalance(new PublicKey(wallet))) / LAMPORTS_PER_SOL;
    return balance;
  } catch (error) {
    // G.log(error);
  }
  return 0;
};


module.exports = {
  REWARD_TOKEN,
  getLatestBlockHash,
  transfer_token,
  transferToken,
  getWalletTokenAccount,
  getWalletTokenBalance,
  getWalletSOLBalance_bn,
  getWalletSOLBalance
};