import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {TablePermissionsModel} from "entities/TablePermissionsModel";

export const tablepermissionsAPI = createApi({
    reducerPath: 'tablepermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/tablepermissions`,
    }),
    tagTypes: ['tablepermissions'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<TablePermissionsModel[], string>({
            query: (table_id) => ({
                url: `/?table_id=${table_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tablepermissions']
        }),
    })
});
