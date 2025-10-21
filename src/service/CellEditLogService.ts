import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {CellEditLogModel} from "entities/CellEditLogModel";

export const cellEditLogAPI = createApi({
    reducerPath: 'cellEditLogAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/celleditlog`,
    }),
    tagTypes: ['celleditlog'],
    endpoints: (build) => ({
        create: build.mutation<CellEditLogModel, CellEditLogModel>({
            query: (body) => ({
                url: `/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['celleditlog']
        }),
        getAllByRowId: build.mutation<CellEditLogModel[], number>({
            query: (rowId) => ({
                url: `/?row_id=${rowId}`,
                method: 'GET',
            }),
            invalidatesTags: ['celleditlog']
        }),
        delete: build.mutation<void, number>({
            query: (id) => ({
                url: `/${id}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['celleditlog']
        }),
    })
});
