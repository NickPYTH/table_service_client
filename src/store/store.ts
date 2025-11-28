import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {userAPI} from "service/UserService";
import userSlice, {CurrentUserModelStateType} from "./slice/UserSlice";
import {tableAPI} from "service/TableService";
import {columnAPI} from "service/ColumnService";
import {rowAPI} from "service/RowService";
import {cellAPI} from "service/CellService";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {filialAPI} from "service/FilialService";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";
import {selectTypeAPI} from "service/SelectTypeService";
import {cellEditLogAPI} from "service/CellEditLogService";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";

export type RootStateType = {
    currentUser: CurrentUserModelStateType
};

const rootReducer = combineReducers({
    currentUser: userSlice,
    [userAPI.reducerPath]: userAPI.reducer,
    [filialAPI.reducerPath]: filialAPI.reducer,
    [tableAPI.reducerPath]: tableAPI.reducer,
    [columnAPI.reducerPath]: columnAPI.reducer,
    [rowAPI.reducerPath]: rowAPI.reducer,
    [cellAPI.reducerPath]: cellAPI.reducer,
    [tablepermissionsAPI.reducerPath]: tablepermissionsAPI.reducer,
    [tableFilialPermissionsAPI.reducerPath]: tableFilialPermissionsAPI.reducer,
    [rowPermissionsAPI.reducerPath]: rowPermissionsAPI.reducer,
    [columnPermissionsAPI.reducerPath]: columnPermissionsAPI.reducer,
    [rowFilialPermissionsAPI.reducerPath]: rowFilialPermissionsAPI.reducer,
    [selectTypeAPI.reducerPath]: selectTypeAPI.reducer,
    [cellEditLogAPI.reducerPath]: cellEditLogAPI.reducer,
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware()
                .concat(userAPI.middleware)
                .concat(filialAPI.middleware)
                .concat(tableAPI.middleware)
                .concat(columnAPI.middleware)
                .concat(rowAPI.middleware)
                .concat(cellAPI.middleware)
                .concat(tablepermissionsAPI.middleware)
                .concat(tableFilialPermissionsAPI.middleware)
                .concat(rowPermissionsAPI.middleware)
                .concat(columnPermissionsAPI.middleware)
                .concat(rowFilialPermissionsAPI.middleware)
                .concat(selectTypeAPI.middleware)
                .concat(cellEditLogAPI.middleware)
    })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
