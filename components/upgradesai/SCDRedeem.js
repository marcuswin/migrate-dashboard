import React, { useState } from 'react';
import {
  Box,
  Text,
  Button,
  Grid,
  Card,
  Input,
  Link
} from '@makerdao/ui-components-core';
import useStore from '../../hooks/useStore';
import useValidatedInput from '../../hooks/useValidatedInput';
import { TextBlock } from '../Typography';
import { prettifyNumber } from '../../utils/ui';
import { SAI } from '../../maker';

export default ({ onNext, onPrev }) => {
  const [{ saiBalance, daiAvailable }, dispatch] = useStore();
  const [maxSelected, setMaxSelected] = useState();
  const maxOverall = Math.min(
    saiBalance && saiBalance.toNumber(),
    daiAvailable
  );
  const [amount, setAmount, onAmountChange, amountErrors] = useValidatedInput(
    '',
    {
      maxFloat: maxOverall,
      minFloat: 0,
      isFloat: true
    },
    {
      maxFloat: amount => {
        return amount > saiBalance.toNumber()
          ? 'Insufficient Sai balance'
          : 'Amount exceeds Dai availability';
      }
    }
  );

  const setMax = () => {
    setMaxSelected(true);
    setAmount(maxOverall);
  };

  const onChange = event => {
    onAmountChange(event);
    setMaxSelected(false);
  };

  return (
    <Grid maxWidth="912px" gridRowGap="m" px={['s', 0]}>
      <Text.h2 textAlign="center">Upgrade Single-Collateral Sai</Text.h2>
      <Text.p
        textAlign="center"
        t="body"
        fontSize="1.8rem"
        m="0 auto"
        display={{ s: 'none', m: 'block' }}
      >
        How much Single-collateral Sai would you like to upgrade to
        Multi-collateral Dai?
      </Text.p>
      <Grid
        gridTemplateColumns={{ s: 'minmax(0, 1fr)', l: '2fr 1fr' }}
        gridGap="m"
        my={{ s: 's', l: 'l' }}
      >
        <Card px={{ s: 'm', m: 'l' }} py={{ s: 'm', m: 'l' }}>
          <Grid gridRowGap="m">
            <TextBlock t="h5" lineHeight="normal">
              Enter the amount you would like to upgrade.
            </TextBlock>
            <Input
              type="number"
              value={amount}
              disabled={!saiBalance}
              min="0"
              placeholder="0.00 SAI"
              onChange={onChange}
              failureMessage={amountErrors}
              after={
                <Link color="blue" fontWeight="medium" onClick={setMax}>
                  Set max
                </Link>
              }
            />
            <Grid gridRowGap="xs">
              <Box>
                <Text t="subheading">Sai Balance</Text>
                <Text
                  t="caption"
                  display="inline-block"
                  ml="s"
                  color="darkLavender"
                >
                  {saiBalance ? prettifyNumber(saiBalance) : '...'}
                </Text>
              </Box>
            </Grid>
          </Grid>
        </Card>
        <Card px={{ s: 'm', m: 'l' }} py={{ s: 'm', m: 'l' }}>
          <Grid gridRowGap="m">
            <Grid gridRowGap="xs">
              <TextBlock t="h5" lineHeight="normal">
                SAI to DAI exchange rate
              </TextBlock>
              <TextBlock t="body">1:1</TextBlock>
            </Grid>
            <Grid gridRowGap="xs">
              <TextBlock t="h5" lineHeight="normal">
                Max SAI to DAI availability
              </TextBlock>
              <TextBlock t="body">
                {daiAvailable || daiAvailable === 0
                  ? `${prettifyNumber(daiAvailable)} DAI`
                  : '...'}
              </TextBlock>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid
        justifySelf="center"
        justifyContent="center"
        gridTemplateColumns="auto auto"
        gridColumnGap="m"
      >
        <Button variant="secondary-outline" onClick={onPrev}>
          Cancel
        </Button>
        <Button
          disabled={!amount || amountErrors}
          onClick={() => {
            dispatch({
              type: 'assign',
              payload: {
                saiAmountToMigrate: maxSelected ? saiBalance : SAI(amount)
              }
            });
            onNext();
          }}
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  );
};
