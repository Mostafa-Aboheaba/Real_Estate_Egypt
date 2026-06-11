import { SearchPreferencesProps } from '../../profile/value-objects/search-preferences.vo';

export const SIGNALS_PORT = Symbol('SIGNALS_PORT');

export interface UserSignals {
  dislikedPropertyIds: string[];
  favoritedPropertyIds: string[];
  likedPropertyIds: string[];
  searchPreferences: SearchPreferencesProps | null;
}

export interface SignalsPort {
  loadUserSignals(userId: string): Promise<UserSignals>;
}
