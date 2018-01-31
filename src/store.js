import { AsyncStorage } from 'react-native';
import { extendObservable, action, observable } from 'mobx';
import ComputedWallet from './computed/wallet';
import ComputedTransactions from './computed/transactions';
import ComputedChannels from './computed/channels';
import { DEFAULT_ROUTE } from './config';
import * as log from './actions/logs';

class Store {
  constructor() {
    extendObservable(this, {
      loaded: false, // Is persistent data loaded
      lndReady: false, // Is lnd process running
      route: DEFAULT_ROUTE,

      balanceSatoshis: null,
      confirmedBalanceSatoshis: null,
      unconfirmedBalanceSatoshis: null,
      channelBalanceSatoshis: null,
      pubKey: null,
      walletAddress: null,

      transactionsResponse: null,
      invoicesResponse: null,
      paymentsResponse: null,
      peersResponse: null,
      channelsResponse: null,
      paymentRequestResponse: {},
      logs: observable([]),

      // Persistent data
      settings: {
        seedMnemonic: null,
      },
    });

    // DEBUG ONLY!
    // AsyncStorage.clear();

    ComputedWallet(this);
    ComputedTransactions(this);
    ComputedChannels(this);

    try {
      AsyncStorage.getItem('settings').then(
        action(stateString => {
          const state = JSON.parse(stateString);
          state &&
            Object.keys(state).forEach(key => {
              if (typeof this.settings[key] !== 'undefined') {
                this.settings[key] = state[key];
              }
            });
          log.info('Loaded initial state');
          this.loaded = true;
        })
      );
    } catch (err) {
      log.info('Store load error', err);
      this.loaded = true;
    }
  }

  save() {
    try {
      const state = JSON.stringify(this.settings);
      AsyncStorage && AsyncStorage.setItem('settings', state);
      log.info('Saved state');
    } catch (error) {
      log.info('Store Error', error);
    }
  }

  clear() {
    log.info('!!!!!!!!!CLEARING ALL PERSISTENT DATA!!!!!!');
    Object.keys(this.settings).map(key => (this.settings[key] = null));
    this.save();
  }
}

export default new Store();
