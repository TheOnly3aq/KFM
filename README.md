# KUMA Monitor - iOS App

A modern iOS app for monitoring KUMA uptime status pages. Built with Expo and React Native.

## Features

- **Dashboard**: Overview of all monitors with overall system status
- **Monitor List**: Detailed view of all configured monitors
- **Monitor Details**: Individual monitor status with heartbeat history
- **Settings**: Configure server URL and status page ID
- **Real-time Updates**: Auto-refresh and pull-to-refresh functionality
- **iOS Optimized**: Native iOS design patterns and interactions

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Open in iOS Simulator or on a physical device

## Configuration

1. Open the app and go to the **Settings** tab
2. Enter your KUMA server URL (e.g., `https://your-kuma-server.com`)
3. Enter your status page ID (default: `vroom`)
4. Test the connection to ensure everything is working
5. Save your settings

## API Endpoints Used

The app uses the following KUMA API endpoints:

- `/api/status-page/{statusPageId}` - Get status page data and monitor list
- `/api/badge/{monitorId}/status` - Get individual monitor status
- `/api/status-page/{statusPageId}/badge` - Get overall status page status
- `/api/status-page/heartbeat/{statusPageId}` - Get heartbeat data

## App Structure

- **Dashboard** (`/`): Main overview with system status and quick actions
- **Monitors** (`/monitors`): List of all monitors with their current status
- **Settings** (`/settings`): Server configuration and app preferences
- **Monitor Detail** (`/monitor-detail`): Individual monitor details with heartbeat history

## Development

The app is built with:

- **Expo Router** for navigation
- **React Native** for the mobile framework
- **TypeScript** for type safety
- **AsyncStorage** for data persistence
- **Expo Vector Icons** for iOS-native icons

## Building for Production

To build for iOS:

```bash
npx expo build:ios
```

Or use EAS Build:

```bash
npx eas build --platform ios
```