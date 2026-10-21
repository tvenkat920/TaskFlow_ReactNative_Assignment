import { Platform } from 'react-native';

/**
 * TaskFlow Mobile API Configuration
 *
 * Networking Notes:
 * - Android Emulator: 10.0.2.2 maps to host machine localhost
 * - Physical Device: Change to your host computer's LAN IP (e.g., http://192.168.1.100:5000/api)
 *   Make sure your phone and computer are on the same Wi-Fi network and firewall allows port 5000.
 */
export const API_CONFIG = {
  // Direct LAN IP: works reliably over Wi-Fi without depending on persistent adb reverse tunnels
  BASE_URL: 'http://192.168.1.4:5000/api',
  TIMEOUT_MS: 12000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
