import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {FilialModel} from "entities/FilialModel";

export const filialAPI = createApi({
    reducerPath: 'filialAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/filials`,
    }),
    tagTypes: ['filial'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<FilialModel[], string>({
            query: (tableId) => ({
                url: `/?table_id=${tableId}`,
                method: 'GET',
            }),
            invalidatesTags: ['filial']
        }),
    })
});
