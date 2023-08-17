# react-native-azure-auth

[![Maintainers Wanted](https://img.shields.io/badge/maintainers-wanted-red.svg)](https://github.com/pickhardt/maintainers-wanted)
[![CircleCI](https://circleci.com/gh/vmurin/react-native-azure-auth.svg?style=svg)](https://circleci.com/gh/vmurin/react-native-azure-auth)

React Native library implementing Azure AD OAuth2 API

The library uses the latest __V2.0__ version of the [Azure AD endponts](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-compare) and provides token cache functionality.
`react-native-azure-auth` implements authentication flow using `fetch` API and native components.
The OpenID connect and `authorization_code` grant are implemented.

JS Docs can be accesed under <https://vmurin.github.io/react-native-azure-auth/>

## Maintainers/Developers wanted

**ATTENTION!**  react-native-azure-auth project is looking for maintainers and contributors!
For various reasons, I can only keep maintaining this project as far as dependency bumps and publishing.
As for new features and the bug/issue support, these will require other maintainers/contributors.

If that's you - please feel free to ping me and I will add you to contributors of this repo with according rights.

## Installation

Install `react-native-azure-auth` using [npm](https://www.npmjs.com)

```bash
npm install react-native-azure-auth --save
```

Or via [yarn](https://yarnpkg.com/) (recommended)

```bash
yarn add react-native-azure-auth
```

Then you need to link the native modules in `react-native-azure-auth` and used AsyncStorage.
Please check the [link](https://reactnative.dev/docs/linking-libraries-ios).

If you have used library before, it could be needed also to unlink the community version of AsyncStorage too.

**Note:** If you are using [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) please be aware of caution to unlink the libraries in the autolinking docs. Especially if you are encountered the problem like issue [#98](https://github.com/vmurin/react-native-azure-auth/issues/98) 


### App Registration

First, you will need to register your application with Microsoft Azure Portal. This will give you an Application ID for your application, as well as enable it to receive tokens.

1. Sign in to the [Microsoft Azure Portal](https://portal.azure.com).
1. First you need to find the **App Registration Service**. You could just type in the service name in the search bar on the middle top of the window and select it or do like following:
   1. Click on **All services** in the left panel
   2. Then select from the shown in bold categories the **Identity**
   3. Click on the star sign near the _App registration_ service name to add it to favorites
   4. Now you can easily access the service using the left portal panel
1. After selecting _App registration_ service click **New registration**
1. Enter a friendly name for the application
1. Select account type that should be supported by your app. The default choice _"Accounts in any organizational directory and personal Microsoft accounts"_ is the widest one.
1. Now you need to add **Redirect URI**
   1. Select _Public client (mobile & desktop)_ from dropdown
   2. Type in the URI. See the URI format in the section below.
1. Click **Register** to create the app registration record.
1. Find the _Application (client) ID_ value in **Overview** section, copy and save the value in a safe location.
1. You don't need to set _API Permissions_. It is meant for admin consent only.
1. Now select **Authentication** from the left menu
1. Select checkbox **ID tokens** in the _Implicit grant_ section - it is needed for OpenID Connect. The library will still use authorization grant and not imlicit.
1. Click **Save** button above to save changes.

#### Callback URL(s)

Callback URLs are the URIs that Azure AD invokes after the authentication process. Azure routes your application back to this URI and appends additional parameters to it, including a token. Since callback URLs can be manipulated, you will need to add your application's URL to your apps's registered **Redirect-URIs**. This will enable Azure to recognize these URLs as valid. If omitted, authentication will not be successful.

##### iOS - default redirect URI structure

```text
{YOUR_BUNDLE_IDENTIFIER}://{YOUR_BUNDLE_IDENTIFIER}/ios/callback
```

##### Android - default redirect URI structure

```text
{YOUR_APP_PACKAGE_NAME}://{YOUR_APP_PACKAGE_NAME}/android/callback
```

**Note 1:** Make sure to replace {YOUR_BUNDLE_IDENTIFIER} and {YOUR_APP_PACKAGE_NAME} with the actual values for your application.

**Note 2:** Be aware of allowed characters for the scheme part of URI. According to RFC 2396 (Section 3.1):

```text
scheme = alpha *( alpha | digit | "+" | "-" | "." )
```

As you can see, allowed in identifier and package name underscore (`_`) character is NOT allowed in the URI scheme!

##### Custom redirect URI

You are free to use any custom URI taking into account restrictions stated above. Just add `redirectUri:` parameter to the `AzureAuth` initialization call.
See the [docs](https://vmurin.github.io/react-native-azure-auth/AzureAuth.html) and [Usage](#usage) section.

##### Single tenant app registration

To be able to use this app type you should add `tenant` property in the `AzureAuth` init options like this:

```javascript
const azureAuth = new AzureAuth({
    clientId: YOUR_CLIENT_ID,
    tenant: 'XXXXXXXX-YYYY-ZZZZ-AAAA-BBBBBBBBBBBB', // your app tenant ID
  });
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
        android:pathPrefix="/${applicationId}/android/callback"
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
        android:pathPrefix="/android/callback"
        android:host="${applicationId}"
        android:scheme="${applicationId}" />
</intent-filter>
</activity>
```

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

#### iOS config

Inside the `ios` folder find the file `AppDelegate.[swift|m]` add the following to it

```objc
// iOS 9.x or newer
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

If you're targeting iOS 8.x or older, you can use the following code instead:

```objc
// iOS 8.x or older
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

> The value `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)` is the default for apps created with React Native CLI, you may have a different value.
>
> It is advisable to replace it with your own meaningfull ID in reverse DNS format. e.g. _com.my-domain.native-app_

and then register a URL type entry using the value of `CFBundleIdentifier` as the value of `CFBundleURLSchemes`

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>None</string>
        <key>CFBundleURLName</key>
        <string>AzureAuth</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.my-domain.native-app</string>
        </array>
    </dict>
</array>
```

>**Attention:** The `<string>` value for `CFBundleURLSchemes` key MUST be the literal value of the Bundle Identifier with NO $-variables. In the example above the string `com.my-domain.native-app` represents _your_ Bundle Identifier.

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

### Usage example

You can consult a tiny sample project [react-native-azure-auth-sample](https://github.com/vmurin/react-native-azure-auth-sample) for usage example

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please take a little time and use search functionality of the issue tracker before posting a new issue, you can find some usefull infos in already closed issues. Please also do not report security vulnerabilities on the public GitHub issue tracker.

## Author

[Vlad Murin](https://github.com/vmurin)

## Credits

This project was originally inspired by [https://github.com/auth0/react-native-auth0](https://github.com/auth0/react-native-auth0)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
