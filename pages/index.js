import React, { useEffect } from 'react';
import Header from '@makerdao/ui-components-header';
import Footer from '@makerdao/ui-components-footer';
import { Box, Flex, Text, Grid } from '@makerdao/ui-components-core';
import { Breakout } from '../components/Typography';
import WalletManager from '../components/WalletManager';
import useStore from '../hooks/useStore';
import useMaker from '../hooks/useMaker';
import { getWebClientProviderName } from '../utils/web3';

function Index() {
  const [store, dispatch] = useStore();
  const { providerName, saiAvailable } = store;

  useEffect(() => {
    dispatch({
      type: 'assign',
      payload: {
        providerName: getWebClientProviderName()
      }
    });
  }, [dispatch]);

  const { maker } = useMaker();

  useEffect(() => {
    (async () => {
      if (!maker) return;
      const mig = await maker
        .service('migration')
        .getMigration('single-to-multi-cdp');
      dispatch({
        type: 'assign',
        payload: {
          saiAvailable: (await mig.migrationSaiAvailable()).toNumber()
        }
      });
    })();
  }, [dispatch, maker]);

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Header />
      <Grid
        maxWidth="113.4rem"
        width="100%"
        m="0 auto"
        px="m"
        pt={{ s: 'm', l: 'xl' }}
        pb={{ s: 'xl', l: 'm' }}
        gridTemplateColumns={{ s: '1fr', l: 'auto' }}
        gridColumnGap="xl"
        gridRowGap="m"
      >
        <Box
          maxWidth="57.6rem"
          width="100%"
          mt="xl"
          textAlign={{ s: 'center', l: 'center' }}
          justifySelf={{ s: 'center', l: 'center' }}
        >
          <Text.h1 alignSelf="center" mb="s">
            Migrate and Upgrade
          </Text.h1>
          <Breakout>
            Use Migrate after system updates to change your Dai, MKR, and CDPs
            into their new versions. Connect your wallet to view available
            migrations on your account.
          </Breakout>
        </Box>
      </Grid>
      <Text.h4 alignSelf="center" mb="s" color="#546978">
        Connect a wallet to get started
      </Text.h4>
      <Grid
        maxWidth="113.4rem"
        width="100%"
        m="0 auto"
        px="m"
        pb={{ s: 'xl', l: 'l' }}
        gridTemplateColumns={{ s: '1fr', l: 'auto' }}
        gridColumnGap="xl"
        gridRowGap="m"
      >
        <WalletManager providerName={providerName} />
      </Grid>
      {saiAvailable && (
        <Text m="0 auto" mb="m">
          Sai available: {saiAvailable.toFixed(2)}
        </Text>
      )}
      <Footer />
    </Flex>
  );
}

export default Index;
