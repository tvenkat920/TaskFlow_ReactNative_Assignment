import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@taskflow_auth_token';
const USER_KEY = '@taskflow_user_data';

export const storage = {
  /**
   * Saves the auth token securely to device storage
   */
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('[Storage] Error setting token:', error);
    }
  },

  /**
   * Retrieves the auth token from storage
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('[Storage] Error getting token:', error);
      return null;
    }
  },

  /**
   * Clears the auth token from storage
   */
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('[Storage] Error clearing token:', error);
    }
  },

  /**
   * Saves cached user profile
   */
  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('[Storage] Error saving user:', error);
    }
  },

  /**
   * Retrieves cached user profile
   */
  async getUser(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Storage] Error getting user:', error);
      return null;
    }
  },

  /**
   * Clears all session keys
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('[Storage] Error clearing session:', error);
    }
  },
};
