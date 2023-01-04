import Head from "next/head";
import { useState } from "react";
import { NewRaffleData } from "../lib/types/types";

/*
I want to simplify the UX.
Instead of setting Raffles ahead of time. There should be one user flow to type in a post and generate / verify a winner.
There will be one button. The button will verify a winner for a post, and if there isn't a winner, it will prompt the user to send a tx to generate a winner. 

Only the poster can generate the winner though. 

This means one winner per post. 

Also, I still have to answer the question of what is a winner?

We'll stick with just any comments and then in the future this can be changed
*/


export default function Simple() {
  const [newRaffleData, setNewRaffleData] = useState<NewRaffleData | null>(null)


  const handleNewRaffle = () => {
    console.log('bing bong')
  }

  return (
    <div className='pt-10 text-center mx-auto my-10 py-10 max-w-3xl'>
      <Head>
        <title>Create Next App</title>
        <meta name="Lucky lens" content="Lucky Lens is a way to verifiably randomly choose a winner for a giveaway" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      Simple
      <div id="form" className='mt-4'>
            <div className='font-semibold text-lg my-2'>Create a new raffle:</div>

            <label className='block'>
                <div className='font-medium'>Profile ID (number)</div>
                <input type="number" onChange={e => setNewRaffleData(prevState => ({...prevState, profileId: e.target.value}))}/> 
            </label>
            <label className='block'>
                <div className='font-medium'>Publication ID (number)</div>
                <input type="number" onChange={e => setNewRaffleData(prevState => ({...prevState, pubId: e.target.value}))}/> 
            </label>
            <label className='block'>
                <div className='font-medium'>Raffle Time</div>

                <span className='inline-block mb-2'>Now?</span><input type="checkbox" className='mx-2 mb-1' checked={Boolean(newRaffleData?.now)} onChange={e => setNewRaffleData(prevState => ({...prevState, now: e.target.checked}))}/><br/>

            </label>
            <button disabled={!newRaffleData} className='mt-2 bg-green-700 text-white rounded-xl p-2' onClick={handleNewRaffle}>Create Raffle</button>
          </div>
    </div>
  )
}