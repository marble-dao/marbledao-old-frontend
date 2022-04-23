import type { NextPage } from 'next'
import { AppLayout } from 'components/Layout/AppLayout'
import TokenPresale from 'features/presale'
import { styled } from 'components/theme'

const Presale: NextPage = () => {
  return (
    <AppLayout>
      <Container className="middle mauto">
        <TokenPresale />
      </Container>
    </AppLayout>
  )
}

export default Presale
const Container = styled('div', {
  
})