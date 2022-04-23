import type { NextPage } from 'next'
import { AppLayout } from 'components/Layout/AppLayout'
import TokenAirdrop from 'features/block-airdrop'

const Airdrop: NextPage = () => {
  return (
    <AppLayout>
      <TokenAirdrop />
    </AppLayout>
  )
}

export default Airdrop
