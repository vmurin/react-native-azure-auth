# react-native-azure-auth

[![CircleCI](https://circleci.com/gh/vmurin/react-native-azure-auth.svg?style=svg)](https://circleci.com/gh/vmurin/react-native-azure-auth)

React Native library implementing Azure AD OAuth2 API

The library uses the latest __V2.0__ version of the [Azure AD endponts](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-compare) and provides token cache functionality.
`react-native-azure-auth` implements authentication flow using `fetch` API and native components.
The OpenID connect and `autorization_code` grant are implemented.

## Installation

Install `react-native-azure-auth` using [npm](https://www.npmjs.com)

```bash
npm install react-native-azure-auth --save
```

Or via [yarn](https://yarnpkg.com/) (recommended)

```bash
yarn add react-native-azure-auth
```

then you need to link the native module in `react-native-azure-auth`

```bash
react-native link react-native-azure-auth
```

### App Registration

First, you will need to register your application with Microsoft Application Registration Portal. This will give you an Application ID for your application, as well as enable it to receive tokens.

1. Sign in to the [Microsoft Application Registration Portal](https://apps.dev.microsoft.com/).
1. Click **Add an App** in _Converged Application_ group. (You will also have the group _Azure AD only applications_ if you are logged in with a work or school account)
1. Enter a friendly name for the application, leave the checkbox "Let us help you get st arted" NOT selected and click on **"Create"** below to create the app.
1. Find the _Application ID_ value in **Properties** section, copy and save the value in a safe location.
1. In -Platforms- section click **Add Platform**
1. Choose _"Native Application"_
1. Now add to **Userdefined Callback-URLs** the URL for needed platforms. See the URL format in section below.
1. The section Microsoft Graph Permissions is meant for admin consent only. You don't need to fill it out by app re gistration.
1. Click Save button below to complete the app registration.

#### Callback URL(s)

Callback URLs are the URLs that Azure AD invokes after the authentication process. Azure routes your application back to this URL and appends additional parameters to it, including a token. Since callback URLs can be manipulated, you will need to add your application's URL to your apps's **Userdefined Callback-URLs**. This will enable Azure to recognize these URLs as valid. If omitted, authentication will not be successful.

##### iOS

```text
{YOUR_BUNDLE_IDENTIFIER}://${YOUR_BUNDLE_IDENTIFIER}/ios/callback
```

##### Android

```text
{YOUR_APP_PACKAGE_NAME}://{YOUR_APP_PACKAGE_NAME}/android/callback
```

### App Configuration

#### Android config

In the file `android/app/src/main/AndroidManifest.xml` you must make sure the **MainActivity** of the app has a **launchMode** value of `singleTask` and that it has the following intent filter:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:pathPrefix="/android/${applicationId}/callback"
        android:scheme="${applicationId}" />
</intent-filter>
```

The `applicationId` here should be the same as your app package name, and not the ID from MS App Portal.

You would have the following **MainActivity**  configuration:

```xml
<activity
android:name=".MainActivity"
android:label="@string/app_name"
android:launchMode="singleTask"
android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
android:windowSoftInputMode="adjustResize">
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:pathPrefix="/android/${applicationId}/callback"
        android:scheme="${applicationId}" />
</intent-filter>
</activity>
```

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

#### iOS config

Inside the `ios` folder find the file `AppDelegate.[swift|m]` add the following to it

```objc
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}
```

Inside the `ios` folder open the `Info.plist` and locate the value for `CFBundleIdentifier`, e.g.

```xml
<key>CFBundleIdentifier</key>
<string>org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)</string>
```

and then register a URL type entry using the value of `CFBundleIdentifier` as the value of `CFBundleURLSchemes`

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>None</string>
        <key>CFBundleURLName</key>
        <string>auth0</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)</string>
        </array>
    </dict>
</array>
```

> The value `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)` is the default for apps created with React Native CLI, you may have a different value.

For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

## Usage

```js
import AzureAuth from 'react-native-azure-auth';

const azureAuth = new AzureAuth({
    clientId: 'YOUR_CLIENT_ID'
});
```

### Authorization with user interaction

```js
    try {
      let tokens = await azureAuth.webAuth.authorize({scope: 'openid profile User.Read Mail.Read' })
      this.setState({ accessToken: tokens.accessToken });
      let info = await azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: '/me'})
      this.setState({ user: info.displayName, userId: tokens.userId })
    } catch (error) {
      console.log(error)
    }
```

### Silent authorization

```js
    try {
        // Try to get cached token or refresh an expired ones
        let tokens = await azureAuth.auth.acquireTokenSilent({scope: 'Mail.Read', userId: this.state.userId})
        if (!tokens) {
            // No cached tokens or the requested scope defines new not yet consented permissions
            // Open a window for user interaction
            tokens = await azureAuth.webAuth.authorize({scope: 'Mail.Read'})
        }
        let mails = await azureAuth.auth.msGraphRequest({token: tokens.accessToken, path: '/me/mailFolders/Inbox/messages'})
    } catch (error) {
      console.log(error)
    }
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker.

## Author

[Vladimir Murin](https://github.com/vmurin)

## Credits

This project was originally inspired by [https://github.com/auth0/react-native-auth0](https://github.com/auth0/react-native-auth0)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
