import {createSlice} from "@reduxjs/toolkit";
import {UserModel} from "entities/UserModel";

export type CurrentUserModelStateType = {
    user: UserModel | null;
}

const initialState: CurrentUserModelStateType = {
    user: null
}

const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        setCurrentUser: (state, action: { type: string, payload: any }) => {
            state.user = action.payload;
        }
    }
});

export const {setCurrentUser} = userSlice.actions;

export default userSlice.reducer;