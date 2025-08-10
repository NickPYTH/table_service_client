import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {ColumnModel} from "entities/ColumnModel";

export const columnAPI = createApi({
    reducerPath: 'columnAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/columns`,
    }),
    tagTypes: ['column'],
    endpoints: (build) => ({
        create: build.mutation<ColumnModel, ColumnModel>({
            query: (body) => ({
                url: `/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['column']
        }),
        patch: build.mutation<ColumnModel, { id: number, body: ColumnModel }>({
            query: ({id, body}) => ({
                url: `/${id}/`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['column']
        }),
    })
});
