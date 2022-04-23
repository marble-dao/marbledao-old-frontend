import { styled } from '@stitches/react'
import { useMultiplePoolsLiquidity } from 'hooks/usePoolLiquidity'
import { useTokenDollarValueQuery } from 'hooks/useTokenDollarValue'
import { useTokenList } from 'hooks/useTokenList'
import { useMemo } from 'react'
import { dollarValueFormatter } from 'util/conversion'
import { Text } from '../../../components/Text'

export const AssetInfo = ({ tokens }) => {
  const [tokenPrices] = useTokenDollarValueQuery(
    tokens.map((token) => token?.tokenSymbol)
  )
  const availableAssets = useMemo(() => {
    return tokens?.reduce((prev, curr, index) => {
      return prev + curr.balance * tokenPrices[index]
    }, 0)
  }, [tokens, tokenPrices])

  const [tokenList] = useTokenList()
  const supportedPoolIds = useMemo(() => {
    return tokenList?.tokens
      .filter(({ swap_address }) => Boolean(swap_address))
      .map(({ pool_id }) => pool_id)
  }, [tokenList])

  const [liquidity] = useMultiplePoolsLiquidity({
    poolIds: supportedPoolIds,
  })

  const myLiquidity = useMemo(() => {
    return liquidity?.reduce(
      (prev, curr) => prev + curr?.myLiquidity?.dollarValue,
      0
    )
  }, [liquidity])

  return (
    <StyledElementForCard kind="wrapper">
      <StyledElementForToken>
        <Text css={{ padding: '$4 0' }}>Total Assets</Text>
        <Text variant="title" css={{ fontSize: '$15' }}>
          ${dollarValueFormatter(availableAssets + myLiquidity)}
        </Text>
      </StyledElementForToken>
      <StyledElementForToken>
        <Text css={{ padding: '$4 0' }}>Available Assets</Text>
        <Text variant="title" css={{ fontSize: '$15' }}>
          ${dollarValueFormatter(availableAssets)}
        </Text>
      </StyledElementForToken>
      <StyledElementForToken>
        <Text css={{ padding: '$4 0' }}>Bonded Assets</Text>
        <Text variant="title" css={{ fontSize: '$15' }}>
          ${dollarValueFormatter(myLiquidity)}
        </Text>
      </StyledElementForToken>
    </StyledElementForCard>
  )
}

const StyledElementForCard = styled('div', {
  variants: {
    kind: {
      wrapper: {
        padding: '$18 $22',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '$radii$4',
        backgroundColor: '$backgroundColors$main',
      },
    },
  },
})

const StyledElementForToken = styled('div', {
  display: 'flex',
  flex: 1,
  minWidth: 150,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})
