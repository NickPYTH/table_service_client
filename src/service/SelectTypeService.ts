import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {SelectTypeModel} from "entities/SelectTypeModel";

export const selectTypeAPI = createApi({
    reducerPath: 'selectTypeAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/selecttype`,
    }),
    tagTypes: ['selecttype'],
    endpoints: (build) => ({
        create: build.mutation<SelectTypeModel, SelectTypeModel>({
            query: (body) => ({
                url: `/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['selecttype']
        }),
        getAllByColumnId: build.mutation<SelectTypeModel[], number>({
            query: (columnId) => ({
                url: `/${columnId}/column/`,
                method: 'GET',
            }),
            invalidatesTags: ['selecttype']
        }),
        delete: build.mutation<void, number>({
            query: (id) => ({
                url: `/${id}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['selecttype']
        }),
    })
});
