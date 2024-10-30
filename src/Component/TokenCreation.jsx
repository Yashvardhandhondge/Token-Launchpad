import { useState } from "react";
import {
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  ExtensionType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

export function TokenLaunch() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [uri, setUri] = useState('');
  const [initialSupply, setInitialSupply] = useState(0);
  const [decimals, setDecimals] = useState(9);
  const [description, setDescription] = useState('');
  const [isMintable, setIsMintable] = useState(true);

  async function createToken() {
    const mintKeypair = Keypair.generate();
    const metadata = {
      mint: mintKeypair.publicKey,
      name: name,
      symbol: symbol,
      uri: uri,
      description: description,
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metedataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metedataLen);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,  // Fixed capitalization here
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    try {
      await wallet.sendTransaction(transaction, connection);
    } catch (error) {
      console.error("Transaction error:", error);
      return;
    }

    const associatedToken = getAssociatedTokenAddressSync(mintKeypair.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    try {
      await wallet.sendTransaction(transaction2, connection);
    } catch (error) {
      console.error("Transaction error:", error);
      return;
    }

    if (isMintable) {
      const parsedSupply = parseInt(initialSupply || "0", 10); // Parse the initial supply

      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          parsedSupply * 1e9, // Ensure the value is a number
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      try {
        await wallet.sendTransaction(transaction3, connection);
      } catch (error) {
        console.error("Transaction error:", error);
        return;
      }
    }

    console.log('Token created successfully');
  }

  return (
    <div className="ml-[100px]">
      <div className="flex">
        <div>
          <p className="text-white text-4xl font-serif mt-16 mr ">Solana Token Creator</p>
          <p className="text-white mt-5 font-serif text-base">The perfect Tool to create Solana Spl Tokens</p>
          <p className="text-white font-serif text-base">Simple, user friendly, and fast.</p>
          <div className="box border flex shadow items-start border-solid rounded bg-[#110d36] h-[500px] w-[700px] border-purple-600">
            <div>
              <p className="text-white font-serif text-lg ml-[30px]">Name</p>
              <input
                type="text"
                placeholder="Token Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 bg-purple-900 font-serif px-4 w-[250px] py-3 rounded-full p-4 ml-[20px]"
              />
              <p className="text-white font-serif text-lg mt-[5px] ml-[30px]">Symbol</p>
              <input
                type="text"
                placeholder="Token Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="mt-2 bg-purple-900 font-serif px-4 py-3 rounded-full w-[250px] p-4 ml-[20px]"
              />
              <p className="text-white font-serif text-lg mt-[5px] ml-[30px]">Uri</p>
              <input
                type="text"
                placeholder="Uri"
                value="https://cdn.100xdevs.com/metadata.json"
                onChange={(e) => setUri(e.target.value)}
                className="mt-2 bg-purple-900 font-serif px-4 py-4 rounded-full w-[250px] ml-[20px]"
              />

              <label className="text-xl mt-5 px-2 font-serif py-1 border border-solid border-purple-900 bg-purple-900 rounded-full flex text-purple-400 ml-[20px] ">
                <input
                  type="checkbox"
                  checked={isMintable}
                  onChange={() => setIsMintable(!isMintable)}
                  className="text-3xl font-serif h-10"
                />
                <p className="mt-[4px] ml-[10px] font-serif">Mintable</p>
              </label>
            </div>
            <button
              onClick={createToken}
              className="text-xl flex h-16 w-[400px] font-serif mt-[380px] border border-solid bg-purple-900 px-4 py-3 rounded"
            >
              <p>Create</p> Token
            </button>
            <div className="mr-52">
              <p className="text-white font-serif text-lg mt-[px] ml-[20px]">Supply</p>
              <input
                type="text"
                placeholder="Initial Supply"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                className="mt-2 bg-purple-900 px-4 py-3 rounded-full w-[250px] p-4 ml-[10px]"
              />
              <p className="text-white font-serif text-lg mt-[5px] ml-[20px]">Decimals</p>
              <input
                type="text"
                placeholder="Decimals"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="mt-2 bg-purple-900 font-serif px-4 py-3 rounded-full w-[250px] p-4 ml-[10px]"
              />
              <p className="text-white font-serif text-lg mt-[5px] ml-[20px]">Description</p>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 bg-purple-900 px-8 py-10 rounded-3xl w-[250px] h-[120px] p-4 ml-[10px]"
              />
            </div>
          </div>
        </div>
      
      <div className="flex text-white ml-[20px] mt-[70px] font-serif flex-col gap-5 mb-10">
        <h1 className="text-4xl font-bold">Create Solana Token</h1>
        <p className="text-base">Effortlessly create your Solana SPL Token with our 7+1 step process – no coding required.</p>
        <p className="text-base">Customize your Solana Token exactly the way you envision it. Less than 5 minutes, at an affordable cost.</p>
        <br />
        <h1 className="text-3xl">How to use Solana Token Creator</h1>
        <p>1. Connect your Solana wallet.</p>
        <p>2. Specify the desired name for your Token.</p>
        <p>3. Set your Token Symbol.</p>
        <p>4. Paste the link of your Token's metadata.</p>
        <p>5. Set the Initial Supply and Decimals.</p>
        <p>6. Toggle if you want it to be Mintable.</p>
        <p>7. Click Create to initiate the token creation process.</p>
      </div>
    </div>
    </div>
  );
}
