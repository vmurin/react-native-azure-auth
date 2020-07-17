interface AuthOptions {
  clientId: string;
  persistentCache: boolean;
  redirectUri: string;
}

interface AzureAuthOptions {
  /** @param {String} clientId your AzureAuth client identifier */
  clientId: string;
  /** @param {boolean} [persistentCache] should store token cache between the app starts; defaults to true */
  persistentCache?: string;
  /** @param {String} [authorityUrl] optional Azure authority if you want to replace default v2 endpoint (`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/`) */
  authorityUrl?: string;
  /** @param {String} [tenant] uses given tenant in the default authority URL; default is `common` */
  tenant?: string;
  /** @param {String} [redirectUri] - uses given redirect URI instead of default one:
   *
   *  iOS: {YOUR_BUNDLE_IDENTIFIER}://${YOUR_BUNDLE_IDENTIFIER}/ios/callback
   *
   *  Android: {YOUR_APP_PACKAGE_NAME}://{YOUR_APP_PACKAGE_NAME}/android/callback
   */
  redirectUri?: string;
}

interface ClientOptions {
  token?: string;
  authorityUrl?: string;
  baseUrl?: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  refreshToken: string;
  idToken: string;
}

interface ClientResponse {
	status:string,
	ok: boolean,
  headers: Headers,
  blob?: Blob,
  json?: object,
  text?: string
}
/**
 * Helper to perform HTTP requests
 * Blob (binary) content types are not supported
 *
 * Class variables:
 * - baseUrl | authorityUrl: base URL the request path is added to
 * - token: Auth token if the request needs authorization
 *
 * One of Url options must be provided
 *
 * @param options
 * @param options.authorityUrl
 * @param options.baseUrl
 * @param options.token
 */
declare class Client {
  constructor(options?: ClientOptions);
  baseUrl: string;
  bearer: string;
  get(path: string, query: string): Promise<void>;
  patch(path: string, body: any): Promise<void>;
  post(path: string, body: any): Promise<void>;
  /**
   * Helper function to send HTTP requests
   *
   * @param {String} method
   * @param {String} url
   * @param {Object} [body] - request body
   */
  request(method: string, url: string, body?: any): Promise<ClientResponse>;
  url(path: string, query?: string): string;
}

/**
 * Class represent basic token cache item
 *
 * Note: userId is handled in case insencitive way for token cache keys
 *
 * @param {Object} tokenResponse
 * @param {String} clientId
 */
declare class BaseTokenItem {
  constructor(tokenResponse: TokenResponse, clientId: string);
  clientId: string;
  rawIdToken: string;
  userId: string;
  userName: string;
  tenantId: string;
  idTokenExpireOn: number;
  toString(): string;
  static createAccessTokenKey(
    clientId: string,
    userId: string,
    scope: Scope
  ): string;
  static createRefreshTokenKey(clientId: string, userId: string): string;
  static createTokenKeyPrefix(clientId: string, userId: string): string;
  static rawObjectFromJson(objStr: string): any;
  static scopeFromKey(key: string): Scope | null;
}

/**
 * Class represent access token cache item
 *
 * @namespace TokenCache.AccessTokenItem
 *
 * @param {Object} tokenResponse
 * @param {String} clientId
 */
declare class AccessTokenItem extends BaseTokenItem {
  constructor(tokenResponse: TokenResponse, clientId: string);
  accessToken: string;
  scope: Scope;
  expireOn: number;
  isExpired(): boolean;
  tokenKey(): string;
  static fromJson(objStr: string): AccessTokenItem | null;
}

/**
 * Class represent refresh token cache item
 *
 * @param {Object} tokenResponse
 * @param {String} clientId
 *
 */
declare class RefreshTokenItem extends BaseTokenItem {
  constructor(tokenResponse: TokenResponse, clientId: string);
  refreshToken: string;
  tokenKey(): string;
  static fromJson(objStr: string): RefreshTokenItem | null;
}

/**
 * Azure AD Auth scope representation class
 *
 * 1. Remove MS Graph URLs from scope, as it is default for any scope
 * 2. Remove eventual commas and double spaces
 * 3. Sort
 * 4. BASIC SCOPE is always a part of auth requests
 *
 * @param {string | Array<String> | ''} scope - without parameters represents
 *
 * BASIC_SCOPE = 'offline_access openid profile'
 *
 */
declare class Scope {
  constructor(scope?: string | string[]);
  basicScope: boolean;
  scope: string[];
  scopeStr: string;
  equals(other: Scope): boolean;
  /**
   * Compare if the current instance scope intersects with one from parameter
   * Only NON basic scopes are compared
   *
   * @param {Scope} otherScope
   */
  isIntersects(otherScope: Scope): boolean;
  /**
   * Check if otherScope is a subset of baseScope
   *
   * @param {Array} otherScope
   */
  isSubsetOf(otherScope: Scope): boolean;
  toString(): string;
  static basicScope(): Scope;
}

/**
 * Token persistent cache
 *
 * @param input - init parameters
 * @param {String} input.clientId
 * @param {Boolean} input.persistent - if true - the RN `AsyncStorage` is used for persistent caching, otherwise only the class instance. (default: true)
 */
declare class TokenCache {
  constructor(input: { clientId: string; persistent: boolean });
  cache: Record<string, string>;
  clientId: string;
  persistent: boolean;
  getAccessToken(userId: string, scope: Scope): Promise<AccessTokenItem | null>;
  getRefreshToken(userId: string): Promise<RefreshTokenItem | null>;
  saveAccessToken(tokenResponse: TokenResponse): Promise<AccessTokenItem>;
  saveRefreshToken(tokenResponse: TokenResponse): Promise<RefreshTokenItem>;
}

declare class Auth {
  constructor(options: AuthOptions);
  authorityUrl: string;
  cache: TokenCache;
  client: Client;
  clientId: string;
  redirectUri: string;
  /**
   * Try to obtain token silently without user interaction
   *
   * @param {String} parameters.userId user login name (e.g. from Id token)
   * @param {String} parameters.scope scopes requested for the issued tokens.
   *
   */
  acquireTokenSilent: (parameters: {
    userId: string;
    scope: string;
  }) => Promise<AccessTokenItem | null>;
  /**
   * Clear persystent cache - AsyncStorage - for given client ID and user ID or ALL users
   *
   * @param {String} [userId] ID of user whose tokens will be cleared/deleted
   *      if ommited - tokens for ALL users and current client will be cleared
   */
  clearPersistenCache: (userId?: string) => Promise<void>;
  /**
   * Exchanges a code obtained via `/authorize` for the access tokens
   *
   * @param input input used to obtain tokens from a code
   * @param {String} input.code code returned by `/authorize`.
   * @param {String} input.redirectUri original redirectUri used when calling `/authorize`.
   * @param {String} input.scope A space-separated list of scopes.
   *    The scopes requested in this leg must be equivalent to or a subset of the scopes requested in the first leg
   *
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code#request-an-access-token
   */
  exchange(input: {
    code: string;
    redirectUri: string;
    scope: string;
  }): Promise<void>;
  /**
   * Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param parameters parameters to send to `/authorize`
   * @param {String} parameters.responseType type of the response to get from `/authorize`.
   * @param {String} parameters.redirectUri where the AS will redirect back after success or failure.
   * @param {String} parameters.state random string to prevent CSRF attacks.
   * @param {String} parameters.scope a space-separated list of scopes that you want the user to consent to.
   * @param {String} parameters.prompt (optional) indicates the type of user interaction that is required.
   *    The only valid values at this time are 'login', 'none', and 'consent'.
   * @returns {String} authorize url with specified parameters to redirect to for AuthZ/AuthN.
   *
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code
   */
  loginUrl(parameters?: {
    responseType: string;
    redirectUri: string;
    state: string;
    scope: string;
    prompt?: string;
  }): string;
  /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   *
   * `https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=[URI]&redirect_uri=[URI]`
   *
   * @returns {String} logout url with default parameter
   */
  logoutUrl(): string;
  /**
   * Return user information using an access token
   *
   * @param parameters user info parameters
   * @param {String} parameters.token user's access token
   * @param {String} parameters.path - MS Graph API Path
   *
   * @see https://developer.microsoft.com/en-us/graph/docs/concepts/overview
   * @see https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/user_get
   */
  msGraphRequest(parameters: { token: string; path: string }): Promise<any>;
  /**
   * Obtain new tokens (access and id) using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} parameters.scope scopes requested for the issued tokens.
   * @param {String} [parameters.redirectUri] the same redirect_uri value that was used to acquire the authorization_code.
   * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols-oauth-code#refresh-the-access-token
   *
   */
  refreshTokens: (parameters: {
    refreshToken: string;
    scope: string;
    redirectUri?: string;
  }) => Promise<TokenResponse>;
}

declare class WebAuth {
  constructor(auth: Client);
  /**
   * Starts the AuthN/AuthZ transaction against the AS in the in-app browser.
   *
   * In iOS it will use `SFSafariViewController` and in Android `Chrome Custom Tabs`.
   *
   * @param {Object} options parameters to send
   * @param {String} [options.scope] scopes requested for the issued tokens.
   *    OpenID Connect scopes are always added to every request. `openid profile offline_access`
   *    @see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-scopes
   * @param {String} [options.prompt] (optional) indicates the type of user interaction that is required.
   *    The only valid values at this time are 'login', 'none', and 'consent'.
   */
  authorize(options: {
    prompt?: string;
    scope?: string;
  }): Promise<BaseTokenItem & Partial<AccessTokenItem>>;
  /**
   *  Removes Azure session
   *
   * @param {Object} options parameters to send
   * @param {Boolean} [options.closeOnLoad] close browser window on 'Loaded' event (works only on iOS)
   */
  clearSession(options?: { closeOnLoad: boolean }): Promise<void>;
}

declare class AzureAuth {
  constructor(options: AzureAuthOptions);
  auth: Auth;
  webAuth: WebAuth;
}

export default AzureAuth;
