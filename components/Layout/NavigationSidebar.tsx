import React from 'react'
import { useEffect, useState} from 'react'
import Link from 'next/link'
import { Button } from '../Button'
{/*import { Text } from '../Text'
import { Logo } from '../../icons/Logo'
import { LogoText } from '../../icons/LogoText'*/}
import { useConnectWallet } from '../../hooks/useConnectWallet'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from '../../state/atoms/walletAtoms'
import { useRouter } from 'next/router'
import { UpRightArrow, Exchange, Presale, Open, Dao, NFTs, Dash, NewDash, Airdrop, Astronaut, Nav } from '../../icons'
import { IconWrapper } from '../IconWrapper'
import { ConnectedWalletButton } from '../ConnectedWalletButton'

import { styled } from '../theme'
import { __TEST_MODE__ } from '../../util/constants'

export function NavigationSidebar({ openNav ,setOpenNav }) {
  const { mutate: connectWallet } = useConnectWallet()
  const [{ key }, setWalletState] = useRecoilState(walletState)

  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
    })
  }

  const { pathname } = useRouter()
  const getActiveStylesIfActive = (path) =>
    pathname === path ? { borderBottom: '3px solid $white', background: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 100%)" } : {borderBottom: '3px solid transparent', background: 'transparent' }



  const StyledImageForLogoText = styled('img', {
    borderRadius: '0%',
  })

  return (
    <>
      <StyledWrapper className={`wrap-header ${openNav ? 'open' :''}`}>
        <StyledMenuContainer className="wrap-menu container">
          <IconWrapper
            className="mobile-nav"
              type="button"
              icon={<Nav />}
              onClick={() => {
                setOpenNav(!openNav)
              }}
            />
          <Link href="/" passHref>
            <StyledDivForLogo as="a">
              <StyledImageForLogoText className="logo-img" src="/images/logotext.svg" />
              {/*<Logo data-logo="" width="37px" height="47px" />
              <div data-logo-label="">
              <LogoText />
                <Text
                  variant="caption"
                  color="error"
                  css={{ padding: '0 0 $1 0' }}
                >
                  {__TEST_MODE__ ? 'Testnet' : 'DAO'}
                </Text>
              </div>*/}
            </StyledDivForLogo>
          </Link>
          <StyledListForLinks className="top-menu-links">
            <Link href="/" passHref>
              <Button className="top-menu"
                as="a"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Exchange />} />}
                css={getActiveStylesIfActive('/')}
              >
                Swap
              </Button>
            </Link>
            <Link href="/transfer" passHref>
              <Button className="top-menu"
                as="a"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<UpRightArrow />} />}
                css={getActiveStylesIfActive('/transfer')}
              >
                Transfer
              </Button>
            </Link>
            <Link href="/pools" passHref>
              <Button className="top-menu"
                as="a"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Open />} />}
                css={getActiveStylesIfActive('/pools')}
              >
                Liquidity
              </Button>
            </Link>
            <Link
              href="/marblenauts-nft"
              passHref
            >
              <Button className="top-menu"
                as="a"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Astronaut />} />}
                css={getActiveStylesIfActive('/marblenauts-nft')}
              >
              The Marblenauts NFTs
              </Button>
            </Link>

            <Link
              href="/block-airdrop"
              passHref
            >
              <Button className="top-menu"
                as="a"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Airdrop />} />}
                css={getActiveStylesIfActive('/block-airdrop')}
              >
                BLOCK Airdrop
              </Button>
            </Link>
            <Link
              href="https://daodao.zone/dao/juno1zz3gc2p9ntzgjt8dh4dfqnlptdynxlgd4j7u2lutwdg5xwlm4pcqyxnecp"
              passHref
            >
              <Button className="top-menu"
                as="a"
                target="__blank"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Dao />} />}
                css={getActiveStylesIfActive('/dao')}
              >
                New DAO
              </Button>
            </Link>
            <Link
              href="https://daodao.zone/dao/juno1ay840g97ngja9k0f9lnywqxwk49245snw69kpwz0ry9qv99q367q3m4x8v"
              passHref
            >
              <Button className="top-menu"
                as="a"
                target="__blank"
                iconSize="24px"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Dao />} />}
                css={getActiveStylesIfActive('/dao')}
              >
                Old DAO
              </Button>
            </Link>
          </StyledListForLinks>

          <ConnectedWalletButton
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onConnect={() => connectWallet(null)}
            onDisconnect={resetWalletConnection}
            css={{ marginBottom: '$6' }}
          />

        </StyledMenuContainer>
      </StyledWrapper>
      <MobileMenu className={`mobile-menu ${openNav ? 'open' :''}`}>
        <StyledListForLinks className={`top-menu-links ${openNav ? 'open' :''}`}>
        {/*<Link href="/" passHref>
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<NewDash />} />}
              css={getActiveStylesIfActive('/dashboard')}
            >
              Dashboard
            </Button>
          </Link>*/}
          <Link href="/" passHref>
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Exchange />} />}
              css={getActiveStylesIfActive('/')}
            >
              Swap
            </Button>
          </Link>
          <Link href="/transfer" passHref>
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<UpRightArrow />} />}
              css={getActiveStylesIfActive('/transfer')}
            >
              Transfer
            </Button>
          </Link>
          <Link href="/pools" passHref>
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Open />} />}
              css={getActiveStylesIfActive('/pools')}
            >
              Liquidity
            </Button>
          </Link>
          <Link
            href="/marblenauts-nft"
            passHref
          >
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Astronaut />} />}
              css={getActiveStylesIfActive('/marblenauts-nft')}
            >
            The Marblenauts NFTs
            </Button>
          </Link>
          <Link
            href="/block-airdrop"
            passHref
          >
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Airdrop />} />}
              css={getActiveStylesIfActive('/block-airdrop')}
            >
              BLOCK Airdrop
            </Button>
          </Link>


          {/*
            <Link href="/presale" passHref>
              <Button className="top-menu"
                as="a"
                variant="ghost"
                iconCenter={<IconWrapper icon={<Presale />} />}
                css={getActiveStylesIfActive('/presale')}
              >
                Presale
              </Button>
            </Link>
            <Link
            href=""
            passHref
          >
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<NFTs />} />}
              css={getActiveStylesIfActive('/dao')}
            >
              Marble NFTs
            </Button>
            </Link>

          <Link
            href="/airdrop"
            passHref
          >
            <Button className="top-menu"
              as="a"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Airdrop />} />}
              css={getActiveStylesIfActive('/airdrop')}
            >
              Marble GovDrop
            </Button>
          </Link>*/}

          <Link
            href="https://daodao.zone/dao/juno1zz3gc2p9ntzgjt8dh4dfqnlptdynxlgd4j7u2lutwdg5xwlm4pcqyxnecp"
            passHref
          >
            <Button className="top-menu"
              as="a"
              target="__blank"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Dao />} />}
              css={getActiveStylesIfActive('/dao')}
            >
              New DAO
            </Button>
          </Link>
          <Link
            href="https://daodao.zone/dao/juno1ay840g97ngja9k0f9lnywqxwk49245snw69kpwz0ry9qv99q367q3m4x8v"
            passHref
          >
            <Button className="top-menu"
              as="a"
              target="__blank"
              variant="ghost"
              iconCenter={<IconWrapper icon={<Dao />} />}
              css={getActiveStylesIfActive('/dao')}
            >
              Old DAO
            </Button>
          </Link>
        </StyledListForLinks>
      </MobileMenu>
    </>
  )
}

const StyledWrapper = styled('div', {
  color: '$colors$white',
  backgroundColor: '$black',
  overflow: 'auto',
  borderRight: '1px solid $borderColors$inactive',
})

const StyledMenuContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: '$2',
  paddingTop: '$10',
  ' a':{
    color: '$colors$white',
    display: 'flex',
    ' svg':{
      color: '$colors$white',
      stroke: '$colors$white',
    },
  }
})

const StyledListForLinks = styled('div', {
  display: 'flex',
  rowGap: '$space$2',
  flexDirection: 'row',
})



const StyledDivForLogo = styled('div', {
  columnGap: '$space$4',
  alignItems: 'center',
  paddingBottom: '$8',
  '& [data-logo]': {
    marginBottom: '$2',
  },
})

const MobileMenu = styled('div', {

})
