package com.crossbordercart.app;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.google.android.material.bottomnavigation.BottomNavigationView;

/**
 * Adds a native bottom tab bar around the remote-URL WebView (see
 * capacitor.config.ts — server.url points at the live site, so this app has
 * no local web assets to route between; each tab just navigates the same
 * WebView to a different page on crossbordercart.com).
 *
 * This is part of Apple Guideline 4.2 compliance (real native chrome, not
 * just a bare webview) and matches the 5-tab structure in the app plan:
 * Home | Packages | Shipments | Track | Account.
 */
public class MainActivity extends BridgeActivity {

    // Must match capacitor.config.ts's server.url (no trailing slash).
    private static final String BASE_URL = "https://www.crossbordercart.com";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav);
        if (bottomNav == null) {
            // Layout didn't inflate the way we expect — fail safe rather
            // than crash; the app still works as a plain webview.
            return;
        }

        bottomNav.setOnItemSelectedListener(item -> {
            WebView webView = (getBridge() != null) ? getBridge().getWebView() : null;
            if (webView == null) {
                return true;
            }

            int id = item.getItemId();
            if (id == R.id.nav_home) {
                webView.loadUrl(BASE_URL + "/dashboard");
            } else if (id == R.id.nav_packages) {
                webView.loadUrl(BASE_URL + "/mypackages");
            } else if (id == R.id.nav_shipments) {
                webView.loadUrl(BASE_URL + "/dashboard/my-shipments");
            } else if (id == R.id.nav_track) {
                webView.loadUrl(BASE_URL + "/track");
            } else if (id == R.id.nav_account) {
                webView.loadUrl(BASE_URL + "/profile");
            }
            return true;
        });
    }
}
