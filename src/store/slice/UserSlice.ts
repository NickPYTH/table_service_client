import {createSlice} from "@reduxjs/toolkit";

export type CurrentUserModelStateType = {
    user: any
}

const initialState: CurrentUserModelStateType = {
    user: {}
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