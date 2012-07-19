package com.easy.mapper;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import org.apache.cordova.*;

public class Emp extends DroidGap{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html",120000);
        super.setIntegerProperty("loadUrlTimeoutValue", 120000);
        
        super.appView.setVerticalScrollBarEnabled(true);
        super.appView.setHorizontalScrollBarEnabled(false);
        // set scrollbar style
        super.appView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

    }
}