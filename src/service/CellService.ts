import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {CellModel} from "entities/CellModel";

export const cellAPI = createApi({
    reducerPath: 'cellAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/cells`,
    }),
    tagTypes: ['cell'],
    endpoints: (build) => ({
        patch: build.mutation<CellModel, { id: number, value: any }>({
            query: ({id, value}) => ({
                url: `/${id}/`,
                method: 'PATCH',
                body: {
                    value
                }
            }),
            invalidatesTags: ['cell']
        }),
        getAllByTableId: build.mutation<{ count: number, next: string, previous: string, results: CellModel[] }, { tableId: string, page: number, limit: number }>({
            query: ({tableId, page, limit}) => ({
                url: `/?table=${tableId}&page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            invalidatesTags: ['cell']
        }),
    })
});
