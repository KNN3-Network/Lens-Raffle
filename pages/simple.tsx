import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getRaffles } from "../lib/contracts/LuckyLens/LuckyLens";
import { getProfile } from "../lib/lensApi/api";
import { ProfileFieldsFragment } from "../lib/lensApi/generated";
import { NewRaffleData, RaffleData } from "../lib/types/types";

/*
I want to simplify the UX.
Instead of setting Raffles ahead of time. There should be one user flow to type in a post and generate / verify a winner.
There will be one button. The button will verify a winner for a post, and if there isn't a winner, it will prompt the user to send a tx to generate a winner. 

Only the poster can generate the winner though. 

This means one winner per post. 

Also, I still have to answer the question of what is a winner?

We'll stick with just any comments and then in the future this can be changed
*/

const parseLink = (link: string):number[] => {
  const linkArr = link.split('/')
  const relStrings = linkArr[4].split('-') // returns arr of two hex num strings. ex: ['0x5c9a', '0x14']

  return relStrings.map(string => parseInt(string, 16)) // will throw error if profileId / postId's ever get > Number.MAXSAFEINT
}


export default function Simple() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [link, setLink] = useState<string>('')
  const [address, setAddress] = useState<string>("")
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [profile, setProfile] = useState<ProfileFieldsFragment | null>(null)
  const [raffles, setRaffles] = useState<RaffleData[] | null>(null)


  const handleLink = () => {
    const nums:number[] = parseLink(link)
    console.log(nums)
    
  }

    // updates address, provider, signer based on web3Onboard's wallet
    useEffect(() => {
      setAddress(wallet?.accounts[0].address || "")
      const provider = wallet ? new ethers.providers.Web3Provider(wallet.provider, 'any') : null
      provider ? setProvider(provider) : console.log('ooops, couldnt get provider. provider is', provider)
      const signer = provider?.getSigner() 
      signer ? setSigner(signer) : console.log('oops, couldnt get signer, signer is', signer)
      console.log('address, provider, signer connected')
    }, [wallet])
  
    
    // gets lens profile from connected address
    async function updateProfile(address: string) {
      setProfile(await getProfile(address))
    }
    // gets raffles from connected address
    async function updateRaffles(address: string) {
      setRaffles(await getRaffles(address))
    }
    
    // fetch lens profile and live raffles from current address
    useEffect(() => {
      if(!address) return
      updateProfile(address)
      updateRaffles(address)
    }, [address])

  return (
    <div className='pt-10 text-center mx-auto my-10 py-10 max-w-3xl'>
      <Head>
        <title>Create Next App</title>
        <meta name="Lucky lens" content="Lucky Lens is a way to verifiably randomly choose a winner for a giveaway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="header">
        <h1 className='text-4xl m-2'>Lucky Lens</h1>
        <button className='bg-green-700 text-white rounded-xl p-2 mt-2 w-28' disabled={connecting} onClick={() => (wallet ? disconnect(wallet) : connect())}>
          {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
        </button>
        {profile ?  // they don't actually need a lens profile to use the app, but it will probably be useful to have it in the future
          <div className='mt-2'>
            {`Hello @${profile.handle}! Welcome to Lucky Lens :)`}
          </div>
        : null}
      </div>
      <div id="form" className='mt-4'>
            <div className='font-semibold text-lg my-2'>Create a new raffle:</div>

            <label className='block'>
                <div className='font-medium'>Link to post</div>
                <input type="text" onChange={e => setLink(e.target.value)}/> 
            </label>
            <button disabled={!link} className='mt-2 bg-green-700 text-white rounded-xl p-2' onClick={handleLink}>
              Generate or Verify Winner
            </button>
          </div>
    </div>
  )
}