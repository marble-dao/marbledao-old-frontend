import React from 'react'
import { styled } from '@stitches/react'
import DateCountdown from 'components/DateCountdown'
import { Text } from '../../../components/Text'
import { Button } from '../../../components/Button'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { toast } from 'react-toastify'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { DEPLOY_TIMESTAMP } from 'util/constants'

const TOKEN_INCENTIVE_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_INCENTIVE_ADDRESS || ''
interface PoolInfoProps {
  bondingInfo: IBondingInfo
  tokenDollarValue: number
  myDailyReward?: string
}
export const PoolInfo: React.FC<PoolInfoProps> = ({
  bondingInfo,
  tokenDollarValue,
  myDailyReward,
}) => {
  const { address, client } = useRecoilValue(walletState)
  const token = useBaseTokenInfo()
  if (!bondingInfo) return null
  const currentTimeStamp = Math.floor(new Date().getTime() / 1000)
  const rewardCount = Math.ceil(
    (currentTimeStamp - DEPLOY_TIMESTAMP) / bondingInfo.reward_interval
  )
  const dateTo =
    (DEPLOY_TIMESTAMP + bondingInfo.reward_interval * rewardCount) * 1000
  const onClaim = async () => {
    if (!address || !client) {
      return null
    }
    try {
      await client.execute(
        address,
        TOKEN_INCENTIVE_ADDRESS,
        {
          claim_reward: {},
        },
        {
          amount: [],
          gas: '400000',
        }
      )
      toast.success('Successfully claimed')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <StyledElementForCard kind="wrapper">
      <StyledElementForToken>
        <Text css={{ padding: '$4 0' }}>Block Price</Text>
        <Text variant="title" css={{ fontSize: '$15' }}>
          ${tokenDollarValue?.toFixed(6)}
        </Text>
      </StyledElementForToken>
      <StyledElementForToken>
        <Text css={{ padding: '$4 0' }}>Rewards distribution in</Text>
        <Text variant="title" css={{ fontSize: '$15' }}>
          {/*<DateCountdown
            dateTo={dateTo}
            loop
            interval={bondingInfo.reward_interval}
            mostSignificantFigure="hour"
            numberOfFigures={2}
          />*/}
          ?? : ??
        </Text>
      </StyledElementForToken>
      {myDailyReward !== undefined && (
        <StyledElementForToken>
          <Text css={{ padding: '$4 0' }}>Epoch Rewards Estimate</Text>
          <StyledContainerForToken>
            <StyledImageForToken
              as={token?.logoURI ? 'img' : 'div'}
              src={token?.logoURI}
              alt=""
            />
            <Text variant="title" css={{ fontSize: '$15' }}>
              {myDailyReward}
            </Text>
          </StyledContainerForToken>
          <StyledElementForRewards kind="actions">
            <Button
              css={{
                padding: '$3 $6',
                marginTop: '$5',
                borderRadius: '8px',
                fontSize: '$4',
              }}
              /*onClick={onClaim}*/
            >
              Claim Soon!
            </Button>
          </StyledElementForRewards>
        </StyledElementForToken>
      )}
    </StyledElementForCard>
  )
}

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
          marginTop: '$5',
          borderRadius: '8px',
        },
      },
    },
  },
})

const StyledElementForCard = styled('div', {
  variants: {
    kind: {
      wrapper: {
        padding: '$18 $22',
        marginBottom: '$10',
        borderRadius: '$radii$4',
        border: '$borderWidths$1 solid $borderColors$default',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '$radii$4',
        backgroundColor: '$backgroundColors$white',
      },
    },
  },
})

const StyledElementForToken = styled('div', {
  display: 'flex',
  flex: 1,
  minWidth: 200,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

const StyledImageForToken = styled('img', {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#ccc',
  marginRight: 10,
})

const StyledContainerForToken = styled('div', {
  display: 'flex',
})
