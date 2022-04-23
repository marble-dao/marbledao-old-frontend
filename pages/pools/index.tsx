import React, { useMemo } from 'react'
//import styled from 'styled-components'
import { PoolInfo } from 'features/liquidity/components/PoolInfo'
import { styled } from 'components/theme'
import { AppLayout } from 'components/Layout/AppLayout'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { PoolCard } from 'features/liquidity/components/PoolCard'
import { PageHeader } from 'components/Layout/PageHeader'
import { useMultiplePoolsLiquidity } from 'hooks/usePoolLiquidity'
import { Text } from 'components/Text'
import { Spinner } from 'components/Spinner'
import { useTokenList } from 'hooks/useTokenList'
import { useBondingInfo } from 'hooks/useBondingInfo'

export default function Pools() {
  const [tokenList] = useTokenList()
  const [supportedTokens, poolIds] = useMemo(() => {
    const tokensCollection =
      tokenList?.tokens.filter(({ swap_address }) => Boolean(swap_address)) ??
      []

    const poolIdsCollection = tokensCollection
      .map(({ pool_id }) => pool_id)
      .filter(Boolean)

    return [tokensCollection, poolIdsCollection]
  }, [tokenList])

  const [liquidity, isLoading] = useMultiplePoolsLiquidity({
    poolIds,
  })

  const { myBonding, bondingInfo } = useBondingInfo()
  const [myPools, allPools] = useMemo(() => {
    if (!liquidity?.length) return []
    const pools = [[], []]
    liquidity.forEach((liquidityInfo, index) => {
      const poolIndex = liquidityInfo.myLiquidity.coins > 0 ? 0 : 1
      pools[poolIndex].push({
        liquidityInfo,
        tokenInfo: supportedTokens[index],
      })
    })

    return pools
  }, [liquidity, supportedTokens])

  const { symbol: baseTokenSymbol } = useBaseTokenInfo() || {}

  const shouldShowFetchingState = isLoading || !liquidity?.length
  const shouldRenderPools = !isLoading && Boolean(liquidity?.length)

  return (
    <AppLayout>
      <Container className="middle mauto">
        <PageHeader
          title="Available Pools"
          subtitle="Provide liquidity to the market and receive swap fees from each trade."
        />
        <StyledGrid  className="middle mauto">
        <PoolInfo
            bondingInfo={bondingInfo}
            tokenDollarValue={
              myPools?.[0]?.liquidityInfo?.tokenDollarValue ||
              allPools?.[0]?.liquidityInfo?.tokenDollarValue
            }
          />
          <StyledDivForWrapper>
            {shouldShowFetchingState && (
              <>
                <StyledDivForFullSpace>
                  <Spinner size={32} color="black" />
                </StyledDivForFullSpace>
              </>
            )}

            {shouldRenderPools && (
              <>
                {Boolean(myPools?.length) && (
                  <>
                    <SectionTitle>My Pools</SectionTitle>
                    <StyledDivForPoolsGrid className="pool-list">
                      {myPools.map(({ liquidityInfo, tokenInfo }, key) => (
                        <PoolCard
                          key={key}
                          tokenASymbol={baseTokenSymbol}
                          poolId={tokenInfo.pool_id}
                          tokenBSymbol={tokenInfo.symbol}
                          myLiquidity={liquidityInfo.myLiquidity}
                          bondingInfo={bondingInfo}
                          tokenDollarValue={liquidityInfo.tokenDollarValue}
                          myBonding={myBonding}
                          totalLiquidity={liquidityInfo.totalLiquidity}
                        />
                      ))}
                    </StyledDivForPoolsGrid>
                    {Boolean(allPools?.length) && (
                      <SectionTitle variant="all">All pools</SectionTitle>
                    )}
                  </>
                )}
                <StyledDivForPoolsGrid className="pool-list">
                  {allPools?.map(({ liquidityInfo, tokenInfo }, key) => (
                    <PoolCard
                      key={key}
                      tokenASymbol={baseTokenSymbol}
                      poolId={tokenInfo.pool_id}
                      tokenBSymbol={tokenInfo.symbol}
                      myLiquidity={liquidityInfo.myLiquidity}
                      bondingInfo={bondingInfo}
                      tokenDollarValue={liquidityInfo.tokenDollarValue}
                      myBonding={myBonding}
                      totalLiquidity={liquidityInfo.totalLiquidity}
                    />
                  ))}
                </StyledDivForPoolsGrid>
              </>
            )}
          </StyledDivForWrapper>
        </StyledGrid>
      </Container>
    </AppLayout>
  )
}
const Container = styled('div', {})
const StyledDivForFullSpace = styled('div', {
  paddingTop: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: '1',
})

const StyledDivForPoolsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '$rowGap$4',
  rowGap: '$rowGap$4',
})

const SectionTitle = ({ variant = 'my', children }) => {
  return (
    <Text
      variant="primary"
      css={{
        fontWeight: '$bold',
        fontSize: '$fontSizes$9',
        paddingBottom: '$11',
        paddingTop: variant === 'all' ? '$19' : '0px',
      }}
    >
      {children}
    </Text>
  )
}

const StyledDivForWrapper = styled('div', {
  borderRadius: '$radii$4',
  border: '1px solid $borderColors$default',
  boxShadow: '0px 4px 24px $borderColors$shadow',
  padding: '3rem 4rem',
})

const StyledGrid = styled('div', {
  display: 'grid',
  rowGap: '35px',
})
