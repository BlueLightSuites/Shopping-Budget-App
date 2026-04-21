# Google AdMob Setup Guide

This app now has Google AdMob integration built-in. Follow these steps to configure it for your app.

## Step 1: Create a Google AdMob Account

1. Go to https://admob.google.com
2. Sign in with your Google account (or create one)
3. Click "Get started"
4. Follow the setup wizard

## Step 2: Register Your App

1. In AdMob, click "Apps" in the left sidebar
2. Click "Add app"
3. Select your app platform (iOS or Android, or both)
4. Enter your app name: `Price Scanner`
5. Follow the prompts and accept terms

## Step 3: Create Ad Units

After your app is registered, you need to create ad units for each placement:

### For iOS:

1. Click your app name in the Apps list
2. Click "Ad units" → "Add ad unit"
3. Select ad format: **Banner**
4. Name: `HomeScreen_Top_Banner` (or descriptive name)
5. Copy the Ad Unit ID (format: `ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy`)

Repeat for each placement you want (we have 4):

- HomeScreen top banner
- HomeScreen bottom banner
- BudgetInputScreen banner
- RecentTripsScreen banners
- SettingsScreen top banner
- SettingsScreen bottom banner

### For Android:

Repeat the same process for Android platform, you'll get different Ad Unit IDs.

## Step 4: Update Configuration Files

### 1. Update `app.json` with your App IDs

Find the `react-native-google-mobile-ads` plugin section:

```json
[
  "react-native-google-mobile-ads",
  {
    "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyyyyyy",
    "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~zzzzzzzzzzzzzz"
  }
]
```

Replace with your actual App IDs from AdMob (these are different from Ad Unit IDs).

### 2. Update `src/components/AdBanner.tsx` with your Ad Unit IDs

Look for this section:

```typescript
const AD_UNIT_IDS = {
  ios: {
    banner: TestIds.BANNER, // Replace with: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'
  },
  android: {
    banner: TestIds.BANNER, // Replace with: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz'
  },
};
```

Replace with your actual Ad Unit IDs from Step 3.

### 3. (Optional) Update individual ad placements

If you want different ads for different screens (recommended), create separate Ad Unit IDs for each:

```typescript
const AD_UNIT_IDS = {
  ios: {
    homeTopBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/1111111111',
    homeBottomBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/2222222222',
    budgetBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/3333333333',
    recentTripsBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/4444444444',
    settingsTopBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/5555555555',
    settingsBottomBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/6666666666',
  },
  android: {
    homeTopBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz1',
    homeBottomBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz2',
    budgetBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz3',
    recentTripsBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz4',
    settingsTopBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz5',
    settingsBottomBanner: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz6',
  },
};
```

Then pass the specific ID to each `<AdBanner>` component:

```typescript
<AdBanner unitId={AD_UNIT_IDS[Platform.OS].homeTopBanner} size="medium" />
```

## Step 5: Testing

The app currently uses Google's test Ad Unit IDs (TestIds.BANNER), which will show test ads. This is perfect for development and testing.

When running with test IDs, you'll see a placeholder that says "📢 Ad Space (Test Mode)".

## Step 6: Going to Production

Once you're ready to submit to app stores:

1. **Replace test IDs with real Ad Unit IDs** in AdBanner.tsx
2. **Set up payment information** in AdMob
3. **Wait for app approval** (can take 24-48 hours)
4. **Test the production ads** before submitting to stores

⚠️ **Important**: Don't change TestIds to real IDs until you're ready to publish. Google will reject your app if you submit with test IDs.

## Step 7: Monitoring Revenue

Once live, you can track earnings in the AdMob dashboard:

- Dashboard → Earnings
- View by app, ad unit, or date range
- Check impression and click data

## Troubleshooting

### Ads not showing?

1. Make sure you replaced TestIds with real Ad Unit IDs
2. Check that ad units are correctly configured in AdMob
3. Ensure app IDs are correct in app.json
4. Wait 24 hours for ads to start appearing (initial approval period)

### Ad impression data is 0?

- Test ads don't count toward earnings (intentional)
- Switch to production Ad Unit IDs to see real data
- Wait a few hours for data to show up in dashboard

### TestIds not working?

- Make sure you imported TestIds from the library
- Verify you're using a valid test ID: `TestIds.BANNER`

## Ad Placements in This App

Current ad placements:

- **HomeScreen**: Top banner (after stats) + Bottom banner (before features)
- **BudgetInputScreen**: Single banner (before confirm button)
- **RecentTripsScreen**: Banner after every 2 trips
- **SettingsScreen**: Top banner (before account section) + Bottom banner (before logout)
- **StoreSelector**: Banners integrated into the screen

Total: 6 ad placements (multiply by 2 if using separate iOS/Android units)

## Revenue Tips

1. **Placement matters**: Top and bottom of scrollable content performs better
2. **Premium subscribers**: Set `isPremium: true` in AdContext to hide all ads
3. **Ad density**: We use a moderate density (ads on 4 screens) which is good UX
4. **Mediation**: Consider adding mediation to show multiple networks' ads
5. **Performance**: Monitor if ads impact app performance

## Resources

- [Google AdMob Help Center](https://support.google.com/admob)
- [React Native Google Mobile Ads Docs](https://github.com/invertase/react-native-google-mobile-ads)
- [App Store Ads Best Practices](https://developer.apple.com/app-store/best-practices/)
