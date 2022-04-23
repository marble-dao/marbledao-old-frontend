import { useCallback, useEffect, useState } from 'react'
import { walletState } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'

const TOKEN_INCENTIVE_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_INCENTIVE_ADDRESS || ''

export const useBondingInfo = () => {
  const { address, client } = useRecoilValue(walletState)
  const [bondingInfo, setBondingInfo] = useState<IBondingInfo>()
  const [myBonding, setMyBonding] = useState<IMyBondingInfo>()
  const [myUnbonding, setMyUnbonding] = useState<Array<(string | number)[]>>()

  const getBondingInfo = useCallback(async () => {
    const bondingResult = await client?.queryContractSmart(
      TOKEN_INCENTIVE_ADDRESS,
      {
        config: {},
      }
    )
    setBondingInfo(bondingResult)
    const myBondingResult = await client?.queryContractSmart(
      TOKEN_INCENTIVE_ADDRESS,
      {
        staker: { address },
      }
    )
    setMyBonding(myBondingResult)
  }, [client, address])

  const getUnbondingInfo = useCallback(async () => {
    const unbondingResult = await client?.queryContractSmart(
      TOKEN_INCENTIVE_ADDRESS,
      {
        unstaking: { address },
      }
    )
    setMyUnbonding(unbondingResult)
  }, [client, address])

  useEffect(() => {
    getBondingInfo()
    getUnbondingInfo()
  }, [getBondingInfo, getUnbondingInfo])

  return {
    bondingInfo,
    myBonding,
    myUnbonding,
    getBondingInfo,
    getUnbondingInfo,
  }
}
