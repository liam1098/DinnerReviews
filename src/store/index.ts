// store/index.ts
import { createStore, Store } from 'vuex';
import userModule from './user'; // Import the UserState from the user module
import { RootState } from '@/types/interface/storeInterfaces'

// Define a root state interface
// export interface RootState {
//   user: UserState; // You can add other modules here as well
// }

export const store = createStore<RootState>({
  modules: {
    user: userModule,
    // Add other modules if needed
  },
});
