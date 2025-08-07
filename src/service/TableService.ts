import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TableModel} from "entities/TableModel";

export const tableAPI = createApi({
    reducerPath: 'tableAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/tables`,
    }),
    tagTypes: ['table'],
    endpoints: (build) => ({
        getAll: build.mutation<TableModel[], void>({
            query: () => ({
                url: `/`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
    })
});
