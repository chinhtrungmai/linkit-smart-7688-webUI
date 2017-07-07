import promise from 'bluebird';
import rpc from '../util/rpcAPI';
import AppDispatcher from '../dispatcher/appDispatcher';
let isLocalStorageNameSupported = false;

(() => {
  const testKey = 'test';
  const storage = window.sessionStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    isLocalStorageNameSupported = true;
  } catch (error) {
    window.memoryStorage = {};
    isLocalStorageNameSupported = false;
  }
})();

const appActions = {
  isLocalStorageNameSupported: isLocalStorageNameSupported,

  commitAndReboot: (session) => {
    return rpc.reboot(session)
    .then(() => {
      return rpc.reboot(session);
    })
    .catch(() => {
      return rpc.reboot(session);
    });
  },
  loadModel: (session) => {
    return rpc.loadModel(session);
  },
  setNet: (mode, content, session) => {
    if (mode === 'ap') {
      if (content.wanProto === "3g") {
        var service, device, remove;
      	if (content.device == 'custom') device = content.customDevice;
      	else device = content.device;
      	if (content.service == 'custom') service = content.customService;
      	else service = content.service;
        return rpc.setWAN3g(content.wanProto, content.wan_orig_ifname, content.wan_orig_bridge, remove, device, service, content.apn, content.pincode, content.username, content.password, content.dialnumber, session)
        .then(() => {
          return rpc.setLANconfig3g(session);
        })
        .then(() => {
          return rpc.uciCommit('network', session);
        });
      } else {
        return rpc.setWAN(content.wanProto, content.wanIpaddr, content.wanNetmask, content.wanGateway, content.wanDns, content.wan_orig_ifname, content.wan_orig_bridge, 'eth0', session)
        .then(() => {
          var lan_ifname='apcli0';
          var type='bridge';
          return rpc.setLANifname(lan_ifname, type, session);
        })
        .then(() => {
          return rpc.uciCommit('network', session);
        });
      }
    } else if (mode === 'sta') {
      if (content.wanProto === '3g') {
      	var service, device;
      	if (content.device == 'custom') device = content.customDevice;
      	else device = content.device;
      	if (content.service == 'custom') service = content.customService;
      	else service = content.service;
        return rpc.setWAN3g(content.wanProto, content.wan_orig_ifname, content.wan_orig_bridge, content.wanIfname, device, service, content.apn, content.pincode, content.username, content.password, content.dialnumber, session)
        .then(() => {
          return rpc.uciCommit('network', session);
        });
      } else {
	    return rpc.setWAN(content.wanProto, content.wanIpaddr, content.wanNetmask, content.wanGateway, content.wanDns, content.wan_orig_ifname, content.wan_orig_bridge, content.wanIfname, session)
	    .then(() => {
          var lan_ifname = 'eth0';
          var type='';
          return rpc.setLANifname(lan_ifname, type, session);
        })
	    .then(() => {
	      return rpc.uciCommit('network', session);
	    });
      }
    }
  },
  setWifi: (mode, content, session) => {
    return rpc.setWifi(mode, content.ssid, content.key, session);
  },
  setWifiMode: (mode, session) => {
    let network = 'lan';
    let ignore = 1;
    let proto = 'dhcp';

    if (mode !== 'apsta') {
      network = 'wan';
      ignore = 0;
      proto = 'static';
    }

    return rpc.setWifiMode(mode, session)
    .then(() => {
      return rpc.setWifiNetworkConfig(network, session);
    })
    .then(() => {
      return rpc.uciCommit('wireless', session);
    })
    .then(() => {
      return rpc.setWifiIgnoreConfig(ignore, session);
    })
    .then(() => {
      return rpc.uciCommit('dhcp', session);
    })
    .then(() => {
      return rpc.setWifiProtoConfig(proto, session);
    })
    .then(() => {
      return rpc.uciCommit('network', session);
    });
  },
  scanWifi: (session) => {
    return rpc.scanWifi(session);
  },
  resetHostName: (hostname, session) => {
    return rpc.resetHostName(hostname, session);
  },
  resetPassword: (user, password) => {
    return rpc.resetPassword(user, password, window.session);
  },
  resetTimezone: (timezone, session) => {
    return rpc.resetTimezone(timezone, session)
    .then(() => {
      return rpc.uciCommit('system', session);
    });
  },
  resetRunningMode: (runmode, ip, port, session) => {
    return rpc.resetRunningMode(runmode, ip, port, session)
    .then(() => {
      return rpc.uciCommit('system', session);
    });
  },
  loadNetwork: (session) => {
    return rpc.loadNetwork(session);
  },
  loadNetstate: (session) => {
    return rpc.loadNetstate(session);
  },
  loadSystem: (session) => {
    return rpc.loadSystem(session);
  },
  initialFetchData: (session) => {
    return promise.delay(10).then(() => {
      return [
        rpc.loadSystem(session),
        rpc.loadWifi(session),
        rpc.loadNetwork(session),
        rpc.loadNetstate('lan', session),
        rpc.loadNetstate('wan', session),
      ];
    })
    .spread((system, wifi, network, lan, wan) => {
      const boardInfo = {};
      boardInfo.system = system.body.result[1].values;
      boardInfo.wifi = wifi.body.result[1].values;
      boardInfo.network = network.body.result[1].values;
      boardInfo.lan = lan.body.result[1];
      boardInfo.wan = wan.body.result[1];
      return boardInfo;
    })
    .then((boardInfo) => {
      return AppDispatcher.dispatch({
        APP_PAGE: 'CONTENT',
        boardInfo: boardInfo,
        successMsg: null,
        errorMsg: null,
      });
    });
  },

  login: function(user, password) {
    const this$ = this;
    return rpc.login(user, password)
    .then((data) => {
      const session = data.body.result[1].ubus_rpc_session;
      return session;
    })
    .then((session) => {
      window.session = session;
      if (this$.isLocalStorageNameSupported) {
        window.localStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.localStorage.session = session;
      } else {
        window.memoryStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.memoryStorage.session = session;
      }

      return rpc.grantCode(session);
    })
    .then(() => {
      return this$.initialFetchData(window.session);
    })
    .catch((err) => {
      window.session = '';

      if (this$.isLocalStorageNameSupported) {
        delete window.localStorage.session;
        delete window.localStorage.info;
      } else {
        delete window.memoryStorage.session;
        delete window.memoryStorage.info;
      }

      if (err === 'Connection failed') {
        return AppDispatcher.dispatch({
          APP_PAGE: 'LOGIN',
          successMsg: null,
          errorMsg: 'Waiting',
        });
      }

      alert(err);
    });
  },

  resetFactory: (session) => {
    return rpc.resetFactory(session);
  },

  checkFirmware: (session) => {
    return rpc.checkFirmware(session);
  },

  activeFirmware: (session) => {
    return rpc.activeFirmware(session);
  },

  uploadFirmware: (file, session) => {
    return rpc.uploadFirmware(file, session);
  },

  getQuery: (name) => {
    let match;
    const pl = /\+/g; /* Regex for replacing addition symbol with a space */
    const search = /([^&=]+)=?([^&]*)/g;
    const query = window.location.search.substring(1);
    const decode = (s) => {
      return decodeURIComponent(s.replace(pl, ' '));
    };

    const urlParams = {};
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams[name];
  },
};

export default appActions;
