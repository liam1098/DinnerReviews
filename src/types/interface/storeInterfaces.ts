
interface UserState {
    name: string | null;
    email: string | null;
    isAdmin: boolean;
}

interface RootState {
    user: UserState; // You can add other modules here as well
}

export { RootState, UserState }