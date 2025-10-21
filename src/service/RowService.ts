import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {RowModel} from "entities/RowModel";
import {GridFilterItem, GridLogicOperator, GridSortDirection} from "@mui/x-data-grid-premium";

export const rowAPI = createApi({
    reducerPath: 'rowAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['row'],
    endpoints: (build) => ({
        create: build.mutation<RowModel, {tableId: string, position?: number, withCopy?: boolean, currentRowId?: number}>({
            query: ({tableId, position, withCopy, currentRowId}) => ({
                url: `/row/`,
                method: 'POST',
                body: {
                    table: tableId,
                    position,
                    withCopy,
                    currentRowId
                }
            }),
            invalidatesTags: ['row']
        }),
        delete: build.mutation<void, number>({
            query: (id) => ({
                url: `/row/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['row']
        }),
        getAllByTableId: build.mutation<{ count: number, next: string, previous: string, results: RowModel[] },
            { tableId: string, page: number, limit: number, search?: string, sortField?: string, sortDirection?: GridSortDirection }>({
            query: ({tableId, page, limit, search, sortField, sortDirection}) => {
                let sort = '';
                if (sortField && sortDirection) sort = `&sort_field=${sortField}&sort_direction=${sortDirection}`
                return {
                    url: search ?
                        `/rows/?table=${tableId}&page=${page}&limit=${limit}&search=${search}${sort}`
                        :
                        `/rows/?table=${tableId}&page=${page}&limit=${limit}${sort}`,
                    method: 'GET'
                }
            },
            invalidatesTags: ['row']
        }),
        getAllByTableIdWithColumnFilter: build.mutation<{ count: number, next: string, previous: string, results: RowModel[] },
            { tableId: string, page: number, limit: number, filters: GridFilterItem[], mode?: GridLogicOperator, sortField?: string, sortDirection?: GridSortDirection }>({
            query: ({tableId, page, limit, filters, mode, sortField, sortDirection}) => {
                let params: string = '';
                filters.forEach((filter) => {
                    if (filter.value)
                        params += `&${filter.field}=${filter.value}`
                });
                let sort = '';
                if (sortField && sortDirection) sort = `&sort_field=${sortField}&sort_direction=${sortDirection}`
                return {
                    url: `/rows/?table=${tableId}&page=${page}&limit=${limit}&is_column_search=True&column_search_mode=${mode}${params}${sort}`,
                    method: 'GET'
                }
            },
            invalidatesTags: ['row']
        }),
    })
});
