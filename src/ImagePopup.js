import React, { useState, useEffect } from 'react';
import './ImagePopup.css'; // Import the CSS file
import { ethers } from 'ethers';

const subscriptionABI = require('./subscriptionABI.json');
const NFTMarketplaceABI = require("./NFTMarketplace.json")

function ImagePopup({ apiKey, textPrompt }) {
  const [isConnected, setConnected] = useState(false);
  const [outputVideoUrl, setOutputVideoUrl] = useState('');
  const [isLoadingVideo, setLoadingVideo] = useState(false);
  const [hasStaked, setHasStaked] = useState(false); 
  const [hasDefaultNFT, setHasDefaultNFT] = useState(false);
  const [newTextPrompt, setNewTextPrompt] = useState(textPrompt);
  const [inputFase, setInputFace] = useState("https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/c4850e08-61a3-11ee-9bc3-02420a000163/download.jpg.png")
  const [defaultNFTId, setDefaultNFTID] = useState()


  const contractAddress = '0x4BCef528011Df3BDc7C2Fa6F7f642B7a9aBA375a';
  const contractAbi = subscriptionABI;
  const NFTMarketplaceAddress = "0x6cF5C20edC5979aE6D7F3529DfeD50a91660df8D"

  const videoDictionary = {
    default: 'https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/407e5eec-61ae-11ee-94a0-02420a00017c/gooey.ai%20lipsync.mp4',
    connected: 'https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/82cb1e48-61ae-11ee-b764-02420a00017c/gooey.ai%20lipsync.mp4',
    stakingInstruction:"https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/11099758-629e-11ee-9202-02420a00012e/gooey.ai%20lipsync.mp4",
    defaultNFTinstruction:"https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/f3588d0c-632b-11ee-ac8b-02420a000158/gooey.ai%20lipsync.mp4"
  };

  async function checkUserStakingStatus() {
  
    try {
      const {ethereum} = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const con = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      )
      const data = await con.userStakes(signer.getAddress());
      console.log(data);
      const hasStaked = data > 0;
  
      return hasStaked;
    } catch (error) {
      console.error('Error checking staking status:', error);
      throw error;
    }
  }

  async function handleStake() {
    
    try {
      const {ethereum} = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const con = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      )
      console.log(con)
      // Send a transaction to the smart contract to stake tokens
      const tx = await con.stakeForSubscription({value:90000000000000000000n});
    const receipt = await tx.wait();
    console.log(receipt)
      // Staking successful, you can update the UI or state as needed
      console.log('Tokens staked successfully');
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  // Function to check if the user has a default NFT
const checkDefaultNFT = async () => {
  try {
    // Initialize the ethers provider and contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const signer = provider.getSigner();

    // Get the user's default NFT ID
    const defaultNFTId = await contract.userDefaultNFT(signer.getAddress());

    setDefaultNFTID(defaultNFTId);
    // If defaultNFTId is not zero (assuming 0 represents no default NFT)
    if (defaultNFTId.eq(0)) {
      console.log('User does not have a default NFT.');
    } else {
      console.log('User has a default NFT:', defaultNFTId.toString());
      setHasDefaultNFT(true)
    }

    return defaultNFTId
      } catch (error) {
    console.error('Error checking default NFT:', error);
    return false;
  }
};

async function getNFTImage(tokenId) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  try {

    const nftMarketplaceInstance = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceABI,
      provider
    )
    const nftImage = await nftMarketplaceInstance.nftInfo(tokenId);
    console.log(nftImage);
    setInputFace("https://ipfs.io/ipfs/" + nftImage.image)
    setNewTextPrompt("Hi ! I am Jen, your personal assistent! Great to have you here !")

    return nftImage.image;
  } catch (error) {
    console.error('Error fetching NFT image:', error);
    return null;
  }
}


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        console.log('Connected to MetaMask:', userAddress);
        setConnected(true);
        
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.warn('MetaMask is not installed or not accessible.');
    }
  };

  const checkStatus = async () => {
    // Check if the user has staked
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const hasUserStaked = await checkUserStakingStatus(signer.getAddress());
    setHasStaked(hasUserStaked);
    checkDefaultNFT();
  if (isConnected && !hasUserStaked) {
    // Replace the video URL after the user connects the wallet
    setOutputVideoUrl(videoDictionary["stakingInstruction"]);
  }
}
  
  useEffect( () => {
    checkStatus();
  }, [isConnected]);

  useEffect(() => {
    if (hasStaked && !hasDefaultNFT) {
      // Replace the video URL after the user connects the wallet
      setOutputVideoUrl(videoDictionary["defaultNFTinstruction"]);
    }
  }, [hasStaked]);

  
  useEffect(() => {
    if (hasDefaultNFT) {
      getNFTImage(defaultNFTId)

      // // Replace the video URL after the user connects the wallet
      // setOutputVideoUrl(videoDictionary["defaultNFTinstruction"]);
    }
  }, [hasDefaultNFT]);

  useEffect(() => {
    // Update newTextPrompt whenever textPrompt prop changes
    setNewTextPrompt(textPrompt);
  }, [textPrompt]);


useEffect(() => {
      // Check if the wallet is already connected
      const { ethereum } = window;
  if (ethereum.selectedAddress) {
    setConnected(true);
  
  }

})

  useEffect(() => {

    if (isConnected && newTextPrompt !== "Welcome") {
      // Check if the text prompt matches the condition for the default video URL
        // Fetch the video URL based on the text prompt when connected and a text prompt is provided
        async function fetchVideoUrl() {
          try {
            const payload = {
              "input_face": inputFase,
              // "input_audio": "https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/a3da3d66-a60c-11ed-8fac-02420a0001c5/uberduck_gen.wav",
              "face_padding_top": 3,
              "face_padding_bottom": 16,
              "face_padding_left": 12,
              "face_padding_right": 6,
              "text_prompt":newTextPrompt,
              "tts_provider": "GOOGLE_TTS",
              "uberduck_voice_name": "the-rock",
              "uberduck_speaking_rate": 1,
              "google_voice_name": "en-IN-Wavenet-D",
              "google_speaking_rate": 1.2,
              "google_pitch": -1.75
            };
            

            const response = await fetch("https://api.gooey.ai/v2/LipsyncTTS/", {
              method: "POST",
              headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              throw new Error(response.status);
            }

            const result = await response.json();
            console.log(response.status, result);

            setOutputVideoUrl(result.output.output_video);
          } catch (error) {
            console.error('Error fetching video:', error);
          } finally {
            setLoadingVideo(false);
          }
        }

        setLoadingVideo(true);
        fetchVideoUrl();
      }
  }, [isConnected, newTextPrompt, apiKey]);

  return (
    <div className="image-popup-container">
      {!isConnected && (
        <div>
          <button onClick={connectWallet} className="connect-wallet-button">
            Connect Wallet
          </button>
          <video
            src={outputVideoUrl}
            controls
            autoPlay
            width="400"
            height="300"
            className="popup-video"
          />
        </div>
      )}
      {isConnected && (
        <div>
          {isLoadingVideo ? (
            <p>Loading video...</p>
          ) : (
            <div>
              {outputVideoUrl ? (
                <video
                  src={outputVideoUrl}
                  controls
                  autoPlay
                  width="300"
                  height="250"
                  className="popup-video"
                />
              ) : (
                <p>No video available.</p>
              )}
              {!hasStaked && (
                <button onClick={handleStake} className="stake-button">
                  Stake Tokens
                </button>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImagePopup;
