import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TableModel} from "entities/TableModel";

export const tableAPI = createApi({
    reducerPath: 'tableAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
    }),
    tagTypes: ['table'],
    endpoints: (build) => ({
        getAll: build.mutation<TableModel[], void>({
            query: () => ({
                url: `tables/`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        get: build.mutation<TableModel, string>({
            query: (id) => ({
                url: `table/${id}/`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        create: build.mutation<TableModel, string>({
            query: (title) => ({
                url: `table/`,
                method: 'POST',
                body: {
                    title
                }
            }),
            invalidatesTags: ['table']
        }),
        patch: build.mutation<TableModel, {id: string, title: string}>({
            query: ({id, title}) => ({
                url: `table/${id}/`,
                method: 'PATCH',
                body: {
                    title
                }
            }),
            invalidatesTags: ['table']
        }),
    })
});
