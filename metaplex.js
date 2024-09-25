const { Metaplex } = require("@metaplex-foundation/js");
const { Connection, PublicKey } = require("@solana/web3.js");
const axios = require("axios");

// Connect to the Solana network
// const conn = new Connection("https://mainnet.helius-rpc.com/?api-key=b37551ba-445e-4ad2-82d5-404918c03cc8");
const owner = "7GrU15pFFsWvJvNyihX9nvuCBDYumYjbd8WFsQWkd9G6";
// getNFTswithImage(conn, owner).then((nfts) => console.log(nfts));


async function getMeta(conn, token) {
  try {
    // const metaplex = Metaplex.make(conn);
    const metaplex = new Metaplex(conn);
    const mintAddress = new PublicKey(token);
    const metadataAccount = metaplex.nfts().pdas().metadata({ mint: mintAddress });

    const metadataAccountInfo = await conn.getAccountInfo(metadataAccount);

    if (metadataAccountInfo) {
      const meta = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
      return {
        address: meta.metadataAddress.toBase58(),
        mintAddress: token,
        mint: meta.mint,
        updateAuthorityAddress: meta.updateAuthorityAddress.toBase58(),
        // json: meta.json ? JSON.stringify(meta.json) : "",
        json: meta.json,
        jsonLoaded: meta.jsonLoaded,
        name: meta.name,
        symbol: meta.symbol,
        uri: meta.uri,
        isMutable: meta.isMutable,
        primarySaleHappened: meta.primarySaleHappened,
        sellerFeeBasisPoints: meta.sellerFeeBasisPoints,
        editionNonce: meta.editionNonce,
        creators: meta.creators,
        tokenStandard: meta.tokenStandard,
        collection: meta.collection,
        collectionDetails: meta.collectionDetails,
        uses: meta.uses,
        compression: meta.compression,
      };
    }
  } catch (err) {
    // G.log("❗ get meta failed", err);
  }
  return null;
}

async function getImageUrlFromMetadataUri(metadataUri) {
  try {
    // Fetch the metadata JSON
    // const response = await fetch(metadataUri);
    const response = await axios.get(metadataUri)
    // console.log("response====", response)
    const metadata = response.data;

    // Extract the image URL
    const imageUrl = metadata.image;

    // Some NFTs use 'image_url' instead of 'image'
    if (!imageUrl && metadata.image_url) {
      return metadata.image_url;
    }

    // Handle IPFS URLs
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
    }

    return imageUrl;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

async function getNFTsForOwner(conn, owner) {
  try {
    const metaplex = Metaplex.make(conn);
    const ownerPublicKey = new PublicKey(owner);
    const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPublicKey });
    // Process and return the NFTs
    return nfts.map(meta => ({
      address: meta.address.toString(),
      name: meta.name,
      symbol: meta.symbol,
      uri: meta.uri,
      isMutable: meta.isMutable,
      primarySaleHappened: meta.primarySaleHappened,
      sellerFeeBasisPoints: meta.sellerFeeBasisPoints,
      editionNonce: meta.editionNonce,
      creators: meta.creators,
      tokenStandard: meta.tokenStandard,
      collection: meta.collection,
      uses: meta.uses,
    }));
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

async function getNFTOne(conn, mint) {
  const meta = await getMeta(conn, mint);
  return await getNFT(conn, meta)
}

async function getNFT(meta) {
  try {
    return { address: meta.address, name: meta.name, symbol: meta.symbol, collection: meta?.collection.address, image: await getImageUrlFromMetadataUri(meta.uri) }
  } catch (err) {
    console.error(err);
  }
}

async function getNFTswithImage(conn, owner) {
  try {
    console.log("owner=", owner)
    const nfts = await getNFTsForOwner(conn, owner);
    return Promise.all(nfts.map(async (meta) => (await getNFT(meta))));
    // return nfts
  } catch (error) {
    console.error('Error fetching NFTs:', error);
  }
}

module.exports = {
  getMeta,
  getImageUrlFromMetadataUri,
  getNFTsForOwner,
  getNFTswithImage,
  getNFTOne,
};