import { useBaseTokenInfo, useTokenInfoByPoolId } from 'hooks/useTokenInfo'
import { Dialog, StyledCloseIcon } from 'components/Dialog'
import { Text } from 'components/Text'
import { styled } from 'components/theme'
import { LiquidityInputSelector } from './LiquidityInputSelector'
import { useState, useMemo } from 'react'
import {
  dollarValueFormatter,
  dollarValueFormatterWithDecimals,
} from 'util/conversion'
import { PercentageSelection } from './PercentageSelection'
import { BondingSummary } from './BondingSummary'
import { Divider } from './Divider'
import { DialogFooter } from './DialogFooter'
import { SecondaryButton } from './SecondaryButton'
import { PrimaryButton } from './PrimaryButton'
import { usePoolLiquidity } from 'hooks/usePoolLiquidity'
import { StateSwitchButtons } from './StateSwitchButtons'
import dayjs from 'dayjs'
import { useBondingInfo } from 'hooks/useBondingInfo'

export const BondLiquidityDialog = ({
  isShowing,
  onRequestClose,
  poolId,
  lpTokenAmount,
  onSubmit,
}) => {
  const baseToken = useBaseTokenInfo()
  const tokenInfo = useTokenInfoByPoolId(poolId)

  const [{ myLiquidity, totalLiquidity } = {} as any] = usePoolLiquidity({
    poolId,
  })
  const { myBonding } = useBondingInfo()

  const [liquidityDollarAmount, setLiquidityDollarAmount] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [dialogState, setDialogState] = useState<'bond' | 'unbond'>('bond')
  const tokenAmount = useMemo(
    () => (dialogState === 'bond' ? lpTokenAmount : myBonding?.amount),
    [dialogState, lpTokenAmount, myBonding]
  )
  const maxDollarValueLiquidity = useMemo(
    () =>
      dialogState === 'bond'
        ? myLiquidity?.dollarValue ?? 0
        : (Number(myBonding?.amount) / totalLiquidity?.coins) *
            totalLiquidity.dollarValue ?? 0,
    [dialogState, myLiquidity, totalLiquidity, myBonding]
  )

  const canManageBonding = true

  const handleClick = async () => {
    setIsLoading(true)
    await onSubmit({
      type: dialogState,
      amount: Number(
        (
          tokenAmount *
          (liquidityDollarAmount / maxDollarValueLiquidity)
        ).toFixed(0)
      ),
    })
    setIsLoading(false)
    setLiquidityDollarAmount(0)
    onRequestClose()
  }
  return (
    <Dialog kind="blank" isShowing={isShowing} onRequestClose={onRequestClose}>
      <StyledCloseIcon onClick={onRequestClose} offset={19} size="16px" />

      <StyledDivForContent>
        {canManageBonding ? (
          <Text variant="header" css={{ paddingBottom: '$8' }}>
            Manage LP Tokens
          </Text>
        ) : (
          <>
            <Text variant="header" css={{ paddingBottom: '$2' }}>
              Bond tokens
            </Text>
            <Text variant="body" css={{ paddingBottom: '$10' }}>
              Choose how many tokens to bond
            </Text>
          </>
        )}
      </StyledDivForContent>

      {canManageBonding && (
        <>
          <StyledDivForContent kind="bondingHeader">
            <StateSwitchButtons
              activeValue={dialogState === 'bond' ? 'bonding' : 'unbonding'}
              values={['bonding', 'unbonding']}
              onStateChange={(value) => {
                setDialogState(value === 'bonding' ? 'bond' : 'unbond')
              }}
            />
          </StyledDivForContent>
          <Divider />
          <StyledDivForContent>
            <Text variant="body" css={{ padding: '$8 0 $6' }}>
              Choose your token amount
            </Text>
          </StyledDivForContent>
        </>
      )}
      <StyledDivForContent kind="form">
        <LiquidityInputSelector
          maxLiquidity={maxDollarValueLiquidity}
          liquidity={liquidityDollarAmount}
          onChangeLiquidity={(value) => setLiquidityDollarAmount(value)}
        />
        <Text variant="caption" color="tertiary" css={{ padding: '$6 0 $9' }}>
          Max available for bonding is worth $
          {dollarValueFormatterWithDecimals(maxDollarValueLiquidity, {
            includeCommaSeparation: true,
          })}
        </Text>
        <PercentageSelection
          maxLiquidity={maxDollarValueLiquidity}
          liquidity={liquidityDollarAmount}
          onChangeLiquidity={setLiquidityDollarAmount}
        />
      </StyledDivForContent>
      <Divider />
      <StyledDivForContent>
        <BondingSummary
          label={dialogState === 'bond' ? 'Bonding' : 'Unbonding'}
          lpTokenAmount={tokenAmount}
          tokenA={baseToken}
          tokenB={tokenInfo}
          maxLiquidity={maxDollarValueLiquidity}
          liquidityAmount={liquidityDollarAmount}
          onChangeLiquidity={setLiquidityDollarAmount}
        />
      </StyledDivForContent>
      <Divider />
      <StyledDivForContent>
        <DialogFooter
          title={
            dialogState === 'bond'
              ? 'Unbonding Period: 14 days'
              : `Available on: ${dayjs().add(14, 'day').format('MMMM D YYYY')}`
          }
          text={
            dialogState === 'bond'
              ? "There'll be 14 days from the time you decide to unbond your tokens, to the time you can redeem your previous bond."
              : `Because of the 14 days unbonding period, you will be able to redeem your $${dollarValueFormatter(
                  liquidityDollarAmount,
                  {
                    includeCommaSeparation: true,
                  }
                )} worth of bonded token on ${dayjs()
                  .add(14, 'day')
                  .format('MMM D')}.`
          }
          buttons={
            <>
              <SecondaryButton onClick={onRequestClose}>Cancel</SecondaryButton>
              <PrimaryButton
                onClick={handleClick}
                loading={isLoading}
                disabled={isLoading || !liquidityDollarAmount}
              >
                {dialogState === 'bond' ? 'Bond' : 'Unbond'}
              </PrimaryButton>
            </>
          }
        />
      </StyledDivForContent>
    </Dialog>
  )
}

const StyledDivForContent = styled('div', {
  padding: '0px 28px',
  variants: {
    kind: {
      form: {
        paddingBottom: 24,
      },
      bondingHeader: {
        paddingBottom: 16,
      },
    },
  },
})
