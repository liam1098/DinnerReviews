import { UserState } from '@/types/interface/storeInterfaces'

const USER_INFO_KEY = 'user-info';

export function saveUserInfoToLocalStorage(userInfo: UserState) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

export function loadUserInfoFromLocalStorage(): UserState | null {
  const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
  return storedUserInfo ? JSON.parse(storedUserInfo) : null;
}
