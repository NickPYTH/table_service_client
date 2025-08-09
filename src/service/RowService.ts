import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {RowModel} from "entities/RowModel";

export const rowAPI = createApi({
    reducerPath: 'rowAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/row`,
    }),
    tagTypes: ['row'],
    endpoints: (build) => ({
        create: build.mutation<RowModel, string>({
            query: (table) => ({
                url: `/`,
                method: 'POST',
                body: {table}
            }),
            invalidatesTags: ['row']
        }),
    })
});
