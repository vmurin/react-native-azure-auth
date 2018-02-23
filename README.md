# react-native-azure-auth

This project was originally forked from [https://github.com/wkh237/react-native-azure-ad](https://github.com/wkh237/react-native-azure-ad) and adapted to use the V2.0 version of the [Azure AD endponts](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-compare).

*************************************

An React Native module implements Azure AD V2.0 authentication flow using pure React Native API. You can use both web application flow and mobile application client_id with this module.

* [Installation](#user-content-installation)
* [Usage](#user-content-usage-example)
 * [Login](#user-content-login)
 * [Logout](#user-content-logout)
 * [RefreshToken](#user-content-refresh-token)
* [ADLoginView](#user-content-adloginviewwebview)
* [Class ReactNativeAD](#user-content-class-reactnativead)
  * [Constructor](#user-content-constructor)
  * [Properties](#user-content-properties)
     * [config](#user-content-config-ADConfig)
     * [credentials](#user-content-credentials-ADCredentials)
  * [Frequently used methods](#user-content-frequently-used-methods)
     * [getConfig ():ADConfig](#user-content-getconfig-adconfig)
     * [getCredentials ():ADCredentials](#user-content-getcredentials-adcredentials)
     * [assureToken (resource:string):Promise<?string>]()
  * [Methods for internal mechanism](#user-content-methods-for-internal-mechanism)
     * [getAccessToken (resource:string):string | null]()
     * [saveCredentials (data:ADCredentials):Promise]()
     * [refreshToken (resourceId:string):Promise<string>]()
     * [checkCredential (resourceId:string):Promise<ReactNativeADCredential | null>]()
     * [grantAccessToken (grantType:string, params:any):Promise<GrantTokenResp>]()
* [Flow Types](#user-content-flow-types)

## Installation

Install package from `npm`

```bash
npm install vmurin/react-native-azure-auth
```

react-native-azure-auth implements authentication flow using `fetch` API and `Webview` component in  React Native, therefore there's no need to install Android and iOS native ADAL.

## Usage Example

### Login

The following example will show an Azure authorize page in your app, when user successfully logged in, it triggers `onSuccess` method.

```js

import {ReactNativeAD, ADLoginView} from 'react-native-azure-auth'

const CLIENT_ID = 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

class LandingView extends React.Component {

  constructor(props) {
    super(props)
    this.AzureADContext = {
      client_id : CLIENT_ID,
      // Optional
      redirectUrl : 'http://localhost:8080',  
      // Optional
      authority_host : 'https://login.microsoftonline.com/common/oauth2/authorize',
      // Optional
      tenant  : 'common',  
      // Optional
      prompt : 'none',
      // This is required if client_id is a web application id
      // but not recommended doing this way.
      client_secret : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      resources : [
        'https://graph.microsoft.com',
        'https://outlook.office365.com',
        // ... more resources
      ]
    }
  }

  render() {

  new ReactNativeAD({
    client_id: CLIENT_ID,
    resources: [
      'https://outlook.office365.com'
    ]})
  
    return <ADLoginView
              context={ReactNativeAD.getContext(CLIENT_ID)}
              onSuccess={this.onLoginSuccess.bind(this)}/>
  }

  onLoginSuccess(credentials) {
    console.log(credentials[https://outlook.office365.com].access_token)
    // use the access token ..
  }

}

```

### Logout

When a ADLoginView has prop `needLogout` set to `true` it redirect user to AD logout page for logout.

```
<ADLoginView
              context={ReactNativeAD.getContext(CLIENT_ID)}
              needLogout={true}/>
```

### Refresh Token

Use `assureToken` method to assure `access_token` of specific resource is valid, when access token is expired, this method will attempt to refresh access token automatically and resolve renewed access token in promise. If it failed to renew the token, the access token in promise will be `undefined`, it means user may have to login again, so you might have to redirect user to ADLoginView for new authorization.


```
ReactNativeAD.getContext(CLIENT_ID).assureToken(RESOURCE_ID).then((token) => {

 // use token ..

})

```

### ADLoginView:Webview

`ADLoginView` is it's a wrapped [Webview](https://facebook.github.io/react-native/docs/webview.html#content) component, it will display the login page by given prop `context`, when user is authorized, it execute the function in prop `onSuccess`.

#### props


`style:object` **(opational)**

Additional styles of the webview component.

`context:ReactNativeAD` **Required**

Azure AD context instance that apply to this ADLoginView, it should be a `ReactNativeAD` instance, usually you will have one or more ReactNativeAD instances in your app, once you `new` a ReactNativeAD with a client_id in config, you can access the context globally in your this way

```js
let ctx = ReactNativeAD.getContext('client-id-of-the-instance')
```

`onSuccess:function` **(optional)**

A function to execute when `ADLoginView` completes authorization flow.

`needLogout:bool` **(optional)**

When it set to `true`, ADLoginView will logout user and redirect user to AD login page.

`hideAfterLogin` **(optional)**

When this property set to `true`, ADLoginView will be hidden after logged in, in prevention of displaying an empty/error web page.

`onURLChange` **(optional)**

A event listener which triggers when ADLoginView's URL change.

### Class ReactNativeAD

You will need to create at least one `ReactNativeAD` object in your application, the ReactNativeAD object stores, and update authentication information in [AsyncStorage](http://facebook.github.io/react-native/releases/0.25/docs/asyncstorage.html#asyncstorage) automatically, it also provides several API for access theses informations.

#### Constructor

To create a ReactNativeAD instance you have to give a configuration object as the first argument of constructor. Once the ReactNativeAD object created, you can access it globally in your application like this :

```js

new ReactNativeAD({
  client_id: 'client-id-#1',
  resources: [
    'https://outlook.office365.com'
  ]})

// this will return the object we created above  
let ctx = ReactNativeAD.getContext('client-id-#1')
// use the stored context
ctx.assureToken('https://outlook.office365.com').then((token) => {
  ...
})


```

The configuration object contains the following properties :

`client_id:string` **Required**

The application `client_id`, this property is required, it's also the identifier of each ReactNativeAD context.

`redirect_uri:string` **Optional**

An url that ADLoginView will be redirect when login success, this property is optional.

`authority_host:string` **Optional**

The url of authorization page, if not specified, it will use `https://login.microsoftonline.com/<tenant id>/oauth2/authorize` by default, where `<tenant id>` will be replaced with property `tenant`, if the default tenant is `common`.

`tenant:string` **Optional**

The tenant id of application.

`prompt:string` **Optional**

Indicates the type of user interaction that is required. The only valid values are 'login', 'none' and 'consent'. For details, please refer to [this](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-protocols-openid-connect-code) documentation.

`client_secret:string` **Required if use web application client_id**

This property is only required when your application uses a web application client_id, **but it is not recommended to do this way, because store client_secret in application could be dangerous**.

`resouces:Array<string>` **Required**

A list of Azure AD resource endpoints, once user has authorized ADLoginView will try to acquire access token and related information of each resource endpoint you specified in this property.


#### Properties

[`config:[ADConfig]`](#user-content-adconfig)

This property stores configurations (such as client_id, resources ..) of a ReactNativeAD instance.

[`credentials:[ADCredentials]`](#user-content-adcredentials)

This property stores acquired credential informatio for each resource endpoint. It a hash map structured data, with resource id as key, and a [ReactNativeADCredential](#user-content-ReactNativeADCredential) object as value.

### Frequently used methods

#### getConfig ():[ADConfig](#user-content-adconfig)

This method returns the ReactNativeAD instance's `config` property.

#### getCredentials ()`:[ADCredentials](#user-content-adcredentials)

This method returns the ReactNativeAD instance's `credentials` property.

#### getAccessToken(resouceId:string):string | null

Get access token by given resource id, if no corresponding token exists returns null.

#### assureToken(resource:string):Promise<?string>

Assure that access_token of a resource is valid, when access token is expired, this method will attempt to refresh access token automatically and resolve renewed access token in promise. If it failed to renew the token, the access token in promise will be `undefined`, it means user may have to login again, so you might have to redirect user to ADLoginView for new authorization.

### Methods for internal mechanism

#### saveCredentials(data:ADCredentials):Promise

This method replace the ReactNativeAD instance's `credentials` property with the object in `data` argument. It will also save the each entry in `data` into AsyncStorage, with key = <client id>.<resource id>. For example, if client_id of this ReactNativeAD instance is `eabc-123` and one of the entry's key is `http://graph.microsoft.com`(aka. resource id), then the data in this entry will be stored in AsyncStorage with key `eabc-123.http://graph.microsoft.com`.

#### refreshToken(resourceId:string):Promise<?string>

Refresh token of the resource, when credentials is empty, it will try to update access token for resource. The access token in promise is possible to be `undefined`, it means user may have to login again, so you might have to redirect user to ADLoginView for new authorization.

#### checkCredential(resourceId:string):Promise<ReactNativeADCredential | null>

Check credentials of the resource exist or not.

#### grantAccessToken(grantType:string, params:any):Promise<GrantTokenResp>

Get access_token by given `grant_type` and params, when this process success, it stores credentials in format of `ReactNativeADCredentials`, in both ReactNativeAD.credentials and AsyncStorage.

### Flow Types

#### ADConfig  

```
{
  client_secret : string | null,
  client_id : string | null,
  redirect_uri : string | null,
  tenant : string | null,
  prompt : string | null,
  resources : Array<string> | null,
}
```

#### ADCredentials  

```
{
  [key:string] : ReactNativeADCredential | null
}
```

#### GrantTokenResp

```
{
  resource : string,
  response : Object
}
```

#### ReactNativeADConfig

```
{
  client_id : string,
  redirect_uri? : string,
  authority_host : string,
  tenant : string,
  client_secret : string,
  resources : any,
  onSuccess : Function,
}
```

#### ReactNativeADCredential  
```
{
  access_token : string,
  expires_in : number,
  expires_on : number,
  id_token : string,
  not_before : number,
  pwd_exp : string,
  pwd_url : string,
  refresh_token : string,
  resource : string,
  scope : string,
  token_type : 'Bearer'
}
```
