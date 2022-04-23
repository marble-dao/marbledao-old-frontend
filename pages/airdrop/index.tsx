import type { NextPage } from 'next'
import { AppLayout } from 'components/Layout/AppLayout'
import TokenAirdrop from 'features/airdrop'
import { styled } from 'components/theme'

const Airdrop: NextPage = () => {
  return (
    <AppLayout>
      <Container className="middle mauto">
        <TokenAirdrop />
      </Container>
    </AppLayout>
  )
}

export default Airdrop
const Container = styled('div', {
  
})
