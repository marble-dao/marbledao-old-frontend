import type { NextPage } from 'next'
import { styled } from 'components/theme'

import { walletState } from '../../state/atoms/walletAtoms'
import { useWalletConnectionStatus } from 'hooks/useWalletConnectionStatus'
import DateCountdown from '../../components/DateCountdown'
import { Text } from '../../components/Text'
import { useBaseTokenInfo, useNativeTokenInfo } from 'hooks/useTokenInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useRecoilValue } from 'recoil'

import { useEffect, useState, MouseEvent, ChangeEvent } from 'react'
import {
  convertMicroDenomToDenom,
  convertDenomToMicroDenom,
} from 'util/conversion'
import { coin } from '@cosmjs/launchpad'
import { PageHeader } from 'components/Layout/PageHeader'
import { Button } from 'components/Button'
import { toast } from 'react-toastify'
import { IconWrapper } from '../../components/IconWrapper'
import { Ellipse } from '../../icons'

const presaleStart = 'March 19, 2022 00:00:00 UTC+00:00'
const presaleEnd = 'March 27, 2022 00:00:00 UTC+00:00'
const dateTo = new Date() > new Date(presaleStart) ? presaleEnd : presaleStart

const PUBLIC_TOKEN_SALE_CONTRACT =
  process.env.NEXT_PUBLIC_TOKEN_SALE_CONTRACT || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_PRECONTRACT || ''

const TokenPresale: NextPage = () => {
  const [cw20Balance, setCw20Balance] = useState('')
  const [remaining, setRemaining] = useState(50000000)
  const [loadedAt, setLoadedAt] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '' })
  const [purchaseAmount, setPurchaseAmount] = useState<any>('')
  const [tokenPrice, setTokenPrice] = useState<any>('')
  const [numToken, setNumToken] = useState(0)
  const [showNumToken, setShowNumToken] = useState(false)

  const { isConnected } = useWalletConnectionStatus(walletState)

  const nativeToken = useNativeTokenInfo()
  const { balance } = useTokenBalance(nativeToken?.symbol)
  const { address, client } = useRecoilValue(walletState)

  useEffect(() => {
    if (!client || address.length === 0) return
    // Gets cw20 balance
    client
      .queryContractSmart(PUBLIC_CW20_CONTRACT, {
        balance: { address },
      })
      .then((response) => {
        setCw20Balance(response.balance)
      })
      .catch((error) => {
        toast.error(`Error! ${error.message}`)
      })
  }, [client, address, loadedAt])

  useEffect(() => {
    if (!client) return

    // Gets token information
    client
      .queryContractSmart(PUBLIC_CW20_CONTRACT, {
        token_info: {},
      })
      .then((response) => {
        setTokenInfo(response)
      })
      .catch((error) => {
        toast.error(`Error! ${error.message}`)
      })
  }, [client])

  /**
   * Calculates and sets the number of tokens given the purchase amount divided by the price
   */
  useEffect(() => {
    if (!client) return

    client
      .queryContractSmart(PUBLIC_TOKEN_SALE_CONTRACT, {
        get_info: {},
      })
      .then((response) => {
        const remaining = setRemaining(response.balance)
        const price = convertMicroDenomToDenom(response.price.amount)
        setTokenPrice(price)
        setNumToken(purchaseAmount / price)
      })
      .catch((error) => {
        toast.error(`Error! ${error.message}`)
      })

    setShowNumToken(!!purchaseAmount)
  }, [purchaseAmount, client])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event
    setPurchaseAmount(value)
  }

  const handlePurchase = (event: MouseEvent<HTMLElement>) => {
    const now = new Date()
    if (now.getTime() < new Date(presaleStart).getTime() || now.getTime() > new Date(presaleEnd).getTime()) {
      toast.error('Presale not started yet!')
      return
    }
    if (!client || address.length === 0) return
    if (!isConnected) {
      toast.error('Please connect your wallet!')
      return
    }
    if (!purchaseAmount) {
      toast.error('Please enter the amount you would like to purchase')
      return
    }
    if (purchaseAmount > balance) {
      toast.error(
        `You do not have enough tokens to make this purchase, maximum you can spend is ${balance}`
      )
      return
    }

    event.preventDefault()
    setLoading(true)
    const defaultFee = {
      amount: [],
      gas: '400000',
    }

    client
      ?.execute(
        address, // sender address
        PUBLIC_TOKEN_SALE_CONTRACT, // token sale contract
        {
          buy: {
            denom: 'ujuno',
            price: '1',
          },
        }, // msg
        defaultFee,
        undefined,
        [coin(convertDenomToMicroDenom(purchaseAmount*1000000), 'ujuno')]
      )
      .then((response) => {
        setPurchaseAmount('')
        setLoadedAt(new Date())
        setLoading(false)
        toast.success('Successfully purchased!')
      })
      .catch((error) => {
        setLoading(false)
        toast.error(`Error! ${error.message}`)
      })
  }

  return (
    <>
      <PageHeader title="$BLOCK Presale" subtitle="A great chance to join the Marble DAO ecosystem" />
      <StyledDivForPresale className="presale-section">
        <h1>
          THE PRESALE IS SOLD OUT!

          {/*<DateCountdown dateTo={dateTo} mostSignificantFigure='day' />*/}
        </h1>
        <Text variant="primary" css={{ paddingBottom: '$4', fontSize: '$9'}}>
          Terms & Conditions
        </Text>
        <StyledElementForCard kind="wrapper" className="presale-terms">
          <StyledElementForCard kind="content">
            <StyledElementForTerms>
                <Term><IconWrapper icon={<Ellipse />} />$pBLOCK is the presale token of $BLOCK</Term>
                <Term><IconWrapper icon={<Ellipse />} />Buy now $pBLOCK to receive $BLOCK at launch on 03/31</Term>
                <Term><IconWrapper icon={<Ellipse />} />Available tokens: 50,000,000 $pBLOCK</Term>
                <Term><IconWrapper icon={<Ellipse />} />Presale price: 0,015$ </Term>
                <Term><IconWrapper icon={<Ellipse />} />Front Loaded Vesting Schedule of 6 months</Term>
                <Term><IconWrapper icon={<Ellipse />} />Max purchase amount: 1,000,000 $pBLOCK</Term>
                <Term><IconWrapper icon={<Ellipse />} />Start date: March 19th </Term>
                <Term><IconWrapper icon={<Ellipse />} />End date: March 26th</Term>
                <Term><IconWrapper icon={<Ellipse />} />To buy $pBLOCK, connect your Keplr wallet first</Term>
            </StyledElementForTerms>
          </StyledElementForCard>
        </StyledElementForCard>
        <h1>
          <StyledElementForCard kind="wrapper">
            <StyledElementForCard kind="content">
              <StyledElementForToken>
                <StyledTokenImage src='https://i.ibb.co/T0TrSgT/block-logo.png' />
                <Text variant="title">
                  <Text css={{ paddingLeft: '$8' }} as="span" variant="title">
                  {cw20Balance && (
                    <span>{`${tokenInfo.symbol} remaining: ${Number((remaining / 1000000)).toLocaleString()}  `}</span>
                  )}
                  </Text>
                </Text>
              </StyledElementForToken>
            </StyledElementForCard>
          </StyledElementForCard>
        </h1>

        <h1>
          <StyledElementForCard kind="wrapper">
            <StyledElementForCard kind="content">
              <StyledElementForToken>
                <StyledTokenImage src='https://i.ibb.co/T0TrSgT/block-logo.png' />
                <Text variant="title">
                  <Text css={{ paddingLeft: '$8' }} as="span" variant="title">
                  {cw20Balance && (
                    <span>{`Your wallet has ${(Number(cw20Balance) / 1000000).toFixed(2)} ${tokenInfo.symbol} `}</span>
                  )}
                  </Text>
                </Text>
              </StyledElementForToken>
            </StyledElementForCard>
          </StyledElementForCard>
        </h1>



        <h2>{`Buy ${tokenInfo.name} with JUNO `}</h2>

        <StyledDivForWrapper className="sold-section">
          <input
            type="number"
            id="purchase-amount"
            placeholder="Input the amount of Juno to use"
            step="0.1"
            onChange={handleChange}
            value={purchaseAmount}
            
          />

          <Button variant="primary" size="large" /*onClick={handlePurchase}*/>
            SOLD OUT!
          </Button>
        </StyledDivForWrapper>

        <h1>
          <StyledElementForCard kind="wrapper">
            <StyledElementForCard kind="content">
              <StyledElementForToken>
                <StyledTokenImage src='https://i.ibb.co/T0TrSgT/block-logo.png' />
                <Text variant="title">
                  <Text css={{ paddingLeft: '$8' }} as="span" variant="title">
                  <span>{`You are getting ${Number(numToken * 1000000).toFixed(2)} ${tokenInfo.symbol} `}</span>
                  </Text>
                </Text>
              </StyledElementForToken>
            </StyledElementForCard>
          </StyledElementForCard>
        </h1>
      </StyledDivForPresale>                  
    </>
  )
}

export default TokenPresale


const StyledElementForCard = styled('div', {
  variants: {
    kind: {
      wrapper: {
        background: '$backgroundColors$main',
        borderRadius: '$2',
        padding: '$9 $16',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      },
      content: {
        display: 'grid',
        gridAutoFlow: 'column',
        columnGap: '$space$10',
        position: 'relative',
        zIndex: 1,
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
        background:
          'radial-gradient(92.33% 382.8% at 4.67% 100%, #DFB1E3 0%, rgba(247, 202, 178, 0) 100%)',
        opacity: 0.4,
      },
    },
  },
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
  borderRadius: '8px',
  backgroundColor: '$backgroundColors$main',
  padding: '8px',
  display: 'flex',
  justifyContent: 'space-between',
})
const StyledDivForPresale = styled('div', {
  borderRadius: '$radii$4',
  border: '$borderWidths$1 solid $borderColors$default',
  boxShadow: '0px 4px 24px $borderColors$shadow',
  padding: '3rem 4rem',
})
const StyledElementForTerms = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  columnGap: '7px',
  
})
const Term = styled('p', {
  display: 'flex', 
  alignItems: 'center', 
  columnGap: '$space$6', 
  marginTop: '$space$10',
})