
import { BigNumber, Contract, ethers } from 'ethers'
import { getSyntheticLeadingComments } from 'typescript'
import { ALCHEMY_KEY_MUMBAI } from '../../../pages/_app'
import { getPublication } from '../../lensApi/api'
import { LuckyLens, LuckyLensInterface } from '../../types/LuckyLens/LuckyLens'
import { postedRaffleLog, RaffleData, RaffleStruct } from '../../types/types'
import { getComments } from '../LensHub/LensHub'
import LuckyLensJson from './LuckyLens.json'
// abi => api

export const defaultProvider = new ethers.providers.AlchemyProvider('maticmum', ALCHEMY_KEY_MUMBAI)

// exports ethers contract that can be connected to a signer with contract.connect(Signer)
// in the future can pre-connect to app's provider in here if read-only calls are prevalent in the app
export const LuckyLensMumbai:Contract = new ethers.Contract("0xF3ed821e21379f09Dd171986892c82EB186Ac80E",LuckyLensJson.abi, defaultProvider)
console.dir(LuckyLensMumbai)

// getting all raffles rn. not filtering for live raffles or anything.
export const getRafflesForAddress = async(address: string):Promise<RaffleData[]> => {

const postRaffleFilter = LuckyLensMumbai.filters.PostRaffle(address)
const postRaffleLogs = await LuckyLensMumbai.queryFilter(postRaffleFilter, -200000, 'latest') //hardcoded -200000 blocks ago to now
const cleanItUp:postedRaffleLog[] = postRaffleLogs.map(log => ({owner: log.args?.owner, profileId: log.args?.profileId, pubId: log.args?.pubId, raffleId: log.args?.raffleId, time: log.args?.time}))
const justRaffleIds:BigNumber[] = cleanItUp.map(raffle => raffle.raffleId)
const randomNums = await LuckyLensMumbai.getRandomNums(justRaffleIds)

const final = []
for(let i = 0; i < cleanItUp.length; i++) {
  const {owner, profileId, pubId, raffleId, time: s_time} = cleanItUp[i]
  const randomNum = randomNums[i]
  
  let passed = false; 
  // if(s_time.toString() == '1') passed = true
  if(Date.now() / 1000 > s_time.toNumber()) passed = true // Date.now() is in milliseconds but our time value should be in seconds
  const date = passed ? null : new Date(s_time.toNumber()*1000) // don't need to multiply by 1000, it takes seconds


  final.push({ //most are bignums so mapping to strings
    owner: owner,
    profileId: profileId.toString(),
    pubId: pubId.toString(),
    raffleId: raffleId.toString(),
    time: s_time.toString(),
    passed,
    date,
    randomNum: randomNum.toString()
  })
}

return final.reverse() // reverse to show newest first
}

export const getRaffleFromIds = async(profileId: number, pubId: number):Promise<RaffleData | any> => {
  console.log("getting raffle from ids. profile: ",profileId,"pub:", pubId)
  const postRaffleFilter = LuckyLensMumbai.filters.PostRaffle(null, null, profileId, pubId)
  const postRaffleLogs = await LuckyLensMumbai.queryFilter(postRaffleFilter, -200000, 'latest') //hardcoded -200000 blocks ago to now


  return postRaffleLogs[0]?.args?.raffleId
}


// requirements: 1. must comment 2. must follow and comment

export const getWinner = async(raffleId: string, requirements:string):Promise<string> => {
  console.log("getting winner for raffle", raffleId, "with requirements", requirements)
  // first thing to do is get the raffle data from the contract for the given raffleId
  const totalRaffles = await LuckyLensMumbai.totalRaffles()
  if(parseInt(raffleId) > totalRaffles-1) throw new Error('Raffle does not exist')
  const raffleData:postedRaffleLog = await LuckyLensMumbai.Raffles(raffleId)

  const {profileId, pubId, time: s_time, randomNum} = raffleData
  if(!randomNum || randomNum.toString() == "0") throw new Error("tried to get qualified entrants on a raffle whose randomNum was 0")
  

  const allComments:any[] = await getComments(profileId.toString(), pubId.toString(), s_time.toString()) // caps out at 1000 for now

  
  console.log("all comments:", allComments)
  const numEntrants = allComments.length
  if(numEntrants==0) throw new Error("absolutely no entrants")

  console.log("length is ",allComments.length)
  console.log("random num is", randomNum)

  const winnerIndex = randomNum.mod(numEntrants).toNumber()
  console.log("winnderIndex", winnerIndex)

  console.log(`winner is profile`,allComments[winnerIndex].profileId)


  return allComments[winnerIndex].profileId
}