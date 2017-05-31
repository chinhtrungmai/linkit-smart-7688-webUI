import Promise from 'bluebird';
import request from 'superagent';
import ubusStatus from './ubusStatus';
let id = 1;
let RPCurl = '/ubus';

if (window.location.hostname === '127.0.0.1') {
  RPCurl = 'http://mylinkit.local/ubus';
}

const rpcAPI = {
  request: function(config) {
    return new Promise((resolve, reject) => {
      request
      .post(RPCurl)
      .send(config)
      .set('Accept', 'application/json')
      .end((err, res) => {
        // return res.ok ? resolve(res) : reject(err);
        if (!res) {
          return reject('Connection failed');
        }

        if (!res.ok) {
          return reject('Connection failed');
        }

        if (res.body && res.body.error) {
          return reject(res.body.error.message);
        }

        if (!res.body.result || res.body.result[0] !== 0) {
          return reject(ubusStatus[res.body.result[0]]);
        }
        return resolve(res);
      });
    });
  },

  // ====== login start ========
  login: function(userId, password) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        '00000000000000000000000000000000',
        'session',
        'login',
        {
          username: userId,
          password: password,
        },
      ],
    };
    return this.request(config);
  },

  loadModel: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [ session, 'system', 'board', { dummy: 0 }],
    };

    return this.request(config);
  },

  grantCode: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'session',
        'grant',
        {
          scope: 'uci',
          objects: [['*', 'read'], ['*', 'write']],
        },
      ],
    };
    return this.request(config);
  },
  // ====== login end ========
  scanWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'iwinfo', 'scan', { device: 'ra0' }],
    };

    return this.request(config);
  },
  setWifiIgnoreConfig: function(ignore, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'dhcp',
          section: 'lan',
          values: {
            ignore: ignore,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiProtoConfig: function(proto, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'lan',
          values: {
            proto: proto,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiNetworkConfig: function(network, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'sta',
          values: {
            network: network,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiMode: function(mode, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'radio0',
          values: {
            linkit_mode: mode,
          },
        },
      ],
    };

    return this.request(config);
  },
  setWifi: function(section, ssid, key, session) {
    let enc = 'none';
    if (key.length > 1) {
      enc = 'psk2';
    }

    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: section,
          values: {
            ssid: ssid,
            key: key,
            encryption: enc,
          },
        },
      ],
    };

    return this.request(config);
  },
  setLANifname: function(ifname, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'lan',
          values: {
            ifname: ifname,
          },
        },
      ],
    };

    return this.request(config);
  },
  setWAN: function(wanProto, wanIpaddr, wanNetmask, wanGateway, wanDns, wan_orig_ifname, wan_orig_bridge, wanIfname, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'wan',
          values: {
            proto: wanProto,
            ipaddr: wanIpaddr,
            netmask: wanNetmask,
            gateway: wanGateway,
            dns: wanDns,
            _orig_ifname: wan_orig_ifname,
            _orig_bridge: wan_orig_bridge,
            ifname: wanIfname,
          },
        },
      ],
    };

    return this.request(config);
  },
  setWAN3g: function(wanProto, wan_orig_ifname, wan_orig_bridge, wanIfname, wan_device, wan_service, wan_apn, wan_pincode, wan_username, wan_password, wan_dialnumber, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'wan',
          values: {
            proto: wanProto,
            _orig_ifname: wan_orig_ifname,
            _orig_bridge: wan_orig_bridge,
            ifname: wanIfname,
            device: wan_device,
            service: wan_service,
            apn: wan_apn,
            pincode: wan_pincode,
            username: wan_username,
            password: wan_password,
            dialnumber: wan_dialnumber,
          },
        },
      ],
    };
    return this.request(config);
  },
  setLANconfig3g: function(session) {
      const config = {
        jsonrpc: '2.0',
        id: id++,
        method: 'call',
        params: [
          session,
          'uci',
          'set',
          {
            config: 'network',
            section: 'lan',
            values: {
              ifname: 'eth0',
              proto: 'dhcp',
            },
          },
        ],
      };
      return this.request(config);
    },
  uciCommit: function(uciConfig, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'commit', {
          config: uciConfig,
        },
      ],
    };
    return this.request(config);
  },
  commitWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'apply', { commit: true }]};

    return this.request(config);
  },
  reboot: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'reboot', { dummy: 0}],
    };

    return this.request(config);
  },
  resetPassword: function(user, password, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'rpc-sys',
        'password_set',
        {
          user: user,
          password: password,
        },
      ],
    };

    return this.request(config);
  },
  loadNetstate: function(iface, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'network.interface',
        'status',
        {
          interface: iface,
        },
      ],
    };

    return this.request(config);
  },
  loadNetwork: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'network' }],
    };

    return this.request(config);
  },
  loadSystem: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'get',
        {
          config: 'system',
          type: 'system',
        },
      ],
    };
    return this.request(config);
  },
  loadWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'wireless' }],
    };

    return this.request(config);
  },
  applyConfig: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'apply',
        { commit: true },
      ],
    };

    return this.request(config);
  },
  activeFirmware: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'upgrade_start', { keep: 1}],
    };

    return this.request(config);
  },
  checkFirmware: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'upgrade_test', { dummy: 0}],
    };

    return this.request(config);
  },
  uploadFirmware: function(file, session) {
    const uploadUrl = RPCurl.replace('/ubus', '/cgi-bin/cgi-upload');
    return new Promise((resolve, reject) => {
      request
      .post(uploadUrl)
      .field('sessionid', session)
      .field('filemode', '0600')
      .field('filename', '/tmp/firmware.bin')
      .attach('filedata', file, file.name)
      .end((err, res) => {
        // return res.ok ? resolve(res) : reject(err);
        if (!res.ok) {
          return reject('Connection failed');
        }
        return resolve(res);
      });
    });
  },

  reloadConfig: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'reload_config',
        { commit: true },
      ],
    };

    return this.request(config);
  },

  resetFactory: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'factory', { dummy: 0}],
    };

    return this.request(config);
  },

  resetHostName: function(hostname, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set', {
          config: 'system',
          section: '@system[0]',
          values: { hostname: hostname },
        },
      ],
    };

    return this.request(config);
  },
  resetTimezone: function(timezone, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set', {
          config: 'system',
          section: '@system[0]',
          values: { timezone: timezone },
        },
      ],
    };

    return this.request(config);
  },
  resetRunningMode: function(runMode, ip, port, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set', {
          config: 'system',
          section: '@system[0]',
          values: {
            running_mode: runMode,
            ip: ip,
            port: port },
        }
      ]
    };
    return this.request(config);
  },
};

export default rpcAPI;
