import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import Dropzone from 'react-dropzone';
import mui from 'material-ui';
import icon7688 from '../../img/7688.png';
import icon7688Duo from '../../img/7688_duo.png';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';

const {
  TextField,
  Card,
  FlatButton,
  RaisedButton,
  Dialog,
} = mui;
const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;
const styles = {
  h3: {
    marginBottom: '0px',
    marginTop: '0px',
  },

  panelTitle: {
    tapHighlightColor: 'rgba(0,0,0,0)',
    color: 'rgba(0, 0, 0, 0.498039)',
    fontSize: '16px',
    transform: 'perspective(1px) scale(0.75) translate3d(0px, -28px, 0)',
    transformOrigin: 'left top',
    marginBottom: '0px',
    marginTop: '40px',
  },

  panelContent: {
    borderBottom: '2px dotted #D1D2D3',
    fontSize: '16px',
    marginTop: '-15px',
    paddingBottom: '5px',
    marginBottom: '48px',
  },

  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    paddingTop: '20px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },

  editTextField: {
    pointerEvent: 'none',
    width: '100%',
    color: '#353630',
    cursor: 'auto',
    ':hover': {
      cursor: 'auto',
    },
    ':active': {
      cursor: 'auto',
    },
    ':focus': {
      cursor: 'auto',
    },
  },

  h3Top: {
    marginTop: '20px',
    marginBottom: '0px',
  },

  exampleImageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: '0',
    bottom: '0',
    right: '0',
    left: '0',
    width: '100%',
    opacity: '0',
  },

};

@Radium
export default class sysinfoComponent extends React.Component {
  static propTypes = {
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }
  constructor(props) {
    super(props);
    this.state = {
      errorMsgTitle: null,
      errorMsg: null,
    };
    this.state.files = [{ name: '' }];
    this.state.modal = true;

    const info = JSON.parse(localStorage.getItem('info'));

    if (this.props.boardInfo) {
      this.state.deviceName = this.props.boardInfo.system[Object.keys(this.props.boardInfo.system)[0]].hostname;
      this.state.user = info.user;
      this.state.bootLoaderVersion = this.props.boardInfo.system[Object.keys(this.props.boardInfo.system)[0]].loader_version;
      this.state.firmwareVersion = this.props.boardInfo.system[Object.keys(this.props.boardInfo.system)[0]].firmware_version;
      this.state.macaddr = this.props.boardInfo.network.lan.macaddr.toUpperCase();;
      this.state.wifiMACName = this.props.boardInfo.network.lan.macaddr.split(':')[3] + this.props.boardInfo.network.lan.macaddr.split(':')[4] + this.props.boardInfo.network.lan.macaddr.split(':')[5];
      this.state.mode = this.props.boardInfo.wifi.radio0.linkit_mode;

      switch(this.props.boardInfo.network.lan.proto) {
      case 'dhcp':
      	break;

      case 'static':
      	break;

      case 'ap':
      	break;
      }

      switch (this.state.mode) {
      case 'ap':
      	this.state.stringMode = 'ap';
        if (this.props.boardInfo.lan['ipv4-address'])
          this.state.currentIp = this.props.boardInfo.lan['ipv4-address'][0].address;
        else
          this.state.currentIp = 'cannot read ip address in ap mode';
        break;
      case 'sta':
      	this.state.stringMode = 'station';
        if (this.props.boardInfo.wan['ipv4-address'])
          this.state.currentIp = this.props.boardInfo.wan['ipv4-address'][0].address;
        else
          this.state.currentIp = 'cannot read ip address in station mode';
        break;
      case 'apsta':
      	this.state.stringMode = 'Repeater';
        if (this.props.boardInfo.lan['ipv4-address'][0])
          this.state.currentIp = this.props.boardInfo.lan['ipv4-address'][0].address;
        else
          this.state.currentIp = 'cannot read ip address in apsta mode';
        break;
      default:
      	this.state.stringMode = 'Unidentified';
        break;
      }
    }

    if (this.props.boardInfo.wan['ipv4-address']) {
        var netmask = this.props.boardInfo.wan['ipv4-address'][0].mask;
        switch (netmask) {
          case 30: var Netmask='255.255.255.252'; break;
          case 29: var Netmask='255.255.255.248'; break;
          case 28: var Netmask='255.255.255.240'; break;
          case 27: var Netmask='255.255.255.224'; break;
          case 26: var Netmask='255.255.255.192'; break;
          case 25: var Netmask='255.255.255.128'; break;
          case 24: var Netmask='255.255.255.0'; break;
          case 23: var Netmask='255.255.254.0'; break;
          case 22: var Netmask='255.255.252.0'; break;
          case 21: var Netmask='255.255.248.0'; break;
          case 20: var Netmask='255.255.240.0'; break;
          case 19: var Netmask='255.255.224.0'; break;
          case 18: var Netmask='255.255.192.0'; break;
          case 17: var Netmask='255.255.128.0'; break;
          case 16: var Netmask='255.255.0.0'; break;
        }
        this.Netmask = Netmask;
        this.address=this.props.boardInfo.wan['ipv4-address'][0].address;
        {/*this.gateway=this.props.boardInfo.network.wan.gateway;*/}
        this.gateway=this.address.substring(0, this.address.lastIndexOf('.') + 1) + '1';
        if (this.gateway=='undefined') this.gateway='--';
    } else {
        this.address='--';
        this.Netmask='--';
        this.gateway='--';
    }
  }

  componentWillMount() {
    const this$ = this;
    AppActions.loadModel(window.session)
    .then((data) => {
      return this$.setState({ boardModel: data.body.result[1].model });
    });
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }

  render() {
  	let elem;
    let PlatformBlock = (
      <div style={ styles.content } key="PlatformBlock">
        <h3 style={ styles.h3 }>{ __('Platform information') }</h3>
        <h3 style={ styles.panelTitle }>{ __('Device name') }</h3>
        <p style={ styles.panelContent }>{ this.state.deviceName }</p>
        <h3 style={ styles.panelTitle }>{ __('MAC address') }</h3>
        <p style={ styles.panelContent }>{ this.state.macaddr }</p>
        <h3 style={ styles.panelTitle }>{ __('Current IP address') }</h3>
        <p style={ styles.panelContent }>{ this.state.currentIp }</p>
      </div>
    );
    let netBlock;
    if(this.state.mode === 'ap') {
        netBlock = (
        <div style={ styles.content } key="netBlock">
          <h3 style={styles.h3}>{ __('Network information') }</h3>
          <h3 style={ styles.panelTitle }>{ __('Mode') }</h3>
          <p style={ styles.panelContent }>{ this.state.stringMode }</p>
          <h3 style={ styles.panelTitle }>{ __('WAN') }</h3>
          <p style={ styles.panelContent }>{ 'mode: ' + this.props.boardInfo.network.wan.proto }</p>
          <p style={ styles.panelContent }>{ 'ip: ' + this.address }</p>
          <p style={ styles.panelContent }>{ 'netmask: ' + this.Netmask }</p>
          <p style={ styles.panelContent }>{ 'gateway: ' + this.gateway}</p>
        </div>
      );
    } else if(this.state.mode === 'sta') {
        netBlock = (
        <div style={ styles.content } key="netBlock">
          <h3 style={styles.h3}>{ __('Network information') }</h3>
          <h3 style={ styles.panelTitle }>{ __('Mode') }</h3>
          <p style={ styles.panelContent }>{ this.state.stringMode }</p>
          <h3 style={ styles.panelTitle }>{ __('WAN') }</h3>
          <p style={ styles.panelContent }>{ 'mode: ' + this.props.boardInfo.network.wan.proto }</p>
          <p style={ styles.panelContent }>{ 'ip: ' + this.address }</p>
          <p style={ styles.panelContent }>{ 'netmask: ' + this.Netmask }</p>
          <p style={ styles.panelContent }>{ 'gateway: ' + this.gateway }</p>
        </div>
      );
    }

    if (this.props.boardInfo.network.lan.proto === 'static') {
    	elem = (
    		<div>
    		<h3 style={ styles.panelTitle }>{ __('IP') }</h3>
	        <p style={ styles.panelContent }>{ this.props.boardInfo.network.lan.ipaddr }</p>
	        </div>
      	);
    }

    let softwareBlock = (
      <div style={ styles.content } key="softwareBlock">
        <h3 style={styles.h3}>{ __('Software information') }</h3>
        <h3 style={ styles.panelTitle }>{ __('Firmware version') }</h3>
        <p style={ styles.panelContent }>{ this.state.firmwareVersion }</p>
      </div>
    );

    return (
      <div>
        <Card>
          { PlatformBlock }
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', marginTop: '10px', marginBottom: '0px' }}></div>
          { netBlock }
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', marginTop: '10px', marginBottom: '0px' }}></div>
          { softwareBlock }
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', marginTop: '10px', marginBottom: '0px' }}></div>
        </Card>
      </div>
    );
  }
}

sysinfoComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
