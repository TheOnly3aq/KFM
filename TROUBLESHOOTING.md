# Troubleshooting Guide

## Common Issues and Solutions

### 1. JSON Parse Error: Unexpected character: <

This error occurs when the server returns HTML instead of JSON. However, the app now supports both JSON and SVG badge responses, so this should be resolved automatically.

Common causes of this error:

#### **Server URL Issues:**

- Make sure your server URL is correct (e.g., `https://your-kuma-server.com`)
- Don't include trailing slashes
- Ensure the server is accessible from your device/emulator

#### **Status Page ID Issues:**

- Verify the status page ID exists on your KUMA server
- Check that the status page is published (not private)
- Default status page ID is `vroom` - make sure this exists

#### **Network Issues:**

- If testing on iOS Simulator, make sure your computer can reach the server
- If testing on physical device, ensure both device and server are on the same network or server is publicly accessible
- Check for firewall or proxy issues

### 2. Connection Test Steps

1. **Open the app and go to Settings**
2. **Enter your server URL** (e.g., `https://your-kuma-server.com`)
3. **Enter your status page ID** (e.g., `vroom`)
4. **Tap "Test Connection"**
5. **Check the console logs** for detailed error information

### 3. Manual Testing

You can test the API endpoints manually in a browser or using curl:

```bash
# Test status page endpoint
curl -H "Accept: application/json" https://your-kuma-server.com/api/status-page/vroom

# Test badge endpoint
curl -H "Accept: application/json" https://your-kuma-server.com/api/status-page/vroom/badge
```

### 4. Supported Response Formats

The app now supports both JSON and SVG badge responses:

#### **JSON Response (Status Page):**

The status page endpoint should return JSON like this:

```json
{
  "config": {
    "slug": "vroom",
    "title": "Personal",
    "description": null,
    "icon": "/icon.svg",
    "theme": "auto",
    "published": true
  },
  "publicGroupList": [
    {
      "id": 2,
      "name": "Services",
      "weight": 1,
      "monitorList": [
        {
          "id": 10,
          "name": "LexusTracker API - ACC",
          "sendUrl": 0,
          "type": "http"
        }
      ]
    }
  ],
  "incident": null,
  "maintenanceList": []
}
```

#### **SVG Badge Response (Individual Monitors):**

Individual monitor status endpoints return SVG badges like this:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="70" height="20" role="img" aria-label="Status: Up">
  <title>Status: Up</title>
  <!-- SVG content -->
</svg>
```

The app automatically parses the status from the `aria-label` attribute or text content.

### 5. Debug Information

The app now includes better error handling and will show:

- Detailed error messages in alerts
- Console logs with response content
- Content-type validation
- Network error details

Check the console output for more detailed debugging information.

### 6. Common Server Configurations

#### **Local Development:**

- Server URL: `http://localhost:3001` (or your KUMA port)
- Make sure KUMA is running and accessible

#### **Production Server:**

- Server URL: `https://your-domain.com`
- Ensure SSL certificate is valid
- Check CORS settings if needed

#### **Docker/Container:**

- Use the host machine's IP address
- Ensure port mapping is correct
- Check network connectivity

### 7. Still Having Issues?

1. **Check KUMA server logs** for any errors
2. **Verify the status page is published** in KUMA admin
3. **Test with a different status page ID** if available
4. **Try accessing the URL directly** in a browser
5. **Check network connectivity** between your device and server

The improved error handling should now provide much more detailed information about what's going wrong with the connection.
