import { useReducer, useCallback } from 'react';
import useMaker from '../hooks/useMaker';
import useWallet from '../hooks/useWallet';
import { AccountTypes } from '../utils/constants';

const TREZOR_PATH = "44'/60'/0'/0/0";

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'connect-start':
      return initialState;
    case 'fetch-start':
      return {
        ...state,
        fetching: true
      };
    case 'connect-success':
      return {
        ...state,
        fetching: false,
        onAccountChosen: payload.onAccountChosen
      };
    case 'fetch-success':
      const newAccountsLength = payload.accounts.length;
      const offset = payload.offset * newAccountsLength;
      const newAccounts = [
        ...state.accounts.slice(0, offset),
        ...payload.accounts,
        ...state.accounts.slice(offset + newAccountsLength)
      ];
      return {
        ...state,
        fetching: false,
        accounts: newAccounts
      };
    case 'error':
      return {
        ...state,
        fetching: false
      };
    default:
      throw new Error(`Unexpected action with type '${type}'`);
  }
};

const initialState = {
  fetching: false,
  accounts: [],
  onAccountChosen: () => {}
};

const DEFAULT_ACCOUNTS_LENGTH = 25;

// Helper hook to show trezor connection modals. Only for use in this app.
export function useTrezor({ onAccountChosen }) {
  const { show } = useWallet();

  const connectTrezorWallet = useCallback(
    path => {
      console.log('using hardwareccountselect');
      show({
        modalType: 'hardwareaccountselect',
        modalProps: {
          type: AccountTypes.TREZOR,
          path: TREZOR_PATH,
          confirmAddress: address => {
            onAccountChosen(address, AccountTypes.TREZOR);
          }
        }
      });
    },
    [show, onAccountChosen]
  );

  return { connectTrezorWallet };
}

// Helper hook to show ledger connection modals. Only for use in this app.
export function useLedger({ onAccountChosen }) {
  const { show } = useWallet();
  const accountSelection = useCallback(
    path => {
      show({
        modalType: 'hardwareaccountselect',
        modalProps: {
          type: AccountTypes.LEDGER,
          path,
          confirmAddress: address => {
            onAccountChosen(address, AccountTypes.LEDGER);
          }
        }
      });
    },
    [show, onAccountChosen]
  );

  const connectLedgerWallet = useCallback(
    path => {
      show({
        modalType: 'ledgertype',
        modalProps: {
          onPathSelect: accountSelection
        }
      });
    },
    [show]
  );

  return { connectLedgerWallet };
}

function useHardwareWallet({
  type,
  path,
  initialOffset = 0,
  accountsLength = DEFAULT_ACCOUNTS_LENGTH
}) {
  const { maker } = useMaker();
  const [state, dispatch] = useReducer(reducer, initialState);

  function connect() {
    dispatch({ type: 'connect-start' });
    return maker.addAccount({
      type,
      path,
      accountsOffset: 0,
      accountsLength: accountsLength,
      choose: async (accounts, onAccountChosen) => {
        console.log(accounts);
        dispatch({ type: 'connect-success', payload: { onAccountChosen } });
        dispatch({ type: 'fetch-success', payload: { accounts, offset: 0 } });
      }
    });
  }

  function fetch({ offset }) {
    return new Promise((resolve, reject) => {
      dispatch({ type: 'fetch-start' });
      maker
        .addAccount({
          type,
          path,
          accountsOffset: offset,
          accountsLength,
          choose: async accounts => {
            dispatch({ type: 'fetch-success', payload: { accounts, offset } });
            resolve(accounts);
          }
        })
        .catch(err => {
          dispatch({ type: 'error' });
          reject(err);
        });
    });
  }

  function pickAccount(address) {
    return state.onAccountChosen(null, address);
  }

  return {
    fetch,
    connect,
    fetching: state.fetching,
    accounts: state.accounts,
    pickAccount
  };
}

export default useHardwareWallet;
