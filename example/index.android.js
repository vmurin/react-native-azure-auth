/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {ReactNativeAD, ADLoginView, Logger} from 'react-native-azure-ad'

Logger.setLevel('TRACE')

const config = {
  client_id : 'client-id-of-your-app',
  // redirectUrl : 'http://localhost:8080(optional)',
  // authorityHost : 'https://login.microsoftonline.com/<tenant id>/oauth2/authorize(optional)',
  // tenant  : 'common(optional)',
  // client_secret : 'client-secret-of-your-app(optional)',
  resources : [
    'https://graph.microsoft.com',
    'https://outlook.office.com',
    'https://outlook.office365.com',
    'https://wiadvancetechnology.sharepoint.com',
    'https://graph.windows.net',
  ]
}

class RNAzureAD extends Component {


  constructor(props) {
    super(props)
    new ReactNativeAD(config)
  }

  render() {
    return (
      <View style={styles.container}>
        <ADLoginView context={ReactNativeAD.getContext(config.client_id)}
          needLogout={this.state.logout}
          hideAfterLogin={true}
          onSuccess={this.onLoginSuccess.bind(this)}
        />
        <Button onPress={(e) => this.logout()} title="logout"/>
      </View>
    )
  }

  logout(e){
    this.setState({
      logout:true
    })
  }
  
  onLoginSuccess(cred) {
    console.log(cred)
  }

  apiCall() {

    ReactNativeAD.getContext(config.client_id).then((token) => {
      fetch({
        method : 'GET',
        url : 'some-api-url',
        headers : {
          Authorization : `Bearer ${token}`
        }
      })
      .then((resp) => {
        return resp.text()
      })
      .catch((err) => {
        console.log(err.stack)
      })
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('RNAzureAD', () => RNAzureAD);
