import type { NextPage } from 'next'
import { styled } from '@stitches/react'

import { walletState } from '../../state/atoms/walletAtoms'
import { useWalletConnectionStatus } from 'hooks/useWalletConnectionStatus'
import { useRecoilValue } from 'recoil'
import { Text } from '../../components/Text'
import DateCountdown from '../../components/DateCountdown'
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { HTMLProps } from 'react'
import { useEffect, useState, MouseEvent, useCallback } from 'react'
import { PageHeader } from 'components/Layout/PageHeader'
import { Button } from 'components/Button'
import { toast } from 'react-toastify'
import { voters } from 'proposal.json'
import { Airdrop as merkleAirdrop } from '../../util/merkle-airdrop-cli/airdrop'
import { IconWrapper } from '../../components/IconWrapper'
import { Ellipse } from '../../icons'

const PUBLIC_AIRDROP_CONTRACT = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''

const airdropStart = 'March 01, 2022 00:00:00 UTC+00:00'
const airdropEnd = 'March 31, 2022 00:00:00 UTC+00:00'
const dateTo = new Date() > new Date(airdropStart) ? airdropEnd : airdropStart

const TokenAirdrop: NextPage = () => {
  const [cw20Balance, setCw20Balance] = useState('')
  const [loadedAt, setLoadedAt] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '' })

  const { isConnected } = useWalletConnectionStatus(walletState)

  const { address, client } = useRecoilValue(walletState)
  const [merkleProof, setMerkleProof] = useState([])

  const [airdropAmount, setAirdropAmount] = useState(0)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [totalToBurn, setTotalToBurn] = useState(21000);

  const [isClaimed, setIsClaimed] = useState(false)

  useEffect(() => {
    if (!address) return
    let claimData = voters.find((el) => el.address === address);
    if (!claimData) {
      toast.error("This address is not eligible. Try connecting another address from Keplr");
    }
  }, [address])

  useEffect(() => {
    if (!client || address.length === 0) return

    // Gets total claimed
    client.queryContractSmart(PUBLIC_AIRDROP_CONTRACT, {
      total_claimed: { stage: 1 },
    }).then((response) => {
      setTotalClaimed((response.total_claimed - 1050) / 1000)
      setTotalToBurn((20370 - response.total_claimed / 1000));

    }).catch((error) => {
      toast.error(`Error! ${error.message}`)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, totalClaimed, totalToBurn])

  const getMerkleProof = useCallback(async (val: number) => {
    let ret: Array<Object> = []

    setLoading(true)
    if (address == '') {
      setLoading(false)
      return ret
    }

    let receivers: Array<{ address: string; amount: string }> = voters
    let airdrop = new merkleAirdrop(receivers)
    let proof = airdrop.getMerkleProof({ address: address, amount: val.toString() })
    setLoading(false)
    return proof
  }, [address])

  useEffect(() => {
    if (!client || address.length === 0) return

    voters.forEach((rec) => {
      if (rec.address == address) {
        setAirdropAmount(parseInt(rec.amount))
      }
    });

    // Gets cw20 balance
    client.queryContractSmart(PUBLIC_CW20_CONTRACT, {
      balance: { address: address },
    }).then((response) => {
      setCw20Balance(response.balance)
    }).catch((error) => {
      toast.error(`Error! ${error.message}`)
    })
  }, [client, address, loadedAt])

  useEffect(() => {
    if (!client) return

    // Gets token information
    client.queryContractSmart(PUBLIC_CW20_CONTRACT, {
      token_info: {},
    }).then((response) => {
      setTokenInfo(response)

    }).catch((error) => {
      toast.error(`Error! ${error.message}`)
    })


  }, [client])

  useEffect(() => {
    if (!client || address.length === 0) return


    getMerkleProof(airdropAmount).then((response: []) => {
      setMerkleProof(response)
    }).catch((error: any) => {
      toast.error(`Error! ${error.message}`)
    })

    client.queryContractSmart(PUBLIC_AIRDROP_CONTRACT, {
      is_claimed: {
        stage: 1,
        address: address
      },
    }).then((response) => {
      setIsClaimed(response.is_claimed)

    }).catch((error) => {
      toast.error(`Error! ${error.message}`)
    })
  }, [client, address, airdropAmount, getMerkleProof])

  const handleAirdrop = (event: MouseEvent<HTMLElement>) => {
    if (!client || !isConnected) {
      toast.error('Please connect your wallet!')
      return
    }
    const now = new Date()
    if (now.getTime() < new Date(airdropStart).getTime() || now.getTime() > new Date(airdropEnd).getTime()) {
      toast.error('You cannot claim now!')
      return
    }

    if (isClaimed) {
      toast.success('Already airdropped!')
      return
    }
    event.preventDefault()
    setLoading(true)
    const defaultFee = {
      amount: [],
      gas: "400000",
    };

    client?.execute(
      address,
      PUBLIC_AIRDROP_CONTRACT,
      {
        "claim": {
          "stage": 1,
          "amount": `${airdropAmount}`,
          "proof": merkleProof
        }
      }, // msg
      defaultFee,
      undefined,
      []
    ).then((response) => {
      setLoadedAt(new Date())
      setLoading(false)
      toast.success('Successfully airdropped!')
    }).catch((error) => {
      setLoading(false)
      toast.error(`Error! ${error}`)
    })
  }

  return (
    <>
      <PageHeader title="GovDrop Claim" subtitle="This is your first step to join Marble DAO!" />
      <StyledDivForWrapper className="airdrop-section">
        <Text variant="primary" css={{ paddingBottom: '$4', fontSize: '$9'}}>
          Terms & Conditions
        </Text>
        <StyledElementForCard kind="wrapper" className="airdrop-terms">
          <StyledElementForCard kind="content">
            <StyledElementForTerms>
              <Term>
                <IconWrapper icon={<Ellipse />} />MARBLE is claimable starting from March 1st, 2022
              </Term>
              <Term>
                <IconWrapper icon={<Ellipse />} />All unclaimed MARBLE will be sent to the Treasury DAO on March 31st, 2022
              </Term>
              <Term>
                <IconWrapper icon={<Ellipse />} />The unclaimed MARBLE in the Treasury cannot be spent without a passed Governance proposal
              </Term>
              <Term>
                <IconWrapper icon={<Ellipse />} />To claim the airdrop, connect your Keplr wallet first
              </Term>
              <Term>
                <IconWrapper icon={<Ellipse />} />Read the Marblepaper and be ready!
              </Term>

              <a className="marble-paper-link" href="/The Marblepaper.pdf" target="_blank">
                <Button variant="primary" size="large">
                  Marblepaper
                </Button>
              </a>
            </StyledElementForTerms>
          </StyledElementForCard>
        </StyledElementForCard>
        <h2>
          <Text variant="primary" css={{ paddingBottom: '$4', color: '$gray' }}>
            The GovDrop starts on March 1st and ends on March 31st:
          </Text>
          <DateCountdown dateTo={dateTo} mostSignificantFigure='day' />
        </h2>
        <StyledElementForCard kind="claim" className="airdrop-claim">
            <div className="claim-block">
              <div className="claim-item">
                <Text variant="primary" css={{ paddingBottom: '$4', color: '$gray', }}>
                  Total claimed by Community:
                </Text>
                <Text as="span" variant="title">
                  <span><img src="https://raw.githubusercontent.com/MarbleDAO/brand-assets/main/marble.png" alt="MARBLE"/>{` ${Number(totalClaimed).toFixed(2)} ${tokenInfo.symbol} `}</span>
                </Text>
              </div>
              <div className="claim-item">
                <Text variant="primary" css={{ paddingBottom: '$4', color: '$gray', }}>
                  Total unclaimed:
                </Text>
                <Text as="span" variant="title">
                  <span><img src="https://raw.githubusercontent.com/MarbleDAO/brand-assets/main/marble.png" alt="MARBLE"/>{` ${Number(totalToBurn).toFixed(2)} ${tokenInfo.symbol} `}</span>
                </Text>
              </div>
              <div className="claim-item">
                <Text variant="primary" css={{ paddingBottom: '$4', color: '$gray', }}>
                  Your airdrop amount:
                </Text>
                <Text as="span" variant="title">
                  {cw20Balance && (
                    <span><img src="https://raw.githubusercontent.com/MarbleDAO/brand-assets/main/marble.png" alt="MARBLE"/>{` ${Number(airdropAmount / 1000).toFixed(2)} ${tokenInfo.symbol} `}</span>
                  )}
                </Text>
              </div>
              <div className="claim-item">
                <Text variant="primary" css={{ paddingBottom: '$4', color: '$gray', }}>
                  Your wallet has:
                </Text>
                <Text as="span" variant="title">
                  {cw20Balance && (
                    <span><img src="https://raw.githubusercontent.com/MarbleDAO/brand-assets/main/marble.png" alt="MARBLE"/>{` ${(Number(cw20Balance) / 1000).toFixed(2)} ${tokenInfo.symbol} `}</span>
                  )}
                </Text>
              </div>
            </div>
            <div className="claim-wrapper">
              <Button variant="primary" size="large" onClick={handleAirdrop}>
                Claim $MARBLE
              </Button>
            </div>
        </StyledElementForCard>
      </StyledDivForWrapper>
    </>
  )
}

export default TokenAirdrop

const StyledElementForCard = styled('div', {
  variants: {
    kind: {
      wrapper: {
        borderRadius: '$2',
        padding: '$9 $16',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '$backgroundColors$main',
      },
      content: {
        display: 'grid',
        gridAutoFlow: 'column',
        columnGap: '$space$10',
        position: 'relative',
        zIndex: 1,
        width: '100%',
      },
      actions: {
        display: 'grid',
        gridAutoFlow: 'column',
        columnGap: '$space$6',
        position: 'relative',
        zIndex: 1,
      },
      background: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,

      },
      claim: {
        borderRadius: '$2',
        padding: '$9 $12',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '$backgroundColors$main',
      },
    },
  },
})
const StyledElementForTerms = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  columnGap: '7px',
  ' .marble-paper-link':{
    justifyContent: 'center',
    display: 'flex',
    margin: '$space$16',
  }

})
const StyledElementForToken = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  columnGap: '7px',
  alignItems: 'center',
})

const StyledTokenImage = styled('img', {
  width: 26,
  height: 26,
  borderRadius: '50%',
  backgroundColor: '#ccc',
})
const StyledDivForWrapper = styled('div', {
  borderRadius: '$radii$4',
  border: '$borderWidths$1 solid $borderColors$default',
  boxShadow: '0px 4px 24px $borderColors$shadow',
  padding: '3rem 4rem',
  ' .claim-wrapper':{
    justifyContent: 'center',
    display: 'flex',
    margin: '$space$16 $space$8 $space$8 $space$8',
  }
})

const Term = styled('p', {
  display: 'flex',
  alignItems: 'center',
  columnGap: '$space$6',
  marginTop: '$space$10',
})
