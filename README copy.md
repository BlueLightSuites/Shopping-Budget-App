# Price Scanner Mobile App

A React Native/Expo mobile application for scanning product barcodes and managing shopping budgets. The app integrates with the Price Scanner backend API to provide real-time product information from Kroger and Walmart.

## 🚀 Features

### Core Functionality
- **Barcode Scanning**: Real-time camera-based barcode scanning
- **Budget Management**: Set and track shopping trip budgets
- **Product Lookup**: Automatic product information retrieval
- **Manual Entry**: Add unrecognized products manually
- **Quantity Management**: Adjust quantities for each item
- **Haptic Feedback**: Tactile feedback for successful scans

### User Interface
- **Modern Design**: Clean, intuitive interface with gradients and animations
- **Responsive Layout**: Optimized for both iOS and Android
- **Accessibility**: Proper contrast and touch targets
- **Dark Mode Support**: Camera interface with dark overlay

## 📱 Screens

### 1. Home Screen
- Prominent "Start New Shopping Trip" button
- Shopping statistics display
- Quick action buttons
- Feature highlights

### 2. Budget Input Screen
- Large numerical input for budget amount
- Local currency symbol detection
- Quick budget presets ($50, $100, $200)
- Input validation and confirmation

### 3. Scan View Screen
- Live camera feed with barcode scanner overlay
- Flash toggle for low-light conditions
- Instructional text and budget display
- Manual entry fallback option

### 4. Item Confirmation Modal
- Product details display
- Quantity selector with +/- buttons
- Total price calculation
- Add to cart functionality

### 5. Unrecognized Barcode Modal
- Manual item name input
- Price input with currency symbol
- Quantity selection
- Form validation

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Camera**: Expo Camera with Barcode Scanner
- **UI Components**: Custom components with Linear Gradients
- **State Management**: React Hooks
- **API Integration**: Axios for HTTP requests
- **Haptics**: Expo Haptics for tactile feedback

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🚀 Installation

1. **Navigate to the mobile app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url:3000';
```

### Environment Variables
Create a `.env` file in the mobile-app directory:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 📱 Building for Production

### iOS
```bash
npm run build:ios
```

### Android
```bash
npm run build:android
```

## 🏗️ Project Structure

```
mobile-app/
├── price_scanner/          # Backend API server
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.ts
│   ├── package.json
│   └── README.md
├── src/
│   ├── components/
│   │   ├── ItemConfirmationModal.tsx
│   │   └── UnrecognizedBarcodeModal.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── BudgetInputScreen.tsx
│   │   └── ScanViewScreen.tsx
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── App.tsx
├── app.json
├── package.json
└── README.md
```

## 🔌 API Integration

The app communicates with the Price Scanner backend API (included in `price_scanner/` directory):

- **Kroger API**: Primary product lookup
- **Walmart API**: Fallback product lookup
- **Error Handling**: Graceful fallback for unrecognized barcodes

### Running the Backend

To start the backend API server:

```bash
cd price_scanner
npm install
npm start
```

The backend will run on `http://localhost:3000` by default. See the [price_scanner README](./price_scanner/README.md) for detailed setup instructions.

## 🎨 Design System

### Colors
- Primary: `#4A90E2` (Blue)
- Secondary: `#FF6B6B` (Red)
- Accent: `#FF8E53` (Orange)
- Background: Gradients and overlays

### Typography
- Headers: Bold, 18-28px
- Body: Regular, 14-16px
- Captions: Light, 12-14px

### Components
- Buttons: Rounded corners with gradients
- Cards: Shadow effects with rounded corners
- Modals: Slide animations with overlays

## 🐛 Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Go to device settings and enable camera access
   - Restart the app

2. **API Connection Issues**
   - Check if the backend server is running
   - Verify the API URL in `src/services/api.ts`

3. **Build Errors**
   - Clear Expo cache: `expo r -c`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request 