# Publishing to Production with Expo Monetization

You're now ready to publish your Price Scanner app with built-in ad monetization!

## Quick Summary

✅ **Removed:** react-native-google-mobile-ads (problematic package)
✅ **Updated:** AdBanner component to use Expo's monetization system
✅ **Cleaned:** app.json of conflicting plugins
✅ **Ready:** To build and submit directly to App Stores

## Publishing Steps

### Step 1: Update Your App Version & Slug

First, update your app.json with a unique bundle identifier:

```json
{
  "expo": {
    "name": "Price Scanner",
    "slug": "price-scanner-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.pricescanner"
    },
    "android": {
      "package": "com.yourcompany.pricescanner"
    }
  }
}
```

Replace `yourcompany` with your company/developer name.

### Step 2: Create an Expo Account (if you don't have one)

```bash
npx expo login
# Follow the prompts to sign up or log in
```

Verify you're logged in:

```bash
npx expo whoami
```

### Step 3: Build Your App

#### For iOS (requires Apple Developer account ~$99/year):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS for your project
eas build:configure

# Build for iOS
eas build --platform ios --profile preview
```

#### For Android (requires Google Play Developer account ~$25 one-time):

```bash
eas build --platform android --profile preview
```

#### Build Both Platforms:

```bash
eas build --platform all --profile preview
```

Building takes 15-30 minutes. You can check the status at:
https://expo.dev/ → Your Project → Builds

### Step 4: Enable Monetization in Expo Dashboard

1. Go to https://expo.dev/
2. Sign in with your Expo account
3. Click your "Price Scanner" project
4. Navigate to **Monetization** tab
5. Click **Enable Monetization**
6. Configure your ad preferences:
   - Ad frequency
   - Ad types (banners, interstitials, etc.)
   - Content rating
7. Accept terms and save

⚠️ **Important**: Ads won't appear until AFTER your app is approved in the App Store/Play Store (24-48 hours typically).

### Step 5: Submit to App Stores

#### Submit to Apple App Store:

```bash
eas submit --platform ios
```

You'll need:

- Apple ID
- App Store Connect account
- Developer certificate (EAS handles this)
- App name, description, screenshots, etc.

#### Submit to Google Play Store:

```bash
eas submit --platform android
```

You'll need:

- Google Play Developer account
- Service account credentials (EAS will guide you)
- App name, description, screenshots, etc.

#### Submit Both:

```bash
eas submit --platform all
```

### Step 6: Wait for App Approval

- **Apple App Store**: Usually 24-48 hours, sometimes up to 7 days
- **Google Play Store**: Usually 2-4 hours, sometimes instant

Check your review status in:

- App Store Connect (iOS): https://appstoreconnect.apple.com/
- Google Play Console (Android): https://play.google.com/console

### Step 7: Enable Ads After Approval

Once your app is approved and live:

1. Go to https://expo.dev/
2. Navigate to your app → **Monetization**
3. Click **Enable Ads**
4. Select which screens should show ads (or use default: all)
5. Save

Ads should start appearing within 24 hours.

### Step 8: Monitor Revenue

In Expo Dashboard:

1. Navigate to your app → **Monetization**
2. View earnings, impressions, click-through rates (CTR)
3. Revenue is typically paid monthly via your configured payment method

---

## Testing Before Publishing

You can test your build locally before submitting:

```bash
# After successful build, download the APK (Android) or IPA (iOS) from Expo
# For Android, download APK and install on Android device:
# adb install path/to/app.apk

# For iOS, you need a physical device or simulator from Xcode
```

---

## Current Ad Placements

Your app has ads in 6 strategic locations:

| Screen            | Placement                | Size   |
| ----------------- | ------------------------ | ------ |
| HomeScreen        | Top (after stats)        | Medium |
| HomeScreen        | Bottom (before features) | Medium |
| BudgetInputScreen | Before confirm button    | Medium |
| RecentTripsScreen | After every 2 trips      | Medium |
| SettingsScreen    | Top (before account)     | Medium |
| SettingsScreen    | Bottom (before logout)   | Medium |

Premium users (isPremium: true) won't see any ads.

---

## Revenue Expectations

Typical Expo ads monetization:

- **eCPM** (earnings per 1000 impressions): $2-10 depending on location/content
- **CTR** (click-through rate): 0.5-2% typical
- **Regional variance**: US/UK traffic pays more than developing countries
- **Payout threshold**: Usually $50-100 before payment

**Example:** 10,000 monthly impressions × $5 eCPM = $50/month

---

## Common Issues & Fixes

### "Build failed"

- Check your app.json syntax
- Ensure all required fields are present
- Look at the build logs in Expo dashboard for details

### "Ads not showing after approval"

- Wait 24 hours for ads to propagate
- Verify monetization is enabled in dashboard
- Check that isPremium is false in AdContext
- Try force-closing and reopening the app

### "Submit failed"

- Ensure you have valid Apple/Google developer accounts
- Check that your app bundle ID is unique (not taken by another app)
- Review app store guidelines (no misleading ads, appropriate content, etc.)

### "Very low earnings"

- Increase ad placements (carefully - balance with UX)
- Target markets with higher eCPM (US, UK, Canada)
- Wait longer - ads performance improves over time
- Improve app downloads - more users = more impressions

---

## Next Steps Checklist

- [ ] Update app.json with unique bundle ID
- [ ] Create Expo account and log in
- [ ] Create Apple Developer account (if targeting iOS)
- [ ] Create Google Play Developer account (if targeting Android)
- [ ] Run `eas build --platform all --profile preview`
- [ ] Wait for builds to complete
- [ ] Submit to app stores using `eas submit --platform all`
- [ ] Wait for app approval (1-48 hours)
- [ ] Enable monetization in Expo dashboard
- [ ] Monitor revenue and update your app as needed

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Monetization Guide](https://docs.expo.dev/versions/latest/sdk/google-ads/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [EAS Submit Guide](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## Cost Breakdown

| Service                 | Cost              | Notes                      |
| ----------------------- | ----------------- | -------------------------- |
| Apple Developer Account | $99/year          | Required for iOS           |
| Google Play Developer   | $25 one-time      | Required for Android       |
| EAS Build               | Free-$50/month    | Depends on build frequency |
| Revenue Share           | 70% you, 30% Expo | Standard in mobile apps    |

**Total startup cost: ~$124 + EAS if you exceed free tier**

Good luck with your launch! 🚀
