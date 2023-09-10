// store/user.ts
import { Module } from 'vuex';
import { RootState, UserState } from '@/types/interface/storeInterfaces'

// export interface UserState {
//   name: string | null;
//   email: string | null;
// }

const userModule: Module<UserState, RootState> = {
  namespaced: true,
  state: {
    name: null,
    email: null,
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.name = userInfo.name;
      state.email = userInfo.email;
    },
  },
};

export default userModule;
