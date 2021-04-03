
package com.auth.react;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.browser.customtabs.CustomTabsIntent;
import android.util.Base64;
import android.content.ActivityNotFoundException;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

public class AzureAuthModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private static final int CANCEL_EVENT_DELAY = 100;

    private final ReactApplicationContext reactContext;
    private Callback callback;
    private boolean closeOnLoad;

    public AzureAuthModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "AzureAuth";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
        return constants;
    }

    @ReactMethod
    public void showUrl(String url, boolean closeOnLoad, Callback callback) {
        final Activity activity = getCurrentActivity();

        this.callback = callback;
        this.closeOnLoad = closeOnLoad;

        if (activity != null) {
            try {
                CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
                CustomTabsIntent customTabsIntent = builder.build();
                customTabsIntent.launchUrl(activity, Uri.parse(url));
            } catch (ActivityNotFoundException e) {
                // No chrome installed on device
                startNewBrowserActivity(url);
            }
        } else {
            startNewBrowserActivity(url);
        }
    }

    private void startNewBrowserActivity(String url) {
        final Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setData(Uri.parse(url));
        getReactApplicationContext().startActivity(intent);
    }

    @ReactMethod
    public void oauthParameters(Callback callback) {
        final WritableMap parameters = Arguments.createMap();
        parameters.putString("state", this.generateRandomValue());
        parameters.putString("nonce", this.generateRandomValue());
        parameters.putString("verifier", this.generateRandomValue());
        callback.invoke(parameters);
    }
   
    @ReactMethod
    public void hide() {
        AzureAuthModule.this.callback = null;
    }

    private String getBase64String(byte[] source) {
        return Base64.encodeToString(source, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    String generateRandomValue() {
        SecureRandom sr = new SecureRandom();
        byte[] code = new byte[32];
        sr.nextBytes(code);
        return this.getBase64String(code);
    }

    @Override
    public void onHostResume() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Callback cb = AzureAuthModule.this.callback;
                if (cb != null) {
                    if (AzureAuthModule.this.closeOnLoad) {
                        cb.invoke();
                    } else {
                        final WritableMap error = Arguments.createMap();
                        error.putString("error", "aa.session.user_cancelled");
                        error.putString("error_description", "User cancelled the Auth");
                        cb.invoke(error);
                    }
                    AzureAuthModule.this.callback = null;
                }
            }
        }, CANCEL_EVENT_DELAY);
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }
}
