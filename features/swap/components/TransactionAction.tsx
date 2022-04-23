import { styled } from 'components/theme'
import { Text } from '../../../components/Text'
import { Button } from '../../../components/Button'
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { slippageAtom, tokenSwapAtom } from '../swapAtoms'
import { walletState, WalletStatusType } from '../../../state/atoms/walletAtoms'
import { useConnectWallet } from '../../../hooks/useConnectWallet'
import { useTokenSwap } from '../hooks/useTokenSwap'
import { Spinner } from '../../../components/Spinner'
import { SlippageSelector } from './SlippageSelector'
import { NETWORK_FEE } from '../../../util/constants'
import { useTokenBalance } from '../../../hooks/useTokenBalance'
import { Exchange } from '../../../icons'
import { IconWrapper } from '../../../components/IconWrapper'

type TransactionTipsProps = {
  isPriceLoading?: boolean
  tokenToTokenPrice?: number
}

export const TransactionAction = ({
  isPriceLoading,
  tokenToTokenPrice,
}: TransactionTipsProps) => {
  const [requestedSwap, setRequestedSwap] = useState(false)
  const [tokenA, tokenB] = useRecoilValue(tokenSwapAtom)
  const { balance: tokenABalance } = useTokenBalance(tokenA?.tokenSymbol)

  /* wallet state */
  const { status } = useRecoilValue(walletState)
  const { mutate: connectWallet } = useConnectWallet()
  const [slippage, setSlippage] = useRecoilState(slippageAtom)

  const { mutate: handleSwap, isLoading: isExecutingTransaction } =
    useTokenSwap({
      tokenASymbol: tokenA?.tokenSymbol,
      tokenBSymbol: tokenB?.tokenSymbol,
      tokenAmount: tokenA?.amount,
      tokenToTokenPrice: tokenToTokenPrice || 0,
    })

  /* proceed with the swap only if the price is loaded */

  useEffect(() => {
    const shouldTriggerTransaction =
      !isPriceLoading && !isExecutingTransaction && requestedSwap
    if (shouldTriggerTransaction) {
      handleSwap()
      setRequestedSwap(false)
    }
  }, [isPriceLoading, isExecutingTransaction, requestedSwap, handleSwap])

  const handleSwapButtonClick = () => {
    if (status === WalletStatusType.connected) {
      return setRequestedSwap(true)
    }

    connectWallet(null)
  }

  const shouldDisableSubmissionButton =
    isExecutingTransaction ||
    !tokenB.tokenSymbol ||
    !tokenA.tokenSymbol ||
    (status === WalletStatusType.connected && tokenA.amount <= 0) ||
    tokenA?.amount > tokenABalance

  return (
    <StyledDivForWrapper>
      <StyledDivForInfo>
        <StyledDivColumnForInfo className="fee-selector" kind="slippage">
          <SlippageSelector
            slippage={slippage}
            onSlippageChange={setSlippage}
          />
        </StyledDivColumnForInfo>
        <StyledDivColumnForInfo className="fee-selector" kind="fees">
          <Text
            variant="caption"
            css={{ fontWeight: '$bold' }}
            color="disabled"
          >
            Swap fee ({NETWORK_FEE * 100}%)
          </Text>
        </StyledDivColumnForInfo>
      </StyledDivForInfo>
      <Button className="btn-swap btn-default"
        css={{
          'background': '$black',
          'color': '$white',
          'stroke': '$white',
        }}
        iconLeft={<IconWrapper icon={<Exchange />} />}
        variant="primary"
        size="large"
        disabled={shouldDisableSubmissionButton}
        onClick={
          !isExecutingTransaction && !isPriceLoading
            ? handleSwapButtonClick
            : undefined
        }
      >
        {isExecutingTransaction ? <Spinner instant /> : 'Swap'}
      </Button>
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled('div', {
  alignItems: 'center',
  padding: '$space$12 0 0 0',
})

const StyledDivForInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  textTransform: 'uppercase',
  borderRadius: '$radii$2',
  backgroundColor: '$backgroundColors$main',
  padding: '$space$6 0',

})

const StyledDivColumnForInfo = styled('div', {
  display: 'grid',
  variants: {
    kind: {
      slippage: {
        minWidth: '140px',
        borderRadius: '0px',
        borderRight: '1px solid rgba(25, 29, 32, 0.2)',
      },
      fees: {
        flex: 1,
        padding: '16px 25px',
        borderRadius: '0px',
      },
    },
  },
})
