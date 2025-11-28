import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {PermissionModel} from "entities/PermissionModel";

export const columnPermissionsAPI = createApi({
    reducerPath: 'columnpermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/columnpermissions`,
    }),
    tagTypes: ['columnpermissions'],
    endpoints: (build) => ({
        getAllByRowId: build.mutation<PermissionModel[], number>({
            query: (column_id) => ({
                url: `/?column_id=${column_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['columnpermissions']
        }),
        getAllByUserId: build.mutation<PermissionModel[], { user_id: number, table_id: string, columnIds: number[] }>({
            query: ({user_id, table_id, columnIds}) => ({
                url: `/?user_id=${user_id}&table_id=${table_id}&columns_ids=[${columnIds}]`,
                method: 'GET'
            }),
            invalidatesTags: ['columnpermissions']
        }),
        create: build.mutation<PermissionModel, { columnId: number, userId: number, tableId: string }>({
            query: ({columnId, userId, tableId}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    column: columnId,
                    user: userId,
                    table: tableId,
                    can_view: true,
                    can_edit: true
                }
            }),
            invalidatesTags: ['columnpermissions']
        }),
        patch: build.mutation<PermissionModel, PermissionModel>({
            query: (columnPermission) => ({
                url: `/${columnPermission.id}/`,
                method: 'PATCH',
                body: {
                    column: columnPermission.column,
                    user: columnPermission.user,
                    table: columnPermission.table,
                    can_edit: columnPermission.can_edit,
                    can_view: true
                }
            }),
            invalidatesTags: ['columnpermissions']
        }),
        delete: build.mutation<void, number>({
            query: (columnPermissionId) => ({
                url: `/${columnPermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['columnpermissions']
        }),
    })
});
