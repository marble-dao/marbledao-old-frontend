import React from 'react'
import { AppLayout } from '../components/Layout/AppLayout'
import { TokenSwap } from '../features/swap'
import { PageHeader } from '../components/Layout/PageHeader'
import { styled } from 'components/theme'

export default function Home() {
  return (
    <AppLayout>
      <Container className="middle mauto">
        <PageHeader
          title="Swap"
          subtitle="Swap between your favorite assets on Marble."
        />
        <TokenSwap />
      </Container>
    </AppLayout>
  )
}

const Container = styled('div', {
  
})
