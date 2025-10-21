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
        create: build.mutation<TableModel, {title: string, with_cell_confirm: boolean, with_cell_logging: boolean}>({
            query: ({title, with_cell_confirm, with_cell_logging}) => ({
                url: `tables/`,
                method: 'POST',
                body: {
                    title,
                    with_cell_confirm,
                    with_cell_logging
                }
            }),
            invalidatesTags: ['table']
        }),
        getLockedCells: build.mutation<{user_id: number, cell_id: number}[], string>({
            query: (table_id) => ({
                url: `table/${table_id}/locks/`,
                method: 'GET'
            }),
            invalidatesTags: ['table']
        }),
        removeLocks: build.mutation<{success: boolean}, string>({
            query: (table_id) => ({
                url: `table/${table_id}/remove_locks/`,
                method: 'GET'
            }),
            invalidatesTags: ['table']
        }),
        patch: build.mutation<TableModel, TableModel>({
            query: (body) => ({
                url: `table/${body.id}/`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['table']
        }),
        delete: build.mutation<TableModel, string>({
            query: (id) => ({
                url: `table/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['table']
        }),
    })
});
