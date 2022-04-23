import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'components/theme'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppLayout } from 'components/Layout/AppLayout'
import { Text } from 'components/Text'
import { Chevron } from 'icons/Chevron'
import { IconWrapper } from 'components/IconWrapper'
import {
  PoolBondedLiquidityCard,
  UnbondingLiquidityCard,
  ManagePoolDialog,
  PoolAvailableLiquidityCard,
} from 'features/liquidity'
import { Button } from 'components/Button'
import { useBaseTokenInfo, useTokenInfoByPoolId } from 'hooks/useTokenInfo'
import { useTokenToTokenPrice } from 'features/swap/hooks/useTokenToTokenPrice'
import { usePoolLiquidity } from 'hooks/usePoolLiquidity'
import { parseCurrency } from 'features/liquidity/components/PoolCard'
import {
  __POOL_REWARDS_ENABLED__,
  APP_NAME,
  INCENTIVE_AMOUNT,
} from 'util/constants'
import { BondLiquidityDialog } from 'features/liquidity'
import { Spinner } from 'components/Spinner'
import { walletState } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'
import { toast } from 'react-toastify'
import { useBondingInfo } from 'hooks/useBondingInfo'
import { PoolInfo } from 'features/liquidity/components/PoolInfo'

const TOKEN_INCENTIVE_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_INCENTIVE_ADDRESS || ''

export default function Pool() {
  const {
    query: { pool },
  } = useRouter()

  const { address, client } = useRecoilValue(walletState)
  const [isManageLiquidityDialogShowing, setIsManageLiquidityDialogShowing] =
    useState(false)
  const [isBondingDialogShowing, setIsBondingDialogShowing] = useState(false)
  const [lpTokenAddress, setLpTokenAddress] = useState('')
  const [lpTokenAmount, setLpTokenAmount] = useState()
  const tokenInfo = useTokenInfoByPoolId(pool as string)
  const baseToken = useBaseTokenInfo()

  const [tokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol: baseToken?.symbol,
    tokenBSymbol: tokenInfo?.symbol,
    tokenAmount: 1,
  })

  const [
    { totalLiquidity, myLiquidity, myReserve, tokenDollarValue } = {} as any,
    isLoading,
  ] = usePoolLiquidity({ poolId: pool })
  const {
    bondingInfo,
    myBonding,
    myUnbonding,
    getBondingInfo,
    getUnbondingInfo,
  } = useBondingInfo()

  const isLoadingInitial = !totalLiquidity || (!totalLiquidity && isLoading)

  useEffect(() => {
    async function getTokenAddress() {
      const result = await client?.queryContractSmart(tokenInfo.swap_address, {
        info: {},
      })
      setLpTokenAddress(result?.lp_token_address)
    }
    getTokenAddress()
  }, [tokenInfo, client])

  useEffect(() => {
    if (!client || !lpTokenAddress) return
    async function getLpTokenBalance() {
      const result = await client?.queryContractSmart(lpTokenAddress, {
        balance: {
          address: address,
        },
      })
      setLpTokenAmount(result?.balance)
    }
    getLpTokenBalance()
  }, [lpTokenAddress, address, client])

  const hardRefresh = () => {
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
  const onSubmit = async ({ type, amount = 0 }) => {
    if (!address || !client) {
      return null
    }
    if (type === 'bond') {
      try {
        await client.execute(
          address,
          lpTokenAddress,
          {
            send: {
              contract: TOKEN_INCENTIVE_ADDRESS,
              amount: amount.toString(),
              msg: '',
            },
          },
          {
            amount: [],
            gas: '400000',
          }
        )
        toast.success('Successfully bonded.')
        hardRefresh()
      } catch (e) {
        toast.error(e.message)
      }
    } else {
      try {
        await client.execute(
          address,
          TOKEN_INCENTIVE_ADDRESS,
          {
            create_unstake: {
              unstake_amount: amount.toString(),
            },
          },
          {
            amount: [],
            gas: '400000',
          }
        )
        toast.success('Unbonding started')
        hardRefresh()
      } catch (e) {
        toast.error(e.message)
      }
    }
  }

  const onWithdraw = async (index: number) => {
    if (!address || !client) {
      return null
    }
    try {
      await client.execute(
        address,
        TOKEN_INCENTIVE_ADDRESS,
        {
          fetch_unstake: {
            index: index,
          },
        },
        {
          amount: [],
          gas: '400000',
        }
      )
      getBondingInfo()
      getUnbondingInfo()
      toast.success('Successfully withdrawn')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const unBondingAmount = useMemo(
    () => myUnbonding?.reduce((prev, curr) => prev + Number(curr[0]), 0),
    [myUnbonding]
  )
  const APR = useMemo(() => {
    if (!bondingInfo) return '0.00'
    const lpTokenPrice = totalLiquidity?.dollarValue / totalLiquidity.coins
    const stakedDollarValue =
      (Number(bondingInfo.stake_amount) * lpTokenPrice) / 2
    const tokenAmount = stakedDollarValue / tokenDollarValue
    return ((INCENTIVE_AMOUNT * 100) / tokenAmount).toFixed(2)
  }, [bondingInfo, tokenDollarValue, totalLiquidity])

  const myDailyReward = useMemo(() => {
    if (!bondingInfo) return '0.00'
    if (Number(myBonding?.amount) == 0) return '0.00'
    const reward =
      ((INCENTIVE_AMOUNT / 365) * Number(myBonding?.amount)) /
      Number(bondingInfo?.stake_amount)
    return reward.toFixed(2)
  }, [bondingInfo, myBonding])

  const rewardAmount = useMemo(() => {
    if (!bondingInfo || !myBonding) return 0
    const { daily_reward_amount, stake_amount } = bondingInfo

    const { last_time, amount } = myBonding
    const current_time = Math.floor(new Date().valueOf() / 1000)

    const reward =
      (Number(daily_reward_amount) *
        Number(amount) *
        (Math.floor(current_time / 86400) - Math.floor(last_time / 86400))) /
      Number(stake_amount)
    return reward
  }, [bondingInfo, myBonding])

  const rewardTokenAmount = useMemo(() => {
    return (rewardAmount / tokenDollarValue).toFixed(2)
  }, [tokenDollarValue, rewardAmount])

  if (!tokenInfo || !pool) {
    return null
  }

  return (
    <>
      {pool && (
        <ManagePoolDialog
          isShowing={isManageLiquidityDialogShowing}
          onRequestClose={() => setIsManageLiquidityDialogShowing(false)}
          poolId={pool as string}
        />
      )}
      {__POOL_REWARDS_ENABLED__ && (
        <BondLiquidityDialog
          isShowing={isBondingDialogShowing}
          lpTokenAmount={lpTokenAmount}
          onRequestClose={() => setIsBondingDialogShowing(false)}
          onSubmit={onSubmit}
          poolId={pool}
        />
      )}

      {pool && (
        <Head>
          <title>
            {APP_NAME} — Pool {tokenInfo.pool_id}
          </title>
        </Head>
      )}

      <AppLayout>
        <Container className="middle mauto">
          <StyledWrapperForNavigation>
            <StyledNavElement position="left">
              <Link href="/pools" passHref>
                <IconWrapper
                  as="a"
                  type="button"
                  size="20px"
                  icon={<Chevron />}
                />
              </Link>
            </StyledNavElement>
            <StyledNavElement position="center">
              <Text variant="header" transform="capitalize">
                Pool {tokenInfo.pool_id}
              </Text>
            </StyledNavElement>
          </StyledWrapperForNavigation>
          <PoolInfo
            bondingInfo={bondingInfo}
            tokenDollarValue={tokenDollarValue}
            myDailyReward={myDailyReward}
          />

          {isLoadingInitial && (
            <StyledDivForSpinner>
              <Spinner color="black" size={32} />
            </StyledDivForSpinner>
          )}
          <StyledDivForWrapper>
            {!isLoadingInitial && (
              <>
                <StyledRowForTokensInfo kind="wrapper" className="pool-wrapper">
                  <StyledRowForTokensInfo kind="column">
                    <Text css={{ paddingRight: '$13' }}>
                      Pool #{tokenInfo.pool_id}
                    </Text>
                    <StyledTextForTokens kind="wrapper">
                      <StyledTextForTokens kind="element">
                        <StyledImageForToken src="https://i.ibb.co/T0TrSgT/block-logo.png" />
                        <Text color="body" variant="caption">
                          {baseToken.symbol}
                        </Text>
                      </StyledTextForTokens>
                      <StyledTextForTokens kind="element">
                        <StyledImageForToken
                          as={tokenInfo.logoURI ? 'img' : 'div'}
                          src={tokenInfo.logoURI}
                        />
                        <Text color="body" variant="caption">
                          {tokenInfo.symbol}
                        </Text>
                      </StyledTextForTokens>
                    </StyledTextForTokens>
                  </StyledRowForTokensInfo>
                  <StyledRowForTokensInfo kind="column">
                    <Text
                      variant="caption"
                      color="tertiary"
                      transform="lowercase"
                    >
                      {isPriceLoading
                        ? ''
                        : `1 ${baseToken.symbol} = ${tokenPrice} ${tokenInfo.symbol}`}
                    </Text>
                  </StyledRowForTokensInfo>
                </StyledRowForTokensInfo>

                <StyledDivForSeparator />

                <StyledElementForLiquidity kind="wrapper">
                  <StyledElementForLiquidity kind="row">
                    <Text
                      variant="body"
                      color="secondary"
                      css={{ paddingBottom: '$3' }}
                    >
                      Total Liquidity
                    </Text>
                    <Text
                      variant="body"
                      color="secondary"
                      css={{ paddingBottom: '$3' }}
                    >
                      APR reward
                    </Text>
                  </StyledElementForLiquidity>
                  <StyledElementForLiquidity kind="row">
                    <Text variant="header">
                      {parseCurrency(totalLiquidity?.dollarValue)}
                    </Text>
                    <Text variant="header">{APR}%</Text>
                  </StyledElementForLiquidity>
                </StyledElementForLiquidity>

                <StyledDivForSeparator />

                <>
                  <Text css={{ padding: '$12 0 $9' }} variant="primary">
                    Personal shares
                  </Text>
                  <StyledDivForCards className="personal-shares">
                    <PoolAvailableLiquidityCard
                      myLiquidity={myLiquidity}
                      myReserve={myReserve}
                      totalLiquidity={totalLiquidity}
                      tokenDollarValue={tokenDollarValue}
                      tokenASymbol={baseToken.symbol}
                      tokenBSymbol={tokenInfo.symbol}
                      onButtonClick={() =>
                        setIsManageLiquidityDialogShowing(true)
                      }
                    />
                    <PoolBondedLiquidityCard
                      onButtonClick={() => setIsBondingDialogShowing(true)}
                      myLiquidity={myLiquidity}
                      myBonding={myBonding}
                      totalLiquidity={totalLiquidity}
                      tokenASymbol={baseToken.symbol}
                      tokenBSymbol={tokenInfo.symbol}
                    />
                  </StyledDivForCards>
                </>

                {__POOL_REWARDS_ENABLED__ && (
                  <>
                    <Text
                      css={{ padding: '$12 0 $9', fontWeight: '$bold' }}
                      color="body"
                    >
                      Unbonding Liquidity
                    </Text>
                    <StyledElementForUnbonding kind="list">
                      {myUnbonding?.map((unbonding, index) => (
                        <UnbondingLiquidityCard
                          key={unbonding[1]}
                          totalLiquidity={totalLiquidity}
                          unbonding={unbonding}
                          index={index}
                          lockDays={bondingInfo?.lock_days}
                          onWithdraw={onWithdraw}
                        />
                      ))}
                    </StyledElementForUnbonding>
                  </>
                )}
              </>
            )}
          </StyledDivForWrapper>
        </Container>
      </AppLayout>
    </>
  )
}

const Container = styled('div', {})
const StyledDivForWrapper = styled('div', {
  borderRadius: '$radii$4',
  border: '1px solid $borderColors$default',
  boxShadow: '0px 4px 24px $borderColors$shadow',
  padding: '3rem 4rem',
})
const StyledWrapperForNavigation = styled('nav', {
  padding: '24px 0',
  display: 'flex',
  alignItems: 'center',
})

const StyledNavElement = styled('div', {
  display: 'flex',
  variants: {
    position: {
      left: {
        flex: 0.1,
        justifyContent: 'flex-start',
      },
      center: {
        flex: 0.8,
        justifyContent: 'center',
      },
      right: {
        flex: 0.1,
        justifyContent: 'flex-end',
      },
    },
  },
})

const StyledDivForSeparator = styled('hr', {
  margin: '0 auto',
  border: 'none',
  borderTop: '1px solid rgba(25, 29, 32, 0.1)',
  width: '100%',
  boxSizing: 'border-box',
  height: 1,
})

const StyledRowForTokensInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  variants: {
    kind: {
      wrapper: {
        padding: '14px 0',
        justifyContent: 'space-between',
      },
      column: {},
    },
  },
})

const StyledTextForTokens = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  alignItems: 'center',

  variants: {
    kind: {
      element: {
        columnGap: '6px',
      },
      wrapper: {
        columnGap: '23px',
      },
    },
  },
})

const StyledImageForToken = styled('img', {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#ccc',
})

const StyledElementForLiquidity = styled('div', {
  variants: {
    kind: {
      wrapper: {
        paddingTop: 22,
        paddingBottom: 28,
      },
      row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
  },
})

const StyledDivForCards = styled('div', {
  display: 'grid',
  columnGap: '18px',
  gridTemplateColumns: '1fr 1fr',
})

const StyledElementForRewards = styled('div', {
  variants: {
    kind: {
      wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 0',
      },
      tokens: {
        display: 'grid',
        columnGap: '32px',
        gridAutoFlow: 'column',
        alignItems: 'center',
      },
      column: {},
      actions: {
        '& .action-btn': {
          padding: '$2 $6',
          borderRadius: '8px',
        },
      },
    },
  },
})

const StyledElementForUnbonding = styled('div', {
  variants: {
    kind: {
      list: {
        display: 'grid',
        rowGap: '8px',
        paddingBottom: 24,
      },
    },
  },
})

const StyledDivForRewardsPlaceholder = styled('div', {
  padding: '22px 24px',
  borderRadius: '8px',
  border: '1px solid #E7E7E7',
  backgroundColor: 'rgba(25, 29, 32, 0.1)',
})

const StyledDivForSpinner = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})
