import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {UserModel} from "entities/UserModel";

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['user'],
    endpoints: (build) => ({
        getCurrent: build.mutation<any, void>({
            query: () => ({
                url: `/get_current_user`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByTableId: build.mutation<UserModel[], string>({
            query: (tableId) => ({
                url: `/users/?table_id=${tableId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByRowId: build.mutation<UserModel[], {tableId: string, rowId: number}>({
            query: ({tableId,  rowId}) => ({
                url: `/users/?table_id=${tableId}&row_id=${rowId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByColumnId: build.mutation<UserModel[], {tableId: string, columnId: number}>({
            query: ({tableId,  columnId}) => ({
                url: `/users/?table_id=${tableId}&column_id=${columnId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
    })
});
