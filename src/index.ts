#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for beyond-identity-secure-access-api v1.7.0
 * Generated on: 2025-09-17T15:06:13.534Z
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";

import { z, ZodError } from 'zod';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import express, { type Request, type Response } from 'express';
import cors from 'cors';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    method: string;
    pathTemplate: string;
    executionParameters: { name: string, in: string }[];
    requestBodyContentType?: string;
    securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "beyond-identity-secure-access-api";
export const SERVER_VERSION = "1.7.0";
export const API_BASE_URL = "https://api-us.beyondidentity.com";

/**
 * MCP Server instance
 */
const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["GetTenant", {
    name: "GetTenant",
    description: `To retrieve an existing tenant, send a GET request to \`/v1/tenants/$TENANT_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."}},"required":["tenant_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}",
    executionParameters: [{"name":"tenant_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["tenants:read"]}]
  }],
  ["UpdateTenant", {
    name: "UpdateTenant",
    description: `To update only specific attributes of an existing tenant, send a PATCH request to \`/v1/tenants/$TENANT_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"requestBody":{"title":"Update Tenant Request","description":"Updates to the specified tenant.","type":"object","properties":{"tenant":{"title":"Tenant","type":"object","description":"A tenant represents an organization in the Beyond Identity Cloud. Tenants contain all data necessary for that organization to operate.\n","properties":{"id":{"type":"string","description":"A unique identifier for the tenant. This is automatically generated on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the tenant. This name is used for display purposes.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the tenant was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the tenant was last updated. This is automatically updated when the tenant is updated. This field is read-only.\n"}}}},"required":["tenant"]}},"required":["tenant_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}",
    executionParameters: [{"name":"tenant_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["tenants:update"]}]
  }],
  ["ListRealms", {
    name: "ListRealms",
    description: `To list all realms for a tenant, send a GET request to
\`/v1/tenants/$TENANT_ID/realms\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of realms in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["realms:read"]}]
  }],
  ["CreateRealm", {
    name: "CreateRealm",
    description: `To create a realm, send a POST request to \`/v1/tenants/$TENANT_ID/realms\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"requestBody":{"title":"Create Realm Request","description":"Request for CreateRealm.","type":"object","properties":{"realm":{"title":"Realm","type":"object","description":"A realm is a unique administrative domain within a tenant. Realms may be used to define multiple development environments or for isolated administrative domains.\n","properties":{"id":{"type":"string","description":"A unique identifier for the realm. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the tenant.\n"},"tenant_id":{"type":"string","description":"A unique identifier of the realm's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the realm. This name is used for display purposes.\n"},"classification":{"type":"string","description":"Classification of the realm. Can be either SECURE_WORFORCE or SECURE_CUSTOMER"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the realm was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the realm was last updated. This is automatically updated when the realm is updated. This field is read-only.\n"}}}},"required":["realm"]}},"required":["tenant_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms",
    executionParameters: [{"name":"tenant_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["realms:create"]}]
  }],
  ["GetRealm", {
    name: "GetRealm",
    description: `To retrieve an existing realm, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["realms:read"]}]
  }],
  ["DeleteRealm", {
    name: "DeleteRealm",
    description: `To delete a realm, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID\`. To be deleted, a realm must not have any identities, groups, or roles. All associated resources must first be deleted or you will receive a 409 error.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."}},"required":["tenant_id","realm_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["realms:delete"]}]
  }],
  ["UpdateRealm", {
    name: "UpdateRealm",
    description: `To update only specific attributes of an existing realm, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Update Realm Request","description":"Request for UpdateRealm.","type":"object","properties":{"realm":{"title":"Realm","type":"object","description":"A realm is a unique administrative domain within a tenant. Realms may be used to define multiple development environments or for isolated administrative domains.\n","properties":{"id":{"type":"string","description":"A unique identifier for the realm. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the tenant.\n"},"tenant_id":{"type":"string","description":"A unique identifier of the realm's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the realm. This name is used for display purposes.\n"},"classification":{"type":"string","description":"Classification of the realm. Can be either SECURE_WORFORCE or SECURE_CUSTOMER"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the realm was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the realm was last updated. This is automatically updated when the realm is updated. This field is read-only.\n"}}}},"required":["realm"]}},"required":["tenant_id","realm_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["realms:update"]}]
  }],
  ["ListGroups", {
    name: "ListGroups",
    description: `To list all groups for a realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of groups in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["groups:read"]}]
  }],
  ["CreateGroup", {
    name: "CreateGroup",
    description: `To create a group, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Group Request","description":"Request for CreateGroup.","type":"object","properties":{"group":{"title":"Group","type":"object","description":"A group is a logical collection of identities. Groups are commonly used as a predicate in a policy rule.\n","properties":{"id":{"type":"string","description":"A unique identifier for a group. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the group's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the group's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the group. This name is used for display purposes.\n"},"description":{"type":"string","maxLength":300,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A free-form text field to describe a group.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the group was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the group was last updated. This is automatically updated when the group is updated. This field is read-only.\n"}}}},"required":["group"]}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["groups:create"]}]
  }],
  ["GetGroup", {
    name: "GetGroup",
    description: `To retrieve an existing group, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."}},"required":["tenant_id","realm_id","group_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["groups:read"]}]
  }],
  ["DeleteGroup", {
    name: "DeleteGroup",
    description: `To delete a group, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID\`. To be deleted, a group must not have any members. Any existing members must first be deleted or you will receive a 409 error.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."}},"required":["tenant_id","realm_id","group_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["groups:delete"]}]
  }],
  ["UpdateGroup", {
    name: "UpdateGroup",
    description: `To update only specific attributes of an existing group, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."},"requestBody":{"title":"Update Group Request","description":"Request for UpdateGroup.","type":"object","properties":{"group":{"title":"Group","type":"object","description":"A group is a logical collection of identities. Groups are commonly used as a predicate in a policy rule.\n","properties":{"id":{"type":"string","description":"A unique identifier for a group. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the group's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the group's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the group. This name is used for display purposes.\n"},"description":{"type":"string","maxLength":300,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A free-form text field to describe a group.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the group was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the group was last updated. This is automatically updated when the group is updated. This field is read-only.\n"}}}},"required":["group"]}},"required":["tenant_id","realm_id","group_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["groups:update"]}]
  }],
  ["AddGroupMembers", {
    name: "AddGroupMembers",
    description: `To add members to a group, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID:addMembers\`. The request must contain at least one and no more than 1000 identity IDs.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."},"requestBody":{"title":"Add Group Members Request","description":"Request for AddGroupMembers.","type":"object","properties":{"identity_ids":{"description":"IDs of the identities to be added to the group.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["identity_ids"]}},"required":["tenant_id","realm_id","group_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:addMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["groups:update","identities:read"]}]
  }],
  ["DeleteGroupMembers", {
    name: "DeleteGroupMembers",
    description: `To delete members from a group, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID:deleteMembers\`. The request must contain at least one and no more than 1000 identity IDs.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."},"requestBody":{"title":"Delete Group Members Request","description":"Request for DeleteGroupMembers.","type":"object","properties":{"identity_ids":{"description":"IDs of the identities to be removed from the group.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["identity_ids"]}},"required":["tenant_id","realm_id","group_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:deleteMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["groups:update","identities:read"]}]
  }],
  ["ListGroupMembers", {
    name: "ListGroupMembers",
    description: `To list members belonging to a group, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID:listMembers\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of members in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","group_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:listMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["groups:read","identities:read"]}]
  }],
  ["ListGroupRoles", {
    name: "ListGroupRoles",
    description: `To list the roles to which a group is assigned, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/groups/$GROUP_ID:listRoles\`.

The request must include the \`resource_server_id\` query parameter specifying
the resource server on which to filter the roles. If the specified resource
server does not exist, you will receive a 409 error.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of roles in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"group_id":{"type":"string","description":"A unique identifier for a group."},"resource_server_id":{"type":"string","minLength":1,"description":"The unique identifier of the resource server used to filter roles."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","group_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}:listRoles",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"group_id","in":"path"},{"name":"resource_server_id","in":"query"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["groups:read","roles:read","resource-servers:read"]}]
  }],
  ["ListIdentities", {
    name: "ListIdentities",
    description: `To list identities for a realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities\`.

The response will only contain identities matching the filter in the
request. If no filter is provided, the request will match all identities in
the realm. Currently, the only supported filter is
\`traits.username eq "$USERNAME"\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of identities in
the response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The filter is also maintained by the page
token but it may not be overridden. If specified, the request filter must
match the filter maintained by the page token, otherwise you will receive a
400 error. The skip is not maintained by the page token and must be
specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"filter":{"type":"string","description":"Filter to constrain the response. The response will only include resources matching this filter. Filters follow the SCIM grammar from [RFC-7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n"},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"filter","in":"query"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["identities:read"]}]
  }],
  ["CreateIdentity", {
    name: "CreateIdentity",
    description: `To create an identity, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities\`. Values in the request body for read-only fields will be ignored.
If the request conflicts with an existing resource, you will receive a 409 error.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Identity Request","description":"Request for CreateIdentity.","type":"object","properties":{"identity":{"title":"Identity","type":"object","description":"An identity is a unique identifier that may be used by an end-user to gain access governed by Beyond Identity.\n","properties":{"id":{"type":"string","description":"A unique identifier for the identity. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the identity's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the identity's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the identity. This name is used for display purposes.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the identity was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the identity was last updated. This is automatically updated when the identity is updated. This field is read-only.\n"},"status":{"type":"string","description":"Indicator for the identity's administrative status.  If 'active', the identity is able to generate passkeys and login.  If 'suspended', the identity is unable to generate passkeys or login.\n"},"traits":{"description":"A collection of properties to describe an identity. All traits contain a `type` key which describes the specific traits schema.\n","oneOf":[{"title":"Traits_v0","description":"Set of traits associated with an identity.","type":"object","properties":{"type":{"type":"string","description":"The type of the traits schema. This value must be provided on all writes.\n","example":"traits_v0"},"username":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A required, unique, case-insensitive username for an identity in the realm.","example":"test"},"primary_email_address":{"type":"string","description":"Email address serving as primary contact for identity.","example":"test@example.com"},"secondary_email_address":{"type":"string","description":"An additional email address for the user.\n"},"external_id":{"type":"string","description":"An ID issued by the provisioning client. It is assumed that the value's uniqueness is controlled by the client setting the value.\n"},"family_name":{"type":"string","description":"The family name or last name in most Western languages.\n"},"given_name":{"type":"string","description":"The given name or first name in most Western languages.\n"},"formatted_name":{"type":"string","description":"The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g. \"Ms. Barbara Jane Jensen, III\").\n"},"middle_name":{"type":"string","description":"The middle name of the user, if applicable.\n"},"honorific_prefix":{"type":"string","description":"Honorifics like \"Mr.\", \"Mrs.\", \"Dr.\", etc.\n"},"honorific_suffix":{"type":"string","description":"Suffixes such as \"Jr.\", \"Sr.\", \"III\", etc.\n"},"nick_name":{"type":"string","description":"A nickname the user goes by.\n"},"title":{"type":"string","description":"The user's job title.\n"},"primary_phone":{"type":"string","description":"The primary contact phone number for the user.\n"},"secondary_phone":{"type":"string","description":"An additional phone number for the user.\n"},"profile_url":{"type":"string","description":"A URL to the user's profile.\n"},"photo":{"type":"string","description":"A URL to the user's photo.\n"},"preferred_language":{"type":"string","description":"The user's preferred language.\n"},"locale":{"type":"string","description":"The locale of the user, typically in the format of language-region.\n"},"timezone":{"type":"string","description":"The timezone of the user.\n"},"formatted_address":{"type":"string","description":"The full mailing address, formatted for display or use with a mailing label. This attribute MAY contain newlines.\n"},"street_address":{"type":"string","description":"The full street address component, which may include house number, street name, P.O. box, and multi-line extended street address information. This attribute MAY contain newlines.\n"},"locality":{"type":"string","description":"The locality or city of the user.\n"},"region":{"type":"string","description":"The region or state of the user.\n"},"postal_code":{"type":"string","description":"The zip code or postal code of the user.\n"},"country":{"type":"string","description":"The country of the user.\n"},"user_type":{"type":"string","description":"Used to identify the relationship between the organization and the user. Typical values used might be 'Contractor', 'Employee', 'Intern', 'Temp', 'External', and 'Unknown', but any value may be used.\n"},"employee_number":{"type":"string","description":"The employee number assigned to the user, typically based on order of hire or association with an organization.\n"},"cost_center":{"type":"string","description":"The cost center associated with the user.\n"},"organization":{"type":"string","description":"The organization the user belongs to.\n"},"division":{"type":"string","description":"The division of the organization the user belongs to.\n"},"department":{"type":"string","description":"The department of the organization the user belongs to.\n"},"manager_id":{"type":"string","description":"The unique identifier for the user's manager.\n"},"manager_name":{"type":"string","description":"The name of the user's manager.\n"}},"required":["type"]}],"discriminator":{"propertyName":"type","mapping":{"traits_v0":"#/components/schemas/Traits_v0"}}}}}},"required":["identity"]}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["identities:create"]}]
  }],
  ["GetIdentity", {
    name: "GetIdentity",
    description: `To retrieve an existing identity, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."}},"required":["tenant_id","realm_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["identities:read"]}]
  }],
  ["DeleteIdentity", {
    name: "DeleteIdentity",
    description: `To delete an identity, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID\`. To be deleted, an identity must not be a member of any groups or roles. The identity must must first be removed from all groups and roles or you will receive a 409 error.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."}},"required":["tenant_id","realm_id","identity_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["identities:delete"]}]
  }],
  ["UpdateIdentity", {
    name: "UpdateIdentity",
    description: `To update only specific attributes of an existing identity, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
If the request conflicts with an existing resource, you will receive a 409 error.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"requestBody":{"title":"Update Identity Request","description":"Request for UpdateIdentity.","type":"object","properties":{"identity":{"title":"Identity","type":"object","description":"An identity is a unique identifier that may be used by an end-user to gain access governed by Beyond Identity.\n","properties":{"id":{"type":"string","description":"A unique identifier for the identity. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the identity's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the identity's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the identity. This name is used for display purposes.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the identity was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the identity was last updated. This is automatically updated when the identity is updated. This field is read-only.\n"},"status":{"type":"string","description":"Indicator for the identity's administrative status.  If 'active', the identity is able to generate passkeys and login.  If 'suspended', the identity is unable to generate passkeys or login.\n"},"traits":{"description":"A collection of properties to describe an identity. All traits contain a `type` key which describes the specific traits schema.\n","oneOf":[{"title":"Traits_v0","description":"Set of traits associated with an identity.","type":"object","properties":{"type":{"type":"string","description":"The type of the traits schema. This value must be provided on all writes.\n","example":"traits_v0"},"username":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A required, unique, case-insensitive username for an identity in the realm.","example":"test"},"primary_email_address":{"type":"string","description":"Email address serving as primary contact for identity.","example":"test@example.com"},"secondary_email_address":{"type":"string","description":"An additional email address for the user.\n"},"external_id":{"type":"string","description":"An ID issued by the provisioning client. It is assumed that the value's uniqueness is controlled by the client setting the value.\n"},"family_name":{"type":"string","description":"The family name or last name in most Western languages.\n"},"given_name":{"type":"string","description":"The given name or first name in most Western languages.\n"},"formatted_name":{"type":"string","description":"The full name, including all middle names, titles, and suffixes as appropriate, formatted for display (e.g. \"Ms. Barbara Jane Jensen, III\").\n"},"middle_name":{"type":"string","description":"The middle name of the user, if applicable.\n"},"honorific_prefix":{"type":"string","description":"Honorifics like \"Mr.\", \"Mrs.\", \"Dr.\", etc.\n"},"honorific_suffix":{"type":"string","description":"Suffixes such as \"Jr.\", \"Sr.\", \"III\", etc.\n"},"nick_name":{"type":"string","description":"A nickname the user goes by.\n"},"title":{"type":"string","description":"The user's job title.\n"},"primary_phone":{"type":"string","description":"The primary contact phone number for the user.\n"},"secondary_phone":{"type":"string","description":"An additional phone number for the user.\n"},"profile_url":{"type":"string","description":"A URL to the user's profile.\n"},"photo":{"type":"string","description":"A URL to the user's photo.\n"},"preferred_language":{"type":"string","description":"The user's preferred language.\n"},"locale":{"type":"string","description":"The locale of the user, typically in the format of language-region.\n"},"timezone":{"type":"string","description":"The timezone of the user.\n"},"formatted_address":{"type":"string","description":"The full mailing address, formatted for display or use with a mailing label. This attribute MAY contain newlines.\n"},"street_address":{"type":"string","description":"The full street address component, which may include house number, street name, P.O. box, and multi-line extended street address information. This attribute MAY contain newlines.\n"},"locality":{"type":"string","description":"The locality or city of the user.\n"},"region":{"type":"string","description":"The region or state of the user.\n"},"postal_code":{"type":"string","description":"The zip code or postal code of the user.\n"},"country":{"type":"string","description":"The country of the user.\n"},"user_type":{"type":"string","description":"Used to identify the relationship between the organization and the user. Typical values used might be 'Contractor', 'Employee', 'Intern', 'Temp', 'External', and 'Unknown', but any value may be used.\n"},"employee_number":{"type":"string","description":"The employee number assigned to the user, typically based on order of hire or association with an organization.\n"},"cost_center":{"type":"string","description":"The cost center associated with the user.\n"},"organization":{"type":"string","description":"The organization the user belongs to.\n"},"division":{"type":"string","description":"The division of the organization the user belongs to.\n"},"department":{"type":"string","description":"The department of the organization the user belongs to.\n"},"manager_id":{"type":"string","description":"The unique identifier for the user's manager.\n"},"manager_name":{"type":"string","description":"The name of the user's manager.\n"}},"required":["type"]}],"discriminator":{"propertyName":"type","mapping":{"traits_v0":"#/components/schemas/Traits_v0"}}}}}},"required":["identity"]}},"required":["tenant_id","realm_id","identity_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["identities:update"]}]
  }],
  ["ListIdentityGroups", {
    name: "ListIdentityGroups",
    description: `To list the groups to which an identity belongs, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID:listGroups\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of groups in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}:listGroups",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["identities:read","groups:read"]}]
  }],
  ["ListIdentityRoles", {
    name: "ListIdentityRoles",
    description: `To list the roles to which an identity is assigned, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID:listRoles\`.

The request must include the \`resource_server_id\` query parameter specifying
the resource server on which to filter the roles. If the specified resource
server does not exist, you will receive a 409 error.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of roles in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"resource_server_id":{"type":"string","minLength":1,"description":"The unique identifier of the resource server used to filter roles."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}:listRoles",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"resource_server_id","in":"query"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["identities:read","roles:read","resource-servers:read"]}]
  }],
  ["ListRoles", {
    name: "ListRoles",
    description: `To list all roles for a resource server, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of roles in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","resource_server_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["roles:read"]}]
  }],
  ["CreateRole", {
    name: "CreateRole",
    description: `To create a role, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"requestBody":{"title":"Create Role Request","description":"Role to be created.","type":"object","properties":{"group":{"title":"Role","type":"object","description":"A role is a logical collection of scopes. Roles are commonly used to limit\naccess control.\n\nThe scopes belonging to a role are limited to its associated resource server.\nHowever, note that the resource server may change independently of the role.\nIf scopes are added to or removed from a resource server, its associated\nroles must be manually updated using the AddRoleScopes or DeleteRoleScopes\nmethods.\n","properties":{"id":{"type":"string","description":"A unique identifier for a role. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"resource_server_id":{"type":"string","description":"A unique identifier for the role's resource server. This is automatically set on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the role's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the role's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the role. This name is used for display purposes.\n"},"description":{"type":"string","maxLength":300,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A free-form text field to describe a role.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the role was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the role was last updated. This is automatically updated when the group is updated. This field is read-only.\n"}}}},"required":["role"]}},"required":["tenant_id","realm_id","resource_server_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:create"]}]
  }],
  ["GetRole", {
    name: "GetRole",
    description: `To retrieve an existing role, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["roles:read"]}]
  }],
  ["DeleteRole", {
    name: "DeleteRole",
    description: `To delete a role, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID\`. To be deleted, a role must not have any scopes or members. Any existing scopes and members must first be deleted or you will receive a 409 error.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["roles:delete"]}]
  }],
  ["UpdateRole", {
    name: "UpdateRole",
    description: `To update only specific attributes of an existing role, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"requestBody":{"title":"Update Role Request","description":"Updates to the specified role.","type":"object","properties":{"role":{"title":"Role","type":"object","description":"A role is a logical collection of scopes. Roles are commonly used to limit\naccess control.\n\nThe scopes belonging to a role are limited to its associated resource server.\nHowever, note that the resource server may change independently of the role.\nIf scopes are added to or removed from a resource server, its associated\nroles must be manually updated using the AddRoleScopes or DeleteRoleScopes\nmethods.\n","properties":{"id":{"type":"string","description":"A unique identifier for a role. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"resource_server_id":{"type":"string","description":"A unique identifier for the role's resource server. This is automatically set on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the role's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the role's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A human-readable name for the role. This name is used for display purposes.\n"},"description":{"type":"string","maxLength":300,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"A free-form text field to describe a role.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the role was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the role was last updated. This is automatically updated when the group is updated. This field is read-only.\n"}}}},"required":["role"]}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:update"]}]
  }],
  ["AddRoleMembers", {
    name: "AddRoleMembers",
    description: `To assign members to a role, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:addMembers\`. The request must contain at least one group ID or identity ID and must not contain more than 1000 group IDs or 1000 identity IDs.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"requestBody":{"title":"Add Role Members Request","description":"Request for AddRoleMembers.","type":"object","properties":{"group_ids":{"description":"IDs of the groups to be assigned to the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000},"identity_ids":{"description":"IDs of the identities to be assigned to the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}}}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:addMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:update","groups:read","identities:read"]}]
  }],
  ["DeleteRoleMembers", {
    name: "DeleteRoleMembers",
    description: `To unassign members from a role, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:deleteMembers\`. The request must contain at least one group ID or identity ID and must not contain more than 1000 group IDs or 1000 identity IDs.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"requestBody":{"title":"Delete Role Members Request","description":"Request for DeleteRoleMembers.","type":"object","properties":{"group_ids":{"description":"IDs of the groups to be unassigned from the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000},"identity_ids":{"description":"IDs of the identities to be unassigned from the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}}}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:deleteMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:update","identities:read","groups:read"]}]
  }],
  ["ListRoleMembers", {
    name: "ListRoleMembers",
    description: `To list members assigned to a role, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:listMembers\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of members in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"groups_page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of groups returned per page for ListRoleMembers. The response will include at most this many groups but may include fewer. If this value is omitted, the response will return the default number of groups allowed by ListRoleMembers.\n"},"groups_skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of groups to skip for ListRoleMembers. This is the zero-based index of the first group result.\n"},"identities_page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of identities returned per page for ListRoleMembers. The response will include at most this many identities but may include fewer. If this value is omitted, the response will return the default number of identities allowed by ListRoleMembers.\n"},"identities_skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of identities to skip for ListRoleMembers. This is the zero-based index of the first identity result.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:listMembers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"},{"name":"groups_page_size","in":"query"},{"name":"groups_skip","in":"query"},{"name":"identities_page_size","in":"query"},{"name":"identities_skip","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["roles:read","groups:read","identities:read"]}]
  }],
  ["AddRoleScopes", {
    name: "AddRoleScopes",
    description: `To assign scopes to a role, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:addScopes\`. The request must contain at least one and no more than 1000 scopes.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"requestBody":{"title":"Add Role Scopes Request","description":"Request for AddRoleScopes.","type":"object","properties":{"scopes":{"description":"Scopes to be assigned to the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["scopes"]}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:addScopes",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:update","resource-servers:read"]}]
  }],
  ["DeleteRoleScopes", {
    name: "DeleteRoleScopes",
    description: `To unassign scopes from a role, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:deleteScopes\`. The request must contain at least one and no more than 1000 scopes.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"requestBody":{"title":"Delete Role Scopes Request","description":"Request for DeleteRoleScopes.","type":"object","properties":{"scopes":{"description":"Scopes to be removed from the role.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["scopes"]}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:deleteScopes",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["roles:update","resource-servers:read"]}]
  }],
  ["ListRoleScopes", {
    name: "ListRoleScopes",
    description: `To list scopes assigned to a role, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID/roles/$ROLE_ID:listScopes\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of scopes in the
response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"role_id":{"type":"string","description":"A unique identifier for a role."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","resource_server_id","role_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}/roles/{role_id}:listScopes",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"},{"name":"role_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["roles:read","resource-servers:read"]}]
  }],
  ["ListCredentials", {
    name: "ListCredentials",
    description: `To list all credentials for an identity, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/credentials\`.
\`$IDENTITY_ID\` may be a wildcard (\`-\`) to request all credentials across all
identities within the realm.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of credentials in
the response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["credentials:read"]}]
  }],
  ["GetCredential", {
    name: "GetCredential",
    description: `To retrieve an existing credential, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/credentials/$CREDENTIAL_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"credential_id":{"type":"string","description":"A unique identifier for a credential."}},"required":["tenant_id","realm_id","identity_id","credential_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials/{credential_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"credential_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["credentials:read"]}]
  }],
  ["RevokeCredential", {
    name: "RevokeCredential",
    description: `To revoke a credential, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/credentials/$CREDENTIAL_ID:revoke\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"credential_id":{"type":"string","description":"A unique identifier for a credential."}},"required":["tenant_id","realm_id","identity_id","credential_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credentials/{credential_id}:revoke",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"credential_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["credentials:revoke"]}]
  }],
  ["ListCredentialBindingJobs", {
    name: "ListCredentialBindingJobs",
    description: `To list all credential binding jobs for an identity, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/credential-binding-jobs\`.
\`$IDENTITY_ID\` may be a wildcard (\`-\`) to request all credential binding
jobs across all identities within the realm.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of credential
binding jobs in the response. Note that the maximum and default page sizes
are subject to change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"skip":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Number of items to skip. This is the zero-based index of the first result.\n"}},"required":["tenant_id","realm_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"skip","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["credential-binding-jobs:read"]}]
  }],
  ["CreateCredentialBindingJob", {
    name: "CreateCredentialBindingJob",
    description: `To create an identity, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/credential-binding-jobs\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"requestBody":{"title":"Create credential binding job request","description":"Credential binding job to be created.","type":"object","properties":{"job":{"title":"CredentialBindingJob","description":"A credential binding job defines the state of binding a new credential to an identity. The state includes creation of the credential binding job to delivery of the credential binding method to completion of the credential binding.\n","type":"object","properties":{"id":{"type":"string","description":"A unique identifier for a credential binding job. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"identity_id":{"type":"string","description":"A unique identifier for the credential binding job's identity. This is automatically set on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the credential binding job's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the credential binding job's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"credential_id":{"type":"string","description":"A unique identifier for the credential that was bound via the credential binding job. This field will only be populated if the credential binding job has successfully been used to bind a credential to an identity.\n"},"delivery_method":{"type":"string","enum":["RETURN","EMAIL"],"description":"The method by which a credential binding link is delivered to the target\nauthenticator or identity.\n\nThe value `RETURN` indicates that a credential binding link will be\nreturned to the caller upon creation of the credential binding job.\n\nThe value `EMAIL` indicates that a credential binding link will be sent\nto the email address associated with the identity.\n"},"state":{"type":"string","enum":["LINK_OPENED","LINK_SENT","REQUEST_DELIVERED","COMPLETE"],"description":"A string representing the current state of the credential binding job.\n\nThe value `COMPLETE` indicates that a credential has been successfully\nbound to an identity.\n\nThe value `LINK_OPENED` indicates that the credential binding link\nassociated with the job has been opened by its target identity.\n\nThe value `LINK_SENT` indicates that the credential binding link\nassociated with the job has been sent to its target authenticator or\nidentity.\n\nThe value `REQUEST_DELIVERED` indicates that the credential binding\nrequest has been successfully delivered to its target authenticator.\n"},"post_binding_redirect_uri":{"type":"string","description":"The URI to which the caller will be redirected after successfully binding a credential to an identity. This field is optional. If not specified, the authenticator will not attempt to redirect to a new location after binding.\n"},"authenticator_config_id":{"type":"string","description":"The ID of the authenticator configuration to be used to build the credential binding job. This field is immutable.\n"},"expire_time":{"type":"string","format":"date-time","description":"A timestamp that represents when the credential binding link associated with the credential binding job will expire. This field is immutable and read-only.\n"},"create_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the credential binding job was created. This is automatically generated on creation. This field is read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"A time value given in ISO8601 combined date and time format that represents when the credential binding job was last updated. This is automatically updated when the credential binding job is updated. This field is read-only.\n"}}}},"required":["job"]}},"required":["tenant_id","realm_id","identity_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["credential-binding-jobs:create"]}]
  }],
  ["GetCredentialBindingJob", {
    name: "GetCredentialBindingJob",
    description: `To retrieve an existing credential binding job, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID\`/credential-binding-jobs/$CREDENTIAL_BINDING_JOB_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_id":{"type":"string","description":"A unique identifier for an identity."},"credential_binding_job_id":{"type":"string","description":"A unique identifier for a credential binding job."}},"required":["tenant_id","realm_id","identity_id","credential_binding_job_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/credential-binding-jobs/{credential_binding_job_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_id","in":"path"},{"name":"credential_binding_job_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["credential-binding-jobs:read"]}]
  }],
  ["CreateTheme", {
    name: "CreateTheme",
    description: `To create a theme, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/themes/$THEME_ID\`. Values in the request body for read-only fields will be ignored. All non-read-only fields are optional and will be populated with defaults if unspecified.
Currently, each realm only supports a single theme. If a theme already exists for the realm, you will receive a 409 error.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Theme Request","description":"Theme to be created.","type":"object","properties":{"theme":{"title":"Theme","description":"A theme is a collection of configurable assets that unifies the end user login experience with your brand and products. It is primarily used to change the styling of the credential binding email.\n","type":"object","properties":{"id":{"type":"string","description":"A unique identifier for a theme. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the theme's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the theme's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"create_time":{"type":"string","format":"date-time","description":"Timestamp of when the theme was created. This field is immutable and read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"Timestamp of when the theme was last updated. This field is read-only.\n"},"email_realm_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"Realm name that is used in email templates."},"logo_url_light":{"type":"string","description":"URL for resolving the logo image for light mode."},"logo_url_dark":{"type":"string","description":"URL for resolving the logo image for dark mode."},"support_url":{"type":"string","format":"url","description":"URL for the customer support portal."},"button_color":{"type":"string","description":"Hexadecimal color code to use for buttons."},"button_text_color":{"type":"string","description":"Hexadecimal color code to use for button text."}}}}}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/themes",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["themes:create"]}]
  }],
  ["GetActiveTheme", {
    name: "GetActiveTheme",
    description: `To retrieve the active theme for a realm, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/themes/active\`. If the realm has not specified the active theme, a default theme will be returned.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/active",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["themes:read"]}]
  }],
  ["GetTheme", {
    name: "GetTheme",
    description: `To retrieve an existing theme, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/themes/$THEME_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"theme_id":{"type":"string","description":"A unique identifier for a theme."}},"required":["tenant_id","realm_id","theme_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/{theme_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"theme_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["themes:read"]}]
  }],
  ["UpdateTheme", {
    name: "UpdateTheme",
    description: `To update only specific attributes of an existing theme, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/themes/$THEME_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"theme_id":{"type":"string","description":"A unique identifier for a theme."},"requestBody":{"title":"Update Theme Request","description":"Theme to be updated.","type":"object","properties":{"theme":{"title":"Theme","description":"A theme is a collection of configurable assets that unifies the end user login experience with your brand and products. It is primarily used to change the styling of the credential binding email.\n","type":"object","properties":{"id":{"type":"string","description":"A unique identifier for a theme. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the theme's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the theme's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"create_time":{"type":"string","format":"date-time","description":"Timestamp of when the theme was created. This field is immutable and read-only.\n"},"update_time":{"type":"string","format":"date-time","description":"Timestamp of when the theme was last updated. This field is read-only.\n"},"email_realm_name":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[^{}[\\]<>;:?\\\\/|*^%$#=~`!]*$","description":"Realm name that is used in email templates."},"logo_url_light":{"type":"string","description":"URL for resolving the logo image for light mode."},"logo_url_dark":{"type":"string","description":"URL for resolving the logo image for dark mode."},"support_url":{"type":"string","format":"url","description":"URL for the customer support portal."},"button_color":{"type":"string","description":"Hexadecimal color code to use for buttons."},"button_text_color":{"type":"string","description":"Hexadecimal color code to use for button text."}}}}}},"required":["tenant_id","realm_id","theme_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/themes/{theme_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"theme_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["themes:update"]}]
  }],
  ["ListApplications", {
    name: "ListApplications",
    description: `To list all applications for a realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications\`.

The response will contain at most 100 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 100 items. There is no defined ordering of the list of applications
in the response.  Note that the maximum and default page sizes are subject
to change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["applications:read"]}]
  }],
  ["CreateApplication", {
    name: "CreateApplication",
    description: `To create an application, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications\`. Values in the request body for read-only fields will be ignored.
At present, there are only two supported protocol types for applications, \`oauth2\` and \`oidc\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Application Request","description":"Request for CreateApplication.","type":"object","properties":{"application":{"title":"Application","type":"object","description":"An application represents a client application that uses Beyond Identity for authentication. This could be a native app, a single-page application, regular web application, or machine-to-machine application credentials.\n","properties":{"id":{"type":"string","description":"A unique identifier for an application. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the application's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the application's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"resource_server_id":{"type":"string","description":"A unique identifier for the application's resource server. At present, the only available resource server is for the Beyond Identity Management API. Referencing this resource server from an application will allow that application to grant access to Beyond Identity's APIs. When not present, this application may provide authentication (identity) but not authorization (access).\n"},"authenticator_config_id":{"type":"string","description":"A unique identifier for the application's authenticator configuration. This field is unused for `oidc` and `oauth2` applications when `grant_type=client_credentials`.\n"},"display_name":{"type":"string","description":"A human-readable name for the application. This name is used for display purposes.\n"},"is_managed":{"type":"boolean","description":"A boolean indicating whether the application is managed by Beyond Identity. Managed applications may not be modified by the user. This is automatically set on creation. This field is immutable and read-only.\n"},"protocol_config":{"description":"Represents an application protocol configuration.","oneOf":[{"title":"OAuth 2.0","description":"OAuth2 protocol configuration.","type":"object","required":["type"],"properties":{"type":{"type":"string","enum":["oauth2"]},"allowed_scopes":{"type":"array","items":{"type":"string","example":"pets:read"},"description":"Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application does not reference a resource server, then this application can only be used for authentication and thereby `scopes` must necessarily be empty.\n"},"client_id":{"type":"string","description":"The client ID for this application. This is automatically set on creation. This field is output-only.\n","readOnly":true,"example":"AYYNcuOSpfqIf33JeegCzDIT"},"client_secret":{"type":"string","description":"The client secret to authenticate as this application; typically, as a Basic Authorization header. This is automatically set on creation. This field is output-only. This field is present only when confidentiality is `confidential`.\n","readOnly":true,"example":"wWD4mPzdsjms1LPekQSo0v9scOHLWy5wmMtKAR2JNhJPAKXv"},"confidentiality":{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"},"token_endpoint_auth_method":{"description":"Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.1. Namely, `client_id`\n   and `client_secret` are sent in the body of the POST request.\n- `client_secret_basic`: The client uses HTTP Basic as defined in\n   OAuth 2.0, Section 2.3.1. Namely, `client_id` and `client_secret`\n   are sent in the Basic Authorization header.\n- `none`: The `client_secret` is not part of the request body and there is no\nauthorization header.\n   This endpoint authentication method is only allowed if the application has\n`confidentiality` set to `confidential`.\n\nDeprecation Notice: This field is deprecated. The API will ignore the value\nof this field in requests. In responses, confidential applications will\nalways have `client_secret_basic` and public applications will always have\n`none`. On authentication, confidential applications may use both\n`client_secret_post` and `client_secret_basic`. Public applications may only\nuse `none`. **This field is scheduled for removal on August 1, 2023**\n","type":"string","deprecated":true,"enum":["client_secret_basic","client_secret_post","none"],"example":"client_secret_basic"},"grant_type":{"type":"array","items":{"type":"string","enum":["authorization_code","client_credentials"],"example":"authorization_code"},"description":"Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client may authorize to the\n  `token` endpoint with a grant code which it obtains via the `authorize`\n  endpoint.\n- `client_credentials`: The client credentials grant type defined\n  in OAuth 2.0, Section 4.4. Namely, the client may authorize to the\n  `token` endpoint with a client credentials tuple of `client_id` and\n  `client_secret`.\n"},"redirect_uris":{"type":"array","items":{"type":"string","example":"https://auth.mypetapp.com/callback"},"description":"A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for more information.\n"},"token_configuration":{"description":"Properties of a token issued for an application.","type":"object","required":["expires_after"],"properties":{"expires_after":{"type":"integer","format":"uint32","description":"Time after minting, in seconds, for which the token will be considered valid.\n","minimum":0,"example":86400},"token_signing_algorithm":{"type":"string","enum":["RS256"],"description":"Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n","default":"RS256","example":"RS256"},"subject_field":{"type":"string","enum":["id","email","username"],"description":"Property of a principal which is used to fill the subject of a token issued for this application.\n","default":"id","example":"id"}}},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"token_format":{"description":"Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order to retrieve token claims.\n","type":"string","enum":["self_contained","referential"],"example":"self_contained","default":"self_contained"}}},{"title":"OIDC","description":"OIDC protocol configuration.","type":"object","required":["type"],"properties":{"type":{"type":"string","enum":["oidc"]},"allowed_scopes":{"type":"array","items":{"type":"string","example":"pets:read"},"description":"Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application does not reference a resource server, then this application can only be used for authentication and thereby `scopes` must necessarily be empty. Note that OIDC requests may accept OpenID Connect standard scopes as well as resource server scopes, but the OpenID Connect scopes should not be defined on the application itself. Currently, the only OpenID Connect supported scope is `openid`.\n"},"client_id":{"type":"string","description":"The client ID for this application. This is automatically set on creation. This field is output-only.\n","readOnly":true,"example":"AYYNcuOSpfqIf33JeegCzDIT"},"client_secret":{"type":"string","description":"The client secret to authenticate as this application; typically, as a Basic Authorization header. This is automatically set on creation. This field is output-only. This field is present only when confidentiality is `confidential`.\n","readOnly":true,"example":"wWD4mPzdsjms1LPekQSo0v9scOHLWy5wmMtKAR2JNhJPAKXv"},"confidentiality":{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"},"token_endpoint_auth_method":{"description":"Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.1. Namely, `client_id`\n   and `client_secret` are sent in the body of the POST request.\n- `client_secret_basic`: The client uses HTTP Basic as defined in\n   OAuth 2.0, Section 2.3.1. Namely, `client_id` and `client_secret`\n   are sent in the Basic Authorization header.\n- `none`: The `client_secret` is not part of the request body and there is no\nauthorization header.\n   This endpoint authentication method is only allowed if the application has\n`confidentiality` set to `confidential`.\n\nDeprecation Notice: This field is deprecated. The API will ignore the value\nof this field in requests. In responses, confidential applications will\nalways have `client_secret_basic` and public applications will always have\n`none`. On authentication, confidential applications may use both\n`client_secret_post` and `client_secret_basic`. Public applications may only\nuse `none`. **This field is scheduled for removal on August 1, 2023**\n","type":"string","deprecated":true,"enum":["client_secret_basic","client_secret_post","none"],"example":"client_secret_basic"},"grant_type":{"type":"array","items":{"type":"string","enum":["authorization_code","client_credentials"],"example":"authorization_code"},"description":"Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client may authorize to the\n  `token` endpoint with a grant code which it obtains via the `authorize`\n  endpoint.\n- `client_credentials`: The client credentials grant type defined\n  in OAuth 2.0, Section 4.4. Namely, the client may authorize to the\n  `token` endpoint with a client credentials tuple of `client_id` and\n  `client_secret`.\n"},"redirect_uris":{"type":"array","items":{"type":"string","example":"https://auth.mypetapp.com/callback"},"description":"A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for more information.\n"},"token_configuration":{"description":"Properties of a token issued for an application.","type":"object","required":["expires_after"],"properties":{"expires_after":{"type":"integer","format":"uint32","description":"Time after minting, in seconds, for which the token will be considered valid.\n","minimum":0,"example":86400},"token_signing_algorithm":{"type":"string","enum":["RS256"],"description":"Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n","default":"RS256","example":"RS256"},"subject_field":{"type":"string","enum":["id","email","username"],"description":"Property of a principal which is used to fill the subject of a token issued for this application.\n","default":"id","example":"id"}}},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"token_format":{"description":"Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order to retrieve token claims.\n","type":"string","enum":["self_contained","referential"],"example":"self_contained","default":"self_contained"}}},{"type":"object","required":["type","acs_url","override_recipient_and_destination","audience_url","default_relay_state","name_format","authentication_context","subject_user_name_attribute","sign_envelope","sign_assertions","signature_algorithm","digest_algorithm","encrypt_assertions","assertion_validity_duration_seconds","sp_signature_certificates","enable_single_log_out","validate_signed_requests","additional_user_attributes","single_logout_sign_request_and_response"],"properties":{"type":{"type":"string","enum":["saml"]},"acs_url":{"description":"Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n","type":"string","example":"https://example.com/saml/acs"},"override_recipient_and_destination":{"description":"When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is used instead.\n","type":"boolean","example":true},"recipient_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML assertion. This is usually the same location as the Single Sign-On URL.\n","type":"string","example":"https://example.com/saml/recipient"},"destination_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is intended to be sent inside of the SAML assertion.\n","type":"string","example":"https://example.com/saml/destination"},"audience_url":{"description":"The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n","type":"string","example":"https://example.com/saml/audience"},"default_relay_state":{"description":"Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n","type":"string","example":"defaultRelayState"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"subject_user_name_attribute":{"description":"Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"sign_envelope":{"description":"Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n","type":"boolean","example":true},"sign_assertions":{"description":"All of the assertions should be signed by the IdP.","type":"boolean","example":true},"signature_algorithm":{"description":"The algorithm used for signing the SAML assertions.\n","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"digest_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.\n","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"encrypt_assertions":{"description":"This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sender and receiver can understand the assertion.\n","type":"boolean","example":false},"assertion_validity_duration_seconds":{"description":"The amount of time SAML assertions are valid for in seconds.\n","type":"integer","format":"int32","example":300},"assertion_encryption_algorithm":{"description":"The algorithm used for the digest in SAML assertions.\n","type":"string","enum":["aes256_cbc","aes256_gcm","aes128_cbc","aes128_gcm"],"example":"aes256_cbc"},"assertion_key_transport_algorithm":{"description":"The algorithm used for key transport in SAML assertions.\n","type":"string","enum":["rsa_oaep","rsa1_5"],"example":"rsa_oaep"},"assertion_encryption_public_key":{"description":"The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n","type":"string","example":"-----BEGIN PUBLIC KEY-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END PUBLIC KEY-----\n"},"sp_signature_certificates":{"description":"The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n","type":"array","items":{"type":"object","required":["sp_public_signing_key"],"properties":{"sp_public_signing_key":{"type":"string"}}},"example":["-----BEGIN CERTIFICATE-----\n\nMIIDdzCCAl+gAwIBAgIEbF2LTTANBgkqhkiG9w0BAQsFADBoMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCQ0ExFTATBgNVBAcTDFNhbiBGcmFuY2lzY28xEjAQBgNVBAoT\nCU9rdGEsIEluYy4xHzAdBgNVBAMTFm9rdGEuZXhhbXBsZS5jb20gQ0EgUm9vdDAe\nFw0yMDA2MTkwMDAwMDBaFw0yMTA2MTkyMzU5NTlaMG0xCzAJBgNVBAYTAlVTMQsw\nCQYDVQQIEwJDQTEVMBMGA1UEBxMMU2FuIEZyYW5jaXNjbzESMBAGA1UEChMJb2t0\nPbg6vGfJnxYYibTwLlXhgxl0tT+NMQFZ5GQslLh2sB3AWBzjZtFzFS7lDi0n4Fz5\ny9x6U1hUS54fScJmSVSTT9v/qAD0ccjvlPj3M6PENq2X7TwrOqSTgx5TPOpA5Myl\nMtwPbU3wn/pA5Cp9kWvlYbBfTS4Hx14FQyg3GAAkMrzrhKhpIfhz6iH0H8kDxFId\n6KjXy4TvoUM/tH7c6v2HS6D4TD7TfYOv/8A7E1Lj6WKwjtghTAh3Rb5tbyxRBcw\ngg==\n-----END CERTIFICATE-----\n"]},"enable_single_log_out":{"description":"Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n","type":"boolean","example":false},"single_log_out_url":{"description":"The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/logout"},"single_log_out_issuer_url":{"description":"The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/issuer"},"single_log_out_binding":{"description":"The SAML binding used for SAML messages.\n","type":"string","enum":["post","redirect"],"example":"post"},"single_logout_sign_request_and_response":{"description":"If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n","type":"boolean","example":false},"validate_signed_requests":{"description":"Select this to validate all SAML requests using the SP Signature Certificate.\n","type":"boolean","example":true},"other_sso_urls":{"type":"object","description":"For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response. Specify a URL and an index that uniquely identifies each ACS URL endpoint.\nSome SAML AuthnRequest messages don't specify an index or URL. In these cases, the SAML Response is sent to the ACS specified in the Single sign on URL field.\nWhen you enable Signed Requests, Beyond Identity deletes any previously defined static SSO URLs and reads the SSO URLs from the signed SAML request instead. You can't have both static SSO URLs and dynamic SSO URLs.\nThis can only be set if `validate_signed_requests` is set to false.\n","required":["index","url"],"properties":{"index":{"description":"The index that this URL may be referenced by.","type":"integer","format":"int16","example":1},"url":{"description":"This is a URL that may be used to replace the ACS URL.\n","type":"string","example":"https://example.com/saml/acs1"}}},"additional_user_attributes":{"description":"This structure describes additional attributes that can be attached to SAML assertion.\n","type":"array","items":{"type":"object","required":["name","name_format","value"],"properties":{"name":{"description":"The SAML attribute name.","type":"string","example":"firstName"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"value":{"description":"The value to attach to the SAML value.","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"},"custom_value":{"description":"The custom static string value when value is set to `custom_static_string`.\n","type":"string","example":"customString"}}}},"identity_provider_certs":{"description":"The X509 certificates of the identity provider (Beyond Identity). These are the certificates that is in our IDP metadata, and that the upstream services use to validate our SAML assertion.\n","type":"array","readOnly":true,"items":{"type":"object","description":"The BI Identity Provider Certificate for this SAML connection.\n","required":["id","created_at","expires_at","is_active","idp_public_certificate"],"properties":{"id":{"description":"The id of the certificate.","type":"string","example":"3cb717d1-88ff-440a-b5ee-86c00ce63dbf"},"created_at":{"description":"Timestamp of when the certificate was created.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"expires_at":{"description":"Timestamp of when the certificate expires.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"is_active":{"description":"Indicates whether the certificate is active.","type":"boolean","example":true},"idp_public_certificate":{"description":"Beyond Identity's public signing key wrapped in a certificate.\nStored as a base64 encoded DER format.\n","type":"string","example":"-----BEGIN CERTIFICATE-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END CERTIFICATE-----\n"}}}}}}]}}}},"required":["application"]}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["applications:create"]}]
  }],
  ["GetApplication", {
    name: "GetApplication",
    description: `To retrieve an existing application, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications/$APPLICATION_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."}},"required":["tenant_id","realm_id","application_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["applications:read"]}]
  }],
  ["DeleteApplication", {
    name: "DeleteApplication",
    description: `To delete an application, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications/$APPLICATION_ID\`.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."}},"required":["tenant_id","realm_id","application_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["applications:delete"]}]
  }],
  ["UpdateApplication", {
    name: "UpdateApplication",
    description: `To update only specific attributes of an existing application, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications/$APPLICATION_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."},"requestBody":{"title":"Update Application Request","description":"Request for UpdateApplication.","type":"object","properties":{"application":{"title":"Application","type":"object","description":"An application represents a client application that uses Beyond Identity for authentication. This could be a native app, a single-page application, regular web application, or machine-to-machine application credentials.\n","properties":{"id":{"type":"string","description":"A unique identifier for an application. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the application's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the application's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"resource_server_id":{"type":"string","description":"A unique identifier for the application's resource server. At present, the only available resource server is for the Beyond Identity Management API. Referencing this resource server from an application will allow that application to grant access to Beyond Identity's APIs. When not present, this application may provide authentication (identity) but not authorization (access).\n"},"authenticator_config_id":{"type":"string","description":"A unique identifier for the application's authenticator configuration. This field is unused for `oidc` and `oauth2` applications when `grant_type=client_credentials`.\n"},"display_name":{"type":"string","description":"A human-readable name for the application. This name is used for display purposes.\n"},"is_managed":{"type":"boolean","description":"A boolean indicating whether the application is managed by Beyond Identity. Managed applications may not be modified by the user. This is automatically set on creation. This field is immutable and read-only.\n"},"protocol_config":{"description":"Represents an application protocol configuration.","oneOf":[{"title":"OAuth 2.0","description":"OAuth2 protocol configuration.","type":"object","required":["type"],"properties":{"type":{"type":"string","enum":["oauth2"]},"allowed_scopes":{"type":"array","items":{"type":"string","example":"pets:read"},"description":"Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application does not reference a resource server, then this application can only be used for authentication and thereby `scopes` must necessarily be empty.\n"},"client_id":{"type":"string","description":"The client ID for this application. This is automatically set on creation. This field is output-only.\n","readOnly":true,"example":"AYYNcuOSpfqIf33JeegCzDIT"},"client_secret":{"type":"string","description":"The client secret to authenticate as this application; typically, as a Basic Authorization header. This is automatically set on creation. This field is output-only. This field is present only when confidentiality is `confidential`.\n","readOnly":true,"example":"wWD4mPzdsjms1LPekQSo0v9scOHLWy5wmMtKAR2JNhJPAKXv"},"confidentiality":{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"},"token_endpoint_auth_method":{"description":"Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.1. Namely, `client_id`\n   and `client_secret` are sent in the body of the POST request.\n- `client_secret_basic`: The client uses HTTP Basic as defined in\n   OAuth 2.0, Section 2.3.1. Namely, `client_id` and `client_secret`\n   are sent in the Basic Authorization header.\n- `none`: The `client_secret` is not part of the request body and there is no\nauthorization header.\n   This endpoint authentication method is only allowed if the application has\n`confidentiality` set to `confidential`.\n\nDeprecation Notice: This field is deprecated. The API will ignore the value\nof this field in requests. In responses, confidential applications will\nalways have `client_secret_basic` and public applications will always have\n`none`. On authentication, confidential applications may use both\n`client_secret_post` and `client_secret_basic`. Public applications may only\nuse `none`. **This field is scheduled for removal on August 1, 2023**\n","type":"string","deprecated":true,"enum":["client_secret_basic","client_secret_post","none"],"example":"client_secret_basic"},"grant_type":{"type":"array","items":{"type":"string","enum":["authorization_code","client_credentials"],"example":"authorization_code"},"description":"Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client may authorize to the\n  `token` endpoint with a grant code which it obtains via the `authorize`\n  endpoint.\n- `client_credentials`: The client credentials grant type defined\n  in OAuth 2.0, Section 4.4. Namely, the client may authorize to the\n  `token` endpoint with a client credentials tuple of `client_id` and\n  `client_secret`.\n"},"redirect_uris":{"type":"array","items":{"type":"string","example":"https://auth.mypetapp.com/callback"},"description":"A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for more information.\n"},"token_configuration":{"description":"Properties of a token issued for an application.","type":"object","required":["expires_after"],"properties":{"expires_after":{"type":"integer","format":"uint32","description":"Time after minting, in seconds, for which the token will be considered valid.\n","minimum":0,"example":86400},"token_signing_algorithm":{"type":"string","enum":["RS256"],"description":"Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n","default":"RS256","example":"RS256"},"subject_field":{"type":"string","enum":["id","email","username"],"description":"Property of a principal which is used to fill the subject of a token issued for this application.\n","default":"id","example":"id"}}},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"token_format":{"description":"Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order to retrieve token claims.\n","type":"string","enum":["self_contained","referential"],"example":"self_contained","default":"self_contained"}}},{"title":"OIDC","description":"OIDC protocol configuration.","type":"object","required":["type"],"properties":{"type":{"type":"string","enum":["oidc"]},"allowed_scopes":{"type":"array","items":{"type":"string","example":"pets:read"},"description":"Scopes to which this application can grant access. If this application references a resource server, this set of scopes must be a subset of the resource server's available scopes. If this application does not reference a resource server, then this application can only be used for authentication and thereby `scopes` must necessarily be empty. Note that OIDC requests may accept OpenID Connect standard scopes as well as resource server scopes, but the OpenID Connect scopes should not be defined on the application itself. Currently, the only OpenID Connect supported scope is `openid`.\n"},"client_id":{"type":"string","description":"The client ID for this application. This is automatically set on creation. This field is output-only.\n","readOnly":true,"example":"AYYNcuOSpfqIf33JeegCzDIT"},"client_secret":{"type":"string","description":"The client secret to authenticate as this application; typically, as a Basic Authorization header. This is automatically set on creation. This field is output-only. This field is present only when confidentiality is `confidential`.\n","readOnly":true,"example":"wWD4mPzdsjms1LPekQSo0v9scOHLWy5wmMtKAR2JNhJPAKXv"},"confidentiality":{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"},"token_endpoint_auth_method":{"description":"Indicator of the requested authentication method for the token endpoint.\nAllowable values are: - `client_secret_post`: The client uses the HTTP POST\nparameters\n   as defined in OAuth 2.0, Section 2.3.1. Namely, `client_id`\n   and `client_secret` are sent in the body of the POST request.\n- `client_secret_basic`: The client uses HTTP Basic as defined in\n   OAuth 2.0, Section 2.3.1. Namely, `client_id` and `client_secret`\n   are sent in the Basic Authorization header.\n- `none`: The `client_secret` is not part of the request body and there is no\nauthorization header.\n   This endpoint authentication method is only allowed if the application has\n`confidentiality` set to `confidential`.\n\nDeprecation Notice: This field is deprecated. The API will ignore the value\nof this field in requests. In responses, confidential applications will\nalways have `client_secret_basic` and public applications will always have\n`none`. On authentication, confidential applications may use both\n`client_secret_post` and `client_secret_basic`. Public applications may only\nuse `none`. **This field is scheduled for removal on August 1, 2023**\n","type":"string","deprecated":true,"enum":["client_secret_basic","client_secret_post","none"],"example":"client_secret_basic"},"grant_type":{"type":"array","items":{"type":"string","enum":["authorization_code","client_credentials"],"example":"authorization_code"},"description":"Grant types supported by this application's `token` endpoint. Allowable values\nare:\n- `authorization_code`: The authorization code grant type defined\n  in OAuth 2.0, Section 4.1. Namely, the client may authorize to the\n  `token` endpoint with a grant code which it obtains via the `authorize`\n  endpoint.\n- `client_credentials`: The client credentials grant type defined\n  in OAuth 2.0, Section 4.4. Namely, the client may authorize to the\n  `token` endpoint with a client credentials tuple of `client_id` and\n  `client_secret`.\n"},"redirect_uris":{"type":"array","items":{"type":"string","example":"https://auth.mypetapp.com/callback"},"description":"A list of valid URIs to redirect the resource owner's user-agent to after completing its interaction with the authorization server. See https://datatracker.ietf.org/doc/html/rfc6749#section-3.1.2 for more information.\n"},"token_configuration":{"description":"Properties of a token issued for an application.","type":"object","required":["expires_after"],"properties":{"expires_after":{"type":"integer","format":"uint32","description":"Time after minting, in seconds, for which the token will be considered valid.\n","minimum":0,"example":86400},"token_signing_algorithm":{"type":"string","enum":["RS256"],"description":"Signing algorithm to use for an application token. The only allowable value at present is `RS256`.\n","default":"RS256","example":"RS256"},"subject_field":{"type":"string","enum":["id","email","username"],"description":"Property of a principal which is used to fill the subject of a token issued for this application.\n","default":"id","example":"id"}}},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"token_format":{"description":"Allowed access token formats for this application.\ntoken type. Allowable values are:\n- `self_contained`: token in JWT format.\n- `referential`: Encoded token which requires /introspect\n   call in order to retrieve token claims.\n","type":"string","enum":["self_contained","referential"],"example":"self_contained","default":"self_contained"}}},{"type":"object","required":["type","acs_url","override_recipient_and_destination","audience_url","default_relay_state","name_format","authentication_context","subject_user_name_attribute","sign_envelope","sign_assertions","signature_algorithm","digest_algorithm","encrypt_assertions","assertion_validity_duration_seconds","sp_signature_certificates","enable_single_log_out","validate_signed_requests","additional_user_attributes","single_logout_sign_request_and_response"],"properties":{"type":{"type":"string","enum":["saml"]},"acs_url":{"description":"Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n","type":"string","example":"https://example.com/saml/acs"},"override_recipient_and_destination":{"description":"When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is used instead.\n","type":"boolean","example":true},"recipient_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML assertion. This is usually the same location as the Single Sign-On URL.\n","type":"string","example":"https://example.com/saml/recipient"},"destination_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is intended to be sent inside of the SAML assertion.\n","type":"string","example":"https://example.com/saml/destination"},"audience_url":{"description":"The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n","type":"string","example":"https://example.com/saml/audience"},"default_relay_state":{"description":"Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n","type":"string","example":"defaultRelayState"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"subject_user_name_attribute":{"description":"Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"sign_envelope":{"description":"Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n","type":"boolean","example":true},"sign_assertions":{"description":"All of the assertions should be signed by the IdP.","type":"boolean","example":true},"signature_algorithm":{"description":"The algorithm used for signing the SAML assertions.\n","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"digest_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.\n","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"encrypt_assertions":{"description":"This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sender and receiver can understand the assertion.\n","type":"boolean","example":false},"assertion_validity_duration_seconds":{"description":"The amount of time SAML assertions are valid for in seconds.\n","type":"integer","format":"int32","example":300},"assertion_encryption_algorithm":{"description":"The algorithm used for the digest in SAML assertions.\n","type":"string","enum":["aes256_cbc","aes256_gcm","aes128_cbc","aes128_gcm"],"example":"aes256_cbc"},"assertion_key_transport_algorithm":{"description":"The algorithm used for key transport in SAML assertions.\n","type":"string","enum":["rsa_oaep","rsa1_5"],"example":"rsa_oaep"},"assertion_encryption_public_key":{"description":"The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n","type":"string","example":"-----BEGIN PUBLIC KEY-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END PUBLIC KEY-----\n"},"sp_signature_certificates":{"description":"The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n","type":"array","items":{"type":"object","required":["sp_public_signing_key"],"properties":{"sp_public_signing_key":{"type":"string"}}},"example":["-----BEGIN CERTIFICATE-----\n\nMIIDdzCCAl+gAwIBAgIEbF2LTTANBgkqhkiG9w0BAQsFADBoMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCQ0ExFTATBgNVBAcTDFNhbiBGcmFuY2lzY28xEjAQBgNVBAoT\nCU9rdGEsIEluYy4xHzAdBgNVBAMTFm9rdGEuZXhhbXBsZS5jb20gQ0EgUm9vdDAe\nFw0yMDA2MTkwMDAwMDBaFw0yMTA2MTkyMzU5NTlaMG0xCzAJBgNVBAYTAlVTMQsw\nCQYDVQQIEwJDQTEVMBMGA1UEBxMMU2FuIEZyYW5jaXNjbzESMBAGA1UEChMJb2t0\nPbg6vGfJnxYYibTwLlXhgxl0tT+NMQFZ5GQslLh2sB3AWBzjZtFzFS7lDi0n4Fz5\ny9x6U1hUS54fScJmSVSTT9v/qAD0ccjvlPj3M6PENq2X7TwrOqSTgx5TPOpA5Myl\nMtwPbU3wn/pA5Cp9kWvlYbBfTS4Hx14FQyg3GAAkMrzrhKhpIfhz6iH0H8kDxFId\n6KjXy4TvoUM/tH7c6v2HS6D4TD7TfYOv/8A7E1Lj6WKwjtghTAh3Rb5tbyxRBcw\ngg==\n-----END CERTIFICATE-----\n"]},"enable_single_log_out":{"description":"Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n","type":"boolean","example":false},"single_log_out_url":{"description":"The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/logout"},"single_log_out_issuer_url":{"description":"The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/issuer"},"single_log_out_binding":{"description":"The SAML binding used for SAML messages.\n","type":"string","enum":["post","redirect"],"example":"post"},"single_logout_sign_request_and_response":{"description":"If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n","type":"boolean","example":false},"validate_signed_requests":{"description":"Select this to validate all SAML requests using the SP Signature Certificate.\n","type":"boolean","example":true},"other_sso_urls":{"type":"object","description":"For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response. Specify a URL and an index that uniquely identifies each ACS URL endpoint.\nSome SAML AuthnRequest messages don't specify an index or URL. In these cases, the SAML Response is sent to the ACS specified in the Single sign on URL field.\nWhen you enable Signed Requests, Beyond Identity deletes any previously defined static SSO URLs and reads the SSO URLs from the signed SAML request instead. You can't have both static SSO URLs and dynamic SSO URLs.\nThis can only be set if `validate_signed_requests` is set to false.\n","required":["index","url"],"properties":{"index":{"description":"The index that this URL may be referenced by.","type":"integer","format":"int16","example":1},"url":{"description":"This is a URL that may be used to replace the ACS URL.\n","type":"string","example":"https://example.com/saml/acs1"}}},"additional_user_attributes":{"description":"This structure describes additional attributes that can be attached to SAML assertion.\n","type":"array","items":{"type":"object","required":["name","name_format","value"],"properties":{"name":{"description":"The SAML attribute name.","type":"string","example":"firstName"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"value":{"description":"The value to attach to the SAML value.","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"},"custom_value":{"description":"The custom static string value when value is set to `custom_static_string`.\n","type":"string","example":"customString"}}}},"identity_provider_certs":{"description":"The X509 certificates of the identity provider (Beyond Identity). These are the certificates that is in our IDP metadata, and that the upstream services use to validate our SAML assertion.\n","type":"array","readOnly":true,"items":{"type":"object","description":"The BI Identity Provider Certificate for this SAML connection.\n","required":["id","created_at","expires_at","is_active","idp_public_certificate"],"properties":{"id":{"description":"The id of the certificate.","type":"string","example":"3cb717d1-88ff-440a-b5ee-86c00ce63dbf"},"created_at":{"description":"Timestamp of when the certificate was created.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"expires_at":{"description":"Timestamp of when the certificate expires.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"is_active":{"description":"Indicates whether the certificate is active.","type":"boolean","example":true},"idp_public_certificate":{"description":"Beyond Identity's public signing key wrapped in a certificate.\nStored as a base64 encoded DER format.\n","type":"string","example":"-----BEGIN CERTIFICATE-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END CERTIFICATE-----\n"}}}}}}]}}}},"required":["application"]}},"required":["tenant_id","realm_id","application_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["applications:update"]}]
  }],
  ["ListAuthenticatorConfigs", {
    name: "ListAuthenticatorConfigs",
    description: `To list all authenticator configurations for a realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs\`.

The response will contain at most 100 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 100 items. There is no defined ordering of the list of authenticator
configurations in the response. Note that the maximum and default page sizes
are subject to change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["authenticator-configs:read"]}]
  }],
  ["CreateAuthenticatorConfig", {
    name: "CreateAuthenticatorConfig",
    description: `To create an authenticator configuration, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Authenticator Configuration Request","description":"Request for CreateAuthenticatorConfig.","type":"object","properties":{"authenticator_config":{"title":"Authenticator Configuration","type":"object","description":"Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n","properties":{"id":{"type":"string","description":"A unique identifier for an authenticator configuration. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the authenticator configuration's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the authenticator configuration's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"A human-readable name for the authenticator configuration. This name is used for display purposes.\n"},"config":{"description":"An object specifying the settings for the supported authenticator type.\n","oneOf":[{"title":"Embedded SDK Authenticator","description":"Configuration options for the embedded SDK authenticator.","type":"object","required":["type","invoke_url","trusted_origins"],"properties":{"invocation_type":{"default":"automatic","description":"The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects you to your native or web app using the Invoke URL with a\nchallenge that your app will need to sign.\n\nThe value `manual` indicates that this invocation type will cause the\nchallenge to be returned to you as part of a JSON response. It will then\nbe up to you to get it to your native/web app any way you see fit. This is\nuseful for flows where you require a lot more control when redirecting to\nyour native/web app. Since the challenge is packaged as part of a URL,\nfollowing the URL will result in the same behavior as if an Invocation\nType of \"automatic\" were selected.\n","enum":["automatic","manual"],"type":"string"},"invoke_url":{"description":"URL to invoke during the authentication flow.","example":"http://localhost:8092","type":"string"},"trusted_origins":{"description":"Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> \"://\" <host> [ \":\" <port> ]`, such as `https://auth.your-domain.com` or `http://localhost:3000`.\n","items":{"example":"http://localhost:8092","type":"string"},"type":"array"},"type":{"enum":["embedded"],"type":"string"},"authentication_methods":{"items":{"properties":{"type":{"description":"Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your device's trusted execution environment (TEE). If webauthn\npasskeys are not supported in the browser, specifying one of the other two\nauthentication methods will result in a fallback to that mechanism.\n\nThe value `software_passkey` activates a workflow where a passkey is\nsecurely created within the browser's context.\n\nThe value `email_one_time_password` enables a workflow that verifies\nidentity via an email of a one-time password.\n","enum":["email_one_time_password","software_passkey","webauthn_passkey"],"type":"string"}},"required":["type"],"title":"AuthenticationMethod","type":"object"},"type":"array"}}},{"title":"Hosted Web Authenticator","description":"Configuration options for the hosted web experience. This authenticator is maintained by Beyond Identity and allows the caller to customize authentication methods.\n","type":"object","required":["type","authentication_methods","trusted_origins"],"properties":{"authentication_methods":{"items":{"properties":{"type":{"description":"Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your device's trusted execution environment (TEE). If webauthn\npasskeys are not supported in the browser, specifying one of the other two\nauthentication methods will result in a fallback to that mechanism.\n\nThe value `software_passkey` activates a workflow where a passkey is\nsecurely created within the browser's context.\n\nThe value `email_one_time_password` enables a workflow that verifies\nidentity via an email of a one-time password.\n","enum":["email_one_time_password","software_passkey","webauthn_passkey"],"type":"string"}},"required":["type"],"title":"AuthenticationMethod","type":"object"},"type":"array"},"trusted_origins":{"description":"Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> \"://\" <host> [ \":\" <port> ]`, such as `https://auth.your-domain.com` or `http://localhost:3000`.\n","items":{"example":"http://localhost:8092","type":"string"},"type":"array"},"type":{"enum":["hosted_web"],"type":"string"}}}]}}}},"required":["authenticator_config"]}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["authenticator-configs:create"]}]
  }],
  ["GetAuthenticatorConfig", {
    name: "GetAuthenticatorConfig",
    description: `To retrieve an existing authenticator configuration, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs/$AUTHENTICATOR_CONFIG_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"authenticator_config_id":{"type":"string","description":"A unique identifier for an authenticator configuration."}},"required":["tenant_id","realm_id","authenticator_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"authenticator_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["authenticator-configs:read"]}]
  }],
  ["DeleteAuthenticatorConfig", {
    name: "DeleteAuthenticatorConfig",
    description: `To delete an authenticator configuration, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs/$AUTHENTICATOR_CONFIG_ID\`.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"authenticator_config_id":{"type":"string","description":"A unique identifier for an authenticator configuration."}},"required":["tenant_id","realm_id","authenticator_config_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"authenticator_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["authenticator-configs:delete"]}]
  }],
  ["UpdateAuthenticatorConfig", {
    name: "UpdateAuthenticatorConfig",
    description: `To update only specific attributes of an existing authenticator configuration, send a PATCH request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/authenticator-configs/$AUTHENTICATOR_CONFIG_ID\`. Values in the request body for immutable or read-only fields will be ignored. Fields that are omitted from the request body will be left unchanged.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"authenticator_config_id":{"type":"string","description":"A unique identifier for an authenticator configuration."},"requestBody":{"title":"Update Authenticator Configuration Request","description":"Request for UpdateAuthenticatorConfig.","type":"object","properties":{"authenticator_config":{"title":"Authenticator Configuration","type":"object","description":"Representation of an authenticator configuration. This prescribes how an identity may authenticate themselves with Beyond Identity.\n","properties":{"id":{"type":"string","description":"A unique identifier for an authenticator configuration. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the authenticator configuration's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the authenticator configuration's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"A human-readable name for the authenticator configuration. This name is used for display purposes.\n"},"config":{"description":"An object specifying the settings for the supported authenticator type.\n","oneOf":[{"title":"Embedded SDK Authenticator","description":"Configuration options for the embedded SDK authenticator.","type":"object","required":["type","invoke_url","trusted_origins"],"properties":{"invocation_type":{"default":"automatic","description":"The method used to invoke the `invoke_url` in the embedded authenticator\nconfig type. The two methods available are:\n\nThe value `automatic` indicates that this invocation type automatically\nredirects you to your native or web app using the Invoke URL with a\nchallenge that your app will need to sign.\n\nThe value `manual` indicates that this invocation type will cause the\nchallenge to be returned to you as part of a JSON response. It will then\nbe up to you to get it to your native/web app any way you see fit. This is\nuseful for flows where you require a lot more control when redirecting to\nyour native/web app. Since the challenge is packaged as part of a URL,\nfollowing the URL will result in the same behavior as if an Invocation\nType of \"automatic\" were selected.\n","enum":["automatic","manual"],"type":"string"},"invoke_url":{"description":"URL to invoke during the authentication flow.","example":"http://localhost:8092","type":"string"},"trusted_origins":{"description":"Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> \"://\" <host> [ \":\" <port> ]`, such as `https://auth.your-domain.com` or `http://localhost:3000`.\n","items":{"example":"http://localhost:8092","type":"string"},"type":"array"},"type":{"enum":["embedded"],"type":"string"},"authentication_methods":{"items":{"properties":{"type":{"description":"Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your device's trusted execution environment (TEE). If webauthn\npasskeys are not supported in the browser, specifying one of the other two\nauthentication methods will result in a fallback to that mechanism.\n\nThe value `software_passkey` activates a workflow where a passkey is\nsecurely created within the browser's context.\n\nThe value `email_one_time_password` enables a workflow that verifies\nidentity via an email of a one-time password.\n","enum":["email_one_time_password","software_passkey","webauthn_passkey"],"type":"string"}},"required":["type"],"title":"AuthenticationMethod","type":"object"},"type":"array"}}},{"title":"Hosted Web Authenticator","description":"Configuration options for the hosted web experience. This authenticator is maintained by Beyond Identity and allows the caller to customize authentication methods.\n","type":"object","required":["type","authentication_methods","trusted_origins"],"properties":{"authentication_methods":{"items":{"properties":{"type":{"description":"Within our hosted web product, an array of values determines the\nclient-side authentication workflows:\n\nThe value `webauthn_passkey` triggers a workflow that generates a hardware\nkey within your device's trusted execution environment (TEE). If webauthn\npasskeys are not supported in the browser, specifying one of the other two\nauthentication methods will result in a fallback to that mechanism.\n\nThe value `software_passkey` activates a workflow where a passkey is\nsecurely created within the browser's context.\n\nThe value `email_one_time_password` enables a workflow that verifies\nidentity via an email of a one-time password.\n","enum":["email_one_time_password","software_passkey","webauthn_passkey"],"type":"string"}},"required":["type"],"title":"AuthenticationMethod","type":"object"},"type":"array"},"trusted_origins":{"description":"Trusted origins are URLs that will be allowed to make requests from a browser to the Beyond Identity API. This is used with Cross-Origin Resource Sharing (CORS). These may be in the form of `<scheme> \"://\" <host> [ \":\" <port> ]`, such as `https://auth.your-domain.com` or `http://localhost:3000`.\n","items":{"example":"http://localhost:8092","type":"string"},"type":"array"},"type":{"enum":["hosted_web"],"type":"string"}}}]}}}},"required":["authenticator_config"]}},"required":["tenant_id","realm_id","authenticator_config_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/authenticator-configs/{authenticator_config_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"authenticator_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["authenticator-configs:update"]}]
  }],
  ["ListResourceServers", {
    name: "ListResourceServers",
    description: `To list all resource servers for a realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers\`.

The response will contain at most 100 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 100 items. There is no defined ordering of the list of resource
servers in the response.  Note that the maximum and default page sizes are
subject to change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests. The skip is not maintained by the page
token and must be specified on each subsequent request.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["resource-servers:read"]}]
  }],
  ["CreateResourceServer", {
    name: "CreateResourceServer",
    description: `To create a resource server, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"title":"Create Resource Server Request","description":"Request for CreateResourceServer.","type":"object","properties":{"resource_server":{"title":"Resource Server","type":"object","description":"A resource server represents an API server that hosts a set of protected resources and is capable of accepting and responding to protected resource requests using access tokens. Clients can enable these APIs to be consumed from authorized applications.\n","properties":{"id":{"type":"string","description":"A unique identifier for a resource server. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the resource server's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the resource server's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"A human-readable name for the resource server. This name is used for display purposes.\n"},"is_managed":{"type":"boolean","description":"A boolean indicating whether the resource server is managed by Beyond Identity. Managed resource servers may not be modified by the user. This is automatically set on creation. This field is immutable and read-only.\n"},"identifier":{"type":"string","description":"The identifier of this resource server entity. This value should be unique per realm and is often presented as a URI, as it should be a unique identifier for an API to which access is being gated. This identifier will be returned in the `audience` claim of all tokens minted that provide access to scopes owned by this resource server. The client is responsible for validating tokens are intended for them via this `audience` claim. Tokens minted for the Beyond Identity Management API will use the audience `beyondidentity`, which is reserved and may not be used for any other resource servers.\n"},"scopes":{"type":"array","items":{"type":"string"},"description":"The list of scopes supported by this resource server. For the Beyond Identity Management API, this will include scopes for all publicly available endpoints.  Note that applications may not provide access to scopes that are not defined on a resource server that they reference; this is the superset of all allowable application scopes in a given realm.\n"}}}},"required":["resource_server"]}},"required":["tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["resource-servers:create"]}]
  }],
  ["GetResourceServer", {
    name: "GetResourceServer",
    description: `To retrieve an existing resource server, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID\`.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."}},"required":["tenant_id","realm_id","resource_server_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["resource-servers:read"]}]
  }],
  ["DeleteResourceServer", {
    name: "DeleteResourceServer",
    description: `To delete a resource server, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID\`.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."}},"required":["tenant_id","realm_id","resource_server_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["resource-servers:delete"]}]
  }],
  ["UpdateResourceServer", {
    name: "UpdateResourceServer",
    description: `To update only specific attributes of an existing resource server, send a a
PATCH request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/resource-servers/$RESOURCE_SERVER_ID\`.
Values in the request body for immutable or read-only fields will be
ignored. Fields that are omitted from the request body will be left
unchanged.

Scopes that are removed from a resource server will be asynchronously
removed from all roles associated with the resource server.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"resource_server_id":{"type":"string","description":"A unique identifier for a resource server."},"requestBody":{"title":"Update Resource Server Request","description":"Request for UpdateResourceServer.","type":"object","properties":{"resource_server":{"title":"Resource Server","type":"object","description":"A resource server represents an API server that hosts a set of protected resources and is capable of accepting and responding to protected resource requests using access tokens. Clients can enable these APIs to be consumed from authorized applications.\n","properties":{"id":{"type":"string","description":"A unique identifier for a resource server. This is automatically generated on creation. This field is immutable and read-only. This field is unique within the realm.\n"},"realm_id":{"type":"string","description":"A unique identifier for the resource server's realm. This is automatically set on creation. This field is immutable and read-only.\n"},"tenant_id":{"type":"string","description":"A unique identifier for the resource server's tenant. This is automatically set on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"A human-readable name for the resource server. This name is used for display purposes.\n"},"is_managed":{"type":"boolean","description":"A boolean indicating whether the resource server is managed by Beyond Identity. Managed resource servers may not be modified by the user. This is automatically set on creation. This field is immutable and read-only.\n"},"identifier":{"type":"string","description":"The identifier of this resource server entity. This value should be unique per realm and is often presented as a URI, as it should be a unique identifier for an API to which access is being gated. This identifier will be returned in the `audience` claim of all tokens minted that provide access to scopes owned by this resource server. The client is responsible for validating tokens are intended for them via this `audience` claim. Tokens minted for the Beyond Identity Management API will use the audience `beyondidentity`, which is reserved and may not be used for any other resource servers.\n"},"scopes":{"type":"array","items":{"type":"string"},"description":"The list of scopes supported by this resource server. For the Beyond Identity Management API, this will include scopes for all publicly available endpoints.  Note that applications may not provide access to scopes that are not defined on a resource server that they reference; this is the superset of all allowable application scopes in a given realm.\n"}}}},"required":["resource_server"]}},"required":["tenant_id","realm_id","resource_server_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/resource-servers/{resource_server_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"resource_server_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["resource-servers:update"]}]
  }],
  ["ListTokens", {
    name: "ListTokens",
    description: `To list all tokens issued by an application, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications/$APPLICATION_ID/tokens\`.
The \`$APPLICATION_ID\` in path corresponds to the application that is the issuer of the token.
To filter the list of tokens by a principal, set \`principal_type\` and \`principal_id\`. These parameters are optional.
The response will contain at most 100 items and may contain a page token to query the remaining items. If page size is not specified, the response will contain 100 items. There is no defined ordering of the list of tokens in the response.  Note that the maximum and default page sizes are subject to change.
When paginating, the page size is maintained by the page token but may be overridden on subsequent requests. The skip is not maintained by the page token and must be specified on each subsequent request.
Page tokens expire after one week. Requests which specify an expired page token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."},"principal_type":{"type":"string","description":"Type of the principal. Allowable values are:\n  - `application`\n  - `identity`\n"},"principal_id":{"type":"string","description":"A unique identifier for a principal. This might be an application ID or an identity ID depending on the type of principal."}},"required":["tenant_id","realm_id","application_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/tokens",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"},{"name":"principal_type","in":"query"},{"name":"principal_id","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["tokens:read"]}]
  }],
  ["RevokeToken", {
    name: "RevokeToken",
    description: `To revoke a token, send a DELETE request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/applications/$APPLICATION_ID/tokens/$TOKEN_ID\`.
The \`$APPLICATION_ID\` in path corresponds to the application that is the issuer of the token.
A successful request will receive a 200 status code with no body in the response. This indicates that the request was processed successfully.
If the token ID is not available, the access token must be revoked via the [RFC-7009 revoke endpoint](https://developer.beyondidentity.com/docs/revoke-access-tokens).
`,
    inputSchema: {"type":"object","properties":{"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."},"token_id":{"type":"string","description":"A unique identifier for a token. For JWS tokens, this corresponds to the value of the `jti` token claim."}},"required":["tenant_id","realm_id","application_id","token_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/tokens/{token_id}",
    executionParameters: [{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"},{"name":"token_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["tokens:delete"]}]
  }],
  ["SCIMListUsers", {
    name: "SCIMListUsers",
    description: `To list all users, send a GET request to \`/Users\`.

Currently, filtering on users only supports the \`eq\` and \`ne\` operators and
the \`userName\` and \`externalId\` attributes.

The response will contain at most 1000 items. If count is not specified or
is zero, the response will not contain any resources. There is no defined
ordering of the list of users in the response. Note that the maximum page
size is subject to change.
`,
    inputSchema: {"type":"object","properties":{"filter":{"type":"string","description":"Filter for list methods.\n\nFilters follow the SCIM grammar from\n[RFC 7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n"},"count":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Specifies the desired maximum number of query results per page. A negative value is treated as 0, which indicates that the response should not contain any resources. Note that the response may include fewer results than the requested count.\n"},"startIndex":{"type":"number","format":"uint32","minimum":1,"default":1,"description":"The 1-based index of the first query result."}}},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users",
    executionParameters: [{"name":"filter","in":"query"},{"name":"count","in":"query"},{"name":"startIndex","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:users:read"]}]
  }],
  ["SCIMCreateUser", {
    name: "SCIMCreateUser",
    description: `To create a user, send a POST request to \`/Users\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"requestBody":{"title":"Create User Request","description":"Request for CreateUser.","type":"object","properties":{"user":{"title":"User","description":"A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n","type":"object","properties":{"schemas":{"type":"array","description":"The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n","items":{"type":"string"}},"id":{"type":"string","description":"The unique ID of the user. This is automatically generated on creation. This field is immutable and output-only.\n","minLength":1},"externalId":{"type":"string","description":"The provisioning client's unique identifier for the resource."},"userName":{"type":"string","minLength":1,"description":"The unique username of the user.\n"},"displayName":{"type":"string","minLength":1,"description":"Display name of the User. This name is used for display purposes.\n"},"active":{"type":"boolean","description":"Indicator for the user's administrative status. If true, the user has administrative capabilities.\n"},"emails":{"type":"array","description":"The list containing the user's emails.","items":{"type":"object","description":"Definition of an email.","properties":{"primary":{"type":"boolean","description":"Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n"},"value":{"type":"string","description":"The email address."}}}},"name":{"type":"object","description":"Definition of the user's name.","properties":{"givenName":{"type":"string","description":"The given name of the user, or first name in most Western languages.\n"},"familyName":{"type":"string","description":"The family name of the user, or last name in most Western languages.\n"}}},"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User":{"title":"EnterpriseUserExtension","description":"Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User\".\n","type":"object","properties":{"employeeNumber":{"type":"string","description":"A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"costCenter":{"type":"string","description":"Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"organization":{"type":"string","description":"Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"department":{"type":"string","description":"Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"division":{"type":"string","description":"Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"manager":{"type":"object","properties":{"value":{"type":"string","description":"The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"displayName":{"type":"string","description":"The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"}}}}},"meta":{"title":"Meta","description":"Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n","type":"object","properties":{"resourceType":{"type":"string","description":"The name of the resource type of the resource."},"created":{"type":"string","format":"date-time","description":"Timestamp of when the resource was created."},"lastModified":{"type":"string","format":"date-time","description":"Timestamp of when the resource was last updated."},"location":{"type":"string","description":"The URI of the resource being returned."},"version":{"type":"string","description":"The version of the resource being returned. This is always \"W/0\".\n"}},"required":["resourceType","created","lastModified","location","version"]}},"required":["schemas"]}},"required":["user"]}}},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["scim:users:create"]}]
  }],
  ["SCIMGetUser", {
    name: "SCIMGetUser",
    description: `To retrieve an existing user, send a GET request to \`/Users/$USER_ID\`.
`,
    inputSchema: {"type":"object","properties":{"user_id":{"type":"string","minLength":1,"description":"ID of the user. This corresponds to the identity ID."}},"required":["user_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
    executionParameters: [{"name":"user_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:users:read"]}]
  }],
  ["SCIMReplaceUser", {
    name: "SCIMReplaceUser",
    description: `To replace all attributes of an existing user, send a PUT request to \`/Users/$USER_ID\`. Values in the request body for immutable or read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"user_id":{"type":"string","minLength":1,"description":"ID of the user. This corresponds to the identity ID."},"requestBody":{"title":"Update User Request","description":"Request for UpdateUser.","type":"object","properties":{"user":{"title":"User","description":"A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n","type":"object","properties":{"schemas":{"type":"array","description":"The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n","items":{"type":"string"}},"id":{"type":"string","description":"The unique ID of the user. This is automatically generated on creation. This field is immutable and output-only.\n","minLength":1},"externalId":{"type":"string","description":"The provisioning client's unique identifier for the resource."},"userName":{"type":"string","minLength":1,"description":"The unique username of the user.\n"},"displayName":{"type":"string","minLength":1,"description":"Display name of the User. This name is used for display purposes.\n"},"active":{"type":"boolean","description":"Indicator for the user's administrative status. If true, the user has administrative capabilities.\n"},"emails":{"type":"array","description":"The list containing the user's emails.","items":{"type":"object","description":"Definition of an email.","properties":{"primary":{"type":"boolean","description":"Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n"},"value":{"type":"string","description":"The email address."}}}},"name":{"type":"object","description":"Definition of the user's name.","properties":{"givenName":{"type":"string","description":"The given name of the user, or first name in most Western languages.\n"},"familyName":{"type":"string","description":"The family name of the user, or last name in most Western languages.\n"}}},"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User":{"title":"EnterpriseUserExtension","description":"Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User\".\n","type":"object","properties":{"employeeNumber":{"type":"string","description":"A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"costCenter":{"type":"string","description":"Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"organization":{"type":"string","description":"Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"department":{"type":"string","description":"Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"division":{"type":"string","description":"Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"manager":{"type":"object","properties":{"value":{"type":"string","description":"The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"displayName":{"type":"string","description":"The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"}}}}},"meta":{"title":"Meta","description":"Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n","type":"object","properties":{"resourceType":{"type":"string","description":"The name of the resource type of the resource."},"created":{"type":"string","format":"date-time","description":"Timestamp of when the resource was created."},"lastModified":{"type":"string","format":"date-time","description":"Timestamp of when the resource was last updated."},"location":{"type":"string","description":"The URI of the resource being returned."},"version":{"type":"string","description":"The version of the resource being returned. This is always \"W/0\".\n"}},"required":["resourceType","created","lastModified","location","version"]}},"required":["schemas"]}},"required":["user"]}},"required":["user_id"]},
    method: "put",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
    executionParameters: [{"name":"user_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["scim:users:update"]}]
  }],
  ["SCIMDeleteUser", {
    name: "SCIMDeleteUser",
    description: `To delete a user, send a DELETE request to \`/Users/$USER_ID\`.`,
    inputSchema: {"type":"object","properties":{"user_id":{"type":"string","minLength":1,"description":"ID of the user. This corresponds to the identity ID."}},"required":["user_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
    executionParameters: [{"name":"user_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:users:delete"]}]
  }],
  ["SCIMUpdateUser", {
    name: "SCIMUpdateUser",
    description: `To update only specific attributes of an existing user, send a PATCH
request to \`/Users/$USER_ID\`. Values in the request body for immutable or
read-only fields will be ignored. Fields that are omitted from the request
body will be left unchanged.

Note that the Beyond Identity SCIM server currently does not support atomic
PATCH operations. If a request contains multiple operations, the request
may be partially applied.

Currently, only "add" and "replace" operations are supported for users.
`,
    inputSchema: {"type":"object","properties":{"user_id":{"type":"string","minLength":1,"description":"ID of the user. This corresponds to the identity ID."},"requestBody":{"title":"Update User Request","description":"Request for UpdateUser.","type":"object","properties":{"user":{"title":"User","description":"A user represents a human entity as defined by [RFC 7643 Section 4.1](https://www.rfc-editor.org/rfc/rfc7643#section-4.1). A user cooresponds to the identity resource in Beyond Identity.\n","type":"object","properties":{"schemas":{"type":"array","description":"The list of schemas used to define the user. This must contain only the core User schema (\"urn:ietf:params:scim:schemas:core:2.0:User\").\n","items":{"type":"string"}},"id":{"type":"string","description":"The unique ID of the user. This is automatically generated on creation. This field is immutable and output-only.\n","minLength":1},"externalId":{"type":"string","description":"The provisioning client's unique identifier for the resource."},"userName":{"type":"string","minLength":1,"description":"The unique username of the user.\n"},"displayName":{"type":"string","minLength":1,"description":"Display name of the User. This name is used for display purposes.\n"},"active":{"type":"boolean","description":"Indicator for the user's administrative status. If true, the user has administrative capabilities.\n"},"emails":{"type":"array","description":"The list containing the user's emails.","items":{"type":"object","description":"Definition of an email.","properties":{"primary":{"type":"boolean","description":"Indicator for the primary or preferred email address.\n\nOnly the primary email address is included on the response. All\nother provided email addresses will be ignored.\n"},"value":{"type":"string","description":"The email address."}}}},"name":{"type":"object","description":"Definition of the user's name.","properties":{"givenName":{"type":"string","description":"The given name of the user, or first name in most Western languages.\n"},"familyName":{"type":"string","description":"The family name of the user, or last name in most Western languages.\n"}}},"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User":{"title":"EnterpriseUserExtension","description":"Defines attributes commonly used in representing users that belong to, or act on behalf of, a business or enterprise. The enterprise User extension is identified using the following schema URI: \"urn:ietf:params:scim:schemas:extension:enterprise:2.0:User\".\n","type":"object","properties":{"employeeNumber":{"type":"string","description":"A string identifier, typically numeric or alphanumeric, assigned to a person, typically based on order of hire or association with an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"costCenter":{"type":"string","description":"Identifies the name of a cost center as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"organization":{"type":"string","description":"Identifies the name of an organization as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"department":{"type":"string","description":"Identifies the name of a department as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"division":{"type":"string","description":"Identifies the name of a division as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"manager":{"type":"object","properties":{"value":{"type":"string","description":"The \"id\" of the SCIM resource representing the user's manager as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"},"displayName":{"type":"string","description":"The displayName of the user's manager. This attribute is OPTIONAL, and mutability is \"readOnly\" as defined in [RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643#section-4.3).\n"}}}}},"meta":{"title":"Meta","description":"Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n","type":"object","properties":{"resourceType":{"type":"string","description":"The name of the resource type of the resource."},"created":{"type":"string","format":"date-time","description":"Timestamp of when the resource was created."},"lastModified":{"type":"string","format":"date-time","description":"Timestamp of when the resource was last updated."},"location":{"type":"string","description":"The URI of the resource being returned."},"version":{"type":"string","description":"The version of the resource being returned. This is always \"W/0\".\n"}},"required":["resourceType","created","lastModified","location","version"]}},"required":["schemas"]}},"required":["user"]}},"required":["user_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Users/{user_id}",
    executionParameters: [{"name":"user_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["scim:users:update"]}]
  }],
  ["SCIMListGroups", {
    name: "SCIMListGroups",
    description: `To list all groups, send a GET request to \`/Groups\`.

Currently, filtering on groups only supports the \`eq\` and \`ne\` operators
and the \`displayName\` attribute.

The response will contain at most 1000 items. If count is not specified or
is zero, the response will not contain any resources. There is no defined
ordering of the list of groups in the response. Note that the maximum page
size is subject to change.

Members will not be returned with the group.
`,
    inputSchema: {"type":"object","properties":{"filter":{"type":"string","description":"Filter for list methods.\n\nFilters follow the SCIM grammar from\n[RFC 7644 Section 3.4.2.2](https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2.2).\n"},"count":{"type":"number","format":"uint32","minimum":0,"default":0,"description":"Specifies the desired maximum number of query results per page. A negative value is treated as 0, which indicates that the response should not contain any resources. Note that the response may include fewer results than the requested count.\n"},"startIndex":{"type":"number","format":"uint32","minimum":1,"default":1,"description":"The 1-based index of the first query result."}}},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/",
    executionParameters: [{"name":"filter","in":"query"},{"name":"count","in":"query"},{"name":"startIndex","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:groups:read"]}]
  }],
  ["SCIMCreateGroup", {
    name: "SCIMCreateGroup",
    description: `To create a group, send a POST request to \`/Groups\`. Values in the request body for read-only fields will be ignored.
`,
    inputSchema: {"type":"object","properties":{"requestBody":{"title":"Create Group Request","description":"Request for CreateGroup.","type":"object","properties":{"group":{"title":"Group","description":"A group is a collection of users corresponding to [RFC 7643 Section 4.2](https://www.rfc-editor.org/rfc/rfc7643#section-4.2).\n","type":"object","properties":{"schemas":{"type":"array","description":"The list of schemas used to define the group. This must contain the core Group schema (\"urn:ietf:params:scim:schemas:core:2.0:Group\") and may include the custom Beyond Identity Group schema extension (\"urn:scim:schemas:extension:byndid:1.0:Group\").\n","items":{"type":"string"}},"id":{"type":"string","description":"The unique ID of the group. This is automatically generated on creation. This field is immutable and output-only.\n","minLength":1},"displayName":{"type":"string","minLength":1,"description":"The unique display name of the group. This name is used for display purposes.\n"},"meta":{"title":"Meta","description":"Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n","type":"object","properties":{"resourceType":{"type":"string","description":"The name of the resource type of the resource."},"created":{"type":"string","format":"date-time","description":"Timestamp of when the resource was created."},"lastModified":{"type":"string","format":"date-time","description":"Timestamp of when the resource was last updated."},"location":{"type":"string","description":"The URI of the resource being returned."},"version":{"type":"string","description":"The version of the resource being returned. This is always \"W/0\".\n"}},"required":["resourceType","created","lastModified","location","version"]}},"required":["schemas"]}},"required":["group"]}}},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["scim:groups:create"]}]
  }],
  ["SCIMGetGroup", {
    name: "SCIMGetGroup",
    description: `To retrieve an existing group, send a GET request to \`/Groups/$GROUP_ID\`.
`,
    inputSchema: {"type":"object","properties":{"group_id":{"type":"string","minLength":1,"description":"ID of the group."}},"required":["group_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}",
    executionParameters: [{"name":"group_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:groups:read"]}]
  }],
  ["SCIMDeleteGroup", {
    name: "SCIMDeleteGroup",
    description: `To delete a group, send a DELETE request to \`/Groups/$GROUP_ID\`.
`,
    inputSchema: {"type":"object","properties":{"group_id":{"type":"string","minLength":1,"description":"ID of the group."}},"required":["group_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}",
    executionParameters: [{"name":"group_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["scim:groups:delete"]}]
  }],
  ["SCIMUpdateGroup", {
    name: "SCIMUpdateGroup",
    description: `To update only specific attributes of an existing group, send a PATCH
request to \`/Groups/$GROUP_ID\`. Values in the request body for immutable or
read-only fields will be ignored. Fields that are omitted from the request
body will be left unchanged.

Note that the Beyond Identity SCIM server currently does not support atomic
PATCH operations. If a request contains multiple operations, the request
may be partially applied.

The Beyond Identity SCIM server also does not support modifying both a
group and its membership in the same operation. For example, a PATCH
request to update a group's display name and its membership should specify
two separate operations, one to update the display name and the other to
modify the membership.

Currently, "replace" operations are supported for displayName while "add"
and "remove" operations are supported for members. Multiple members may be
added at a time, but batch remove is not supported. Note that while member
changes will take affect, they will not be reflected in the response
as members are not currently returned with groups.
`,
    inputSchema: {"type":"object","properties":{"group_id":{"type":"string","minLength":1,"description":"ID of the group."},"requestBody":{"title":"Update Group Request","description":"Request for UpdateGroup.","type":"object","properties":{"group":{"title":"Group","description":"A group is a collection of users corresponding to [RFC 7643 Section 4.2](https://www.rfc-editor.org/rfc/rfc7643#section-4.2).\n","type":"object","properties":{"schemas":{"type":"array","description":"The list of schemas used to define the group. This must contain the core Group schema (\"urn:ietf:params:scim:schemas:core:2.0:Group\") and may include the custom Beyond Identity Group schema extension (\"urn:scim:schemas:extension:byndid:1.0:Group\").\n","items":{"type":"string"}},"id":{"type":"string","description":"The unique ID of the group. This is automatically generated on creation. This field is immutable and output-only.\n","minLength":1},"displayName":{"type":"string","minLength":1,"description":"The unique display name of the group. This name is used for display purposes.\n"},"meta":{"title":"Meta","description":"Resource metadata as defined in [RFC 7643 Section 3.1](https://www.rfc-editor.org/rfc/rfc7643#section-3.1). This attribute is only populated on responses and is ignored on requests.\n","type":"object","properties":{"resourceType":{"type":"string","description":"The name of the resource type of the resource."},"created":{"type":"string","format":"date-time","description":"Timestamp of when the resource was created."},"lastModified":{"type":"string","format":"date-time","description":"Timestamp of when the resource was last updated."},"location":{"type":"string","description":"The URI of the resource being returned."},"version":{"type":"string","description":"The version of the resource being returned. This is always \"W/0\".\n"}},"required":["resourceType","created","lastModified","location","version"]}},"required":["schemas"]}},"required":["group"]}},"required":["group_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Groups/{group_id}",
    executionParameters: [{"name":"group_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["scim:groups:update"]}]
  }],
  ["ListResourceTypes", {
    name: "ListResourceTypes",
    description: `To list all supported resource types, send a GET request to
\`/ResourceTypes\`.
`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/ResourceTypes",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["ListSchemas", {
    name: "ListSchemas",
    description: `To list all supported resource schemas, send a GET request to \`/Schemas\`.
`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/Schemas",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["GetServiceProviderConfig", {
    name: "GetServiceProviderConfig",
    description: `To retrieve the service provider configuration, send a GET request to \`/ServiceProviderConfig\`.
`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/scim/v2/ServiceProviderConfig",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["listSsoConfigs", {
    name: "listSsoConfigs",
    description: `To list SSO Configs for a Realm, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/sso-configs\`.

The response will contain at most 200 items and may contain a page token to
query the remaining items. If page size is not specified, the response will
contain 20 items. There is no defined ordering of the list of identities in
the response. Note that the maximum and default page sizes are subject to
change.

When paginating, the page size is maintained by the page token but may be
overridden on subsequent requests.

Page tokens expire after one week. Requests which specify an expired page
token will result in undefined behavior.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"type":{"type":"array","items":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"description":"The type of sso config to filter by. You may query with multiple types for example \"/sso-configs?type=generic_oidc&type=generic_oid_idp\""},"is_migrated":{"type":"boolean"},"order_by":{"type":"string"}},"required":["x-correlation_id","tenant_id","realm_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"type","in":"query"},{"name":"is_migrated","in":"query"},{"name":"order_by","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["CreateSsoConfig", {
    name: "CreateSsoConfig",
    description: `To create a new SSO Config, send a POST request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/sso-configs\`.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"description":"Represents an SSO config as a request body.","type":"object","required":["sso_config"],"properties":{"sso_config":{"description":"Represents an SSO config as a request body.","type":"object","required":["display_name","payload"],"properties":{"is_migrated":{"description":"Indicates that the SSO Config was added by a script such as fast migrate","type":"boolean"},"display_name":{"description":"A human-readable name for the application. This name is used for display purposes.","type":"string"},"payload":{"oneOf":[{"type":"object","required":["type","login_link"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"login_link":{"type":"string"},"icon":{"type":"string"},"is_tile_visible":{"type":"boolean"}}},{"type":"object","required":["type","redirect_uris","discover_endpoint"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"redirect_uris":{"default":null,"type":"array","items":{"type":"string"}},"inbound_scim":{"default":null,"type":"object"},"discover_endpoint":{"description":"Describes the type of discovery endpoint for the entra_id_external_auth_methods sso config.\n","type":"string","enum":["global_azure","azure_us_government","microsoft_azure_vianet"]}}},{"type":"object","required":["type","redirect_uris","scopes","confidentiality","pkce"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"redirect_uris":{"default":null,"type":"array","items":{"type":"string"}},"scopes":{"default":null,"type":"array","items":{"type":"string"}},"trusted_origins":{"default":null,"type":"array","items":{"type":"string"}},"login_link":{"type":"string"},"icon":{"type":"string"},"is_tile_visible":{"type":"boolean"},"confidentiality":{"default":null,"allOf":[{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"}]},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type","client_id","identifying_claim_name","identity_attribute","authorization_endpoint","token_endpoint","jwks_endpoint"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"client_id":{"description":"The client ID for the idp application.","type":"string"},"identifying_claim_name":{"type":"string"},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"authorization_endpoint":{"type":"string","nullable":true},"token_endpoint":{"type":"string"},"jwks_endpoint":{"type":"string"}}},{"type":"object","required":["type","acs_url","override_recipient_and_destination","audience_url","default_relay_state","name_format","authentication_context","subject_user_name_attribute","sign_envelope","sign_assertions","signature_algorithm","digest_algorithm","encrypt_assertions","assertion_validity_duration_seconds","sp_signature_certificates","enable_single_log_out","validate_signed_requests","additional_user_attributes","single_logout_sign_request_and_response"],"properties":{"type":{"type":"string","enum":["saml"]},"acs_url":{"description":"Location where the SAML Response is sent via HTTP-POST. Often referred to as the SAML Assertion Consumer Service (ACS) URL.\n","type":"string","example":"https://example.com/saml/acs"},"override_recipient_and_destination":{"description":"When this is true, the `recipient_url` and the `destination_url` are used for SAML Response.\nWhen this is false, both the `recipient_url` and the `destination_url` are omitted and the `acs_url` is used instead.\n","type":"boolean","example":true},"recipient_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nThe location where the application may present the SAML assertion. This is usually the same location as the Single Sign-On URL.\n","type":"string","example":"https://example.com/saml/recipient"},"destination_url":{"description":"If `override_recipient_and_destination` is set to `true`, this field is utilized for the SAML Response. If it is `false`, this field is unused.\nIdentifies the location where the SAML response is intended to be sent inside of the SAML assertion.\n","type":"string","example":"https://example.com/saml/destination"},"audience_url":{"description":"The intended audience of the SAML assertion. Often referred to as the service provider Entity ID.\n","type":"string","example":"https://example.com/saml/audience"},"default_relay_state":{"description":"Identifies a specific application resource in an IDP initiated Single Sign-On scenario. In most instances this is blank.\n","type":"string","example":"defaultRelayState"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"subject_user_name_attribute":{"description":"Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"sign_envelope":{"description":"Determines whether the SAML authentication response message is digitally signed by the IdP or not. A digital signature is required to ensure that only your IdP generated the response message.\n","type":"boolean","example":true},"sign_assertions":{"description":"All of the assertions should be signed by the IdP.","type":"boolean","example":true},"signature_algorithm":{"description":"The algorithm used for signing the SAML assertions.\n","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"digest_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.\n","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"encrypt_assertions":{"description":"This is the flag that determines if the SAML assertion is encrypted. If this flag is set to `true`, there **MUST** be a SAML encryption certificate uploaded.\nEncryption ensures that nobody but the sender and receiver can understand the assertion.\n","type":"boolean","example":false},"assertion_validity_duration_seconds":{"description":"The amount of time SAML assertions are valid for in seconds.\n","type":"integer","format":"int32","example":300},"assertion_encryption_algorithm":{"description":"The algorithm used for the digest in SAML assertions.\n","type":"string","enum":["aes256_cbc","aes256_gcm","aes128_cbc","aes128_gcm"],"example":"aes256_cbc"},"assertion_key_transport_algorithm":{"description":"The algorithm used for key transport in SAML assertions.\n","type":"string","enum":["rsa_oaep","rsa1_5"],"example":"rsa_oaep"},"assertion_encryption_public_key":{"description":"The public key used to encrypt the SAML assertion. This is required if `encrypt_assertions` is true.\n","type":"string","example":"-----BEGIN PUBLIC KEY-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END PUBLIC KEY-----\n"},"sp_signature_certificates":{"description":"The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n","type":"array","items":{"type":"object","required":["sp_public_signing_key"],"properties":{"sp_public_signing_key":{"type":"string"}}},"example":["-----BEGIN CERTIFICATE-----\n\nMIIDdzCCAl+gAwIBAgIEbF2LTTANBgkqhkiG9w0BAQsFADBoMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCQ0ExFTATBgNVBAcTDFNhbiBGcmFuY2lzY28xEjAQBgNVBAoT\nCU9rdGEsIEluYy4xHzAdBgNVBAMTFm9rdGEuZXhhbXBsZS5jb20gQ0EgUm9vdDAe\nFw0yMDA2MTkwMDAwMDBaFw0yMTA2MTkyMzU5NTlaMG0xCzAJBgNVBAYTAlVTMQsw\nCQYDVQQIEwJDQTEVMBMGA1UEBxMMU2FuIEZyYW5jaXNjbzESMBAGA1UEChMJb2t0\nPbg6vGfJnxYYibTwLlXhgxl0tT+NMQFZ5GQslLh2sB3AWBzjZtFzFS7lDi0n4Fz5\ny9x6U1hUS54fScJmSVSTT9v/qAD0ccjvlPj3M6PENq2X7TwrOqSTgx5TPOpA5Myl\nMtwPbU3wn/pA5Cp9kWvlYbBfTS4Hx14FQyg3GAAkMrzrhKhpIfhz6iH0H8kDxFId\n6KjXy4TvoUM/tH7c6v2HS6D4TD7TfYOv/8A7E1Lj6WKwjtghTAh3Rb5tbyxRBcw\ngg==\n-----END CERTIFICATE-----\n"]},"enable_single_log_out":{"description":"Enables single logout. Single Logout (SLO) is a feature that allows users to be logged out from multiple service providers (SPs) and the identity provider (IdP) with a single logout action.\n","type":"boolean","example":false},"single_log_out_url":{"description":"The location where the single logout response will be sent.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/logout"},"single_log_out_issuer_url":{"description":"The issuer ID for the service provider when handling a Single Logout.\nThis is only enabled if `enable_single_log_out` is true.\n","type":"string","example":"https://example.com/saml/issuer"},"single_log_out_binding":{"description":"The SAML binding used for SAML messages.\n","type":"string","enum":["post","redirect"],"example":"post"},"single_logout_sign_request_and_response":{"description":"If enabled, Single Logout requests must bbe signed and Single Logout responses will also be signed.\n","type":"boolean","example":false},"validate_signed_requests":{"description":"Select this to validate all SAML requests using the SP Signature Certificate.\n","type":"boolean","example":true},"other_sso_urls":{"type":"object","description":"For use with SP-initiated sign-in flows. Enter the ACS URLs for any other requestable SSO nodes used by your app integration. This option enables applications to choose where to send the SAML Response. Specify a URL and an index that uniquely identifies each ACS URL endpoint.\nSome SAML AuthnRequest messages don't specify an index or URL. In these cases, the SAML Response is sent to the ACS specified in the Single sign on URL field.\nWhen you enable Signed Requests, Beyond Identity deletes any previously defined static SSO URLs and reads the SSO URLs from the signed SAML request instead. You can't have both static SSO URLs and dynamic SSO URLs.\nThis can only be set if `validate_signed_requests` is set to false.\n","required":["index","url"],"properties":{"index":{"description":"The index that this URL may be referenced by.","type":"integer","format":"int16","example":1},"url":{"description":"This is a URL that may be used to replace the ACS URL.\n","type":"string","example":"https://example.com/saml/acs1"}}},"additional_user_attributes":{"description":"This structure describes additional attributes that can be attached to SAML assertion.\n","type":"array","items":{"type":"object","required":["name","name_format","value"],"properties":{"name":{"description":"The SAML attribute name.","type":"string","example":"firstName"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"value":{"description":"The value to attach to the SAML value.","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"},"custom_value":{"description":"The custom static string value when value is set to `custom_static_string`.\n","type":"string","example":"customString"}}}},"identity_provider_certs":{"description":"The X509 certificates of the identity provider (Beyond Identity). These are the certificates that is in our IDP metadata, and that the upstream services use to validate our SAML assertion.\n","type":"array","readOnly":true,"items":{"type":"object","description":"The BI Identity Provider Certificate for this SAML connection.\n","required":["id","created_at","expires_at","is_active","idp_public_certificate"],"properties":{"id":{"description":"The id of the certificate.","type":"string","example":"3cb717d1-88ff-440a-b5ee-86c00ce63dbf"},"created_at":{"description":"Timestamp of when the certificate was created.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"expires_at":{"description":"Timestamp of when the certificate expires.","type":"string","format":"date-time","example":"2022-05-12T20:29:47.636Z"},"is_active":{"description":"Indicates whether the certificate is active.","type":"boolean","example":true},"idp_public_certificate":{"description":"Beyond Identity's public signing key wrapped in a certificate.\nStored as a base64 encoded DER format.\n","type":"string","example":"-----BEGIN CERTIFICATE-----\n\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3Q4ebLzciJlVf4QDQ2u\n0Y2CfX9z4rMdG6MQSDW2NFQF0kM16Zzsz0p2gMOnp7YOz8OZqkU2XgUN3kQ8zC1h\nq+um2mU5K45f9Idoq8gE7/kmlZG1zS1mrDS36lM5Sc+E5hVgXJkNw3kEJ7OnhHHu\nZG0EvTlGjqntCGXxrpX5sS1a9z7HeemEos6Xlw8I8Q8txJTeHgkRmZkMy5ndRbWa\nsMyV8A1tk0Z5bLpoZBxn8Hh/M4v8HkV8O7lH91kB9D+4O+CZ4WcG4Fj8UOJW5m1M\nnsCfYvzpEzeLoB2xD3CEmonGzZC+Ij1ZhrWu5V6mnmx6dzUMjOZchRQtfnJZzQ1U\n2QIDAQAB\n-----END CERTIFICATE-----\n"}}}}}},{"type":"object","required":["type","client_id","identifying_claim_name","identity_attribute","okta_domain"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"client_id":{"description":"The client ID for the idp application.","type":"string"},"client_secret":{"description":"The client secret to authenticate as the idp application.","type":"string","nullable":true},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"id_token_scopes":{"default":null,"type":"array","items":{"type":"string"}},"identifying_claim_name":{"type":"string"},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"okta_domain":{"type":"string"},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type","pkce","okta_registration"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"okta_registration":{"description":"Represents a list of Resource Servers as a response body.","type":"object","properties":{"domain":{"description":"The domain Url inside of Okta.","type":"string"},"okta_token":{"description":"An okta token used for accessing the okta API.","type":"string"},"attribute_name":{"description":"The name of the attribute within okta that we are going to set to\ntrue.","type":"string"},"is_enabled":{"description":"If the integration is enabled.","type":"boolean"}}},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type","company_identifier"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"company_identifier":{"default":null,"type":"string"}}},{"type":"object","required":["type","acs_url","audience_url","expiration_time_seconds","digest_algorithm","signature_algorithm","name_format","subject_user_name_attribute","authentication_context","additional_user_attributes"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"acs_url":{"description":"This is where to redirect to. This is also known as the SP SSO url.\n","type":"string"},"audience_url":{"description":"The Recipient/Audience of the RSTR.","type":"string"},"expiration_time_seconds":{"description":"The amount of time in seconds that the RSTR should be valid for.","type":"integer","format":"int32"},"digest_algorithm":{"description":"The algorithm used to create a digest inside of the token within the RSTR.","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"signature_algorithm":{"description":"The algorithm used to create a signature inside of the token within the RSTR.","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"subject_user_name_attribute":{"description":"The attribute on the identity that's used to uniquely identify the user.\nThis is also the source for the user name inside of the RSTR.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement.\nDefault value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"additional_user_attributes":{"description":"Any additional attributes to attach to the assertion.","type":"array","items":{"description":"This structure describes additional attributes that can be\nattached to SAML assertion inside of WS-Fed token.\n","type":"object","required":["name","name_format","value"],"properties":{"name":{"description":"The SAML attribute name.","type":"string"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"value":{"description":"The value to attach to the SAML value.","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"},"namespace":{"type":"string","description":"This is an XML namespace that is applied the attribute and all of\nits children.\n"}}}},"icon":{"description":"The URL or data URI of the icon representing the SSO configuration.","type":"string"},"is_tile_visible":{"description":"Indicates if the SSO configuration tile is visible to the user.","type":"boolean"},"inbound_scim":{"default":null,"type":"object"}}}]}}}}}},"required":["x-correlation_id","tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:create"]}]
  }],
  ["GetSsoConfig", {
    name: "GetSsoConfig",
    description: `To retrieve an existing SSO Config, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/sso-configs/$SSO_CONFIG_ID\`.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["DeleteSsoConfig", {
    name: "DeleteSsoConfig",
    description: `Deletes an SSO Config by its ID.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:delete"]}]
  }],
  ["UpdateSsoConfig", {
    name: "UpdateSsoConfig",
    description: `Updates an SSO Config by its ID.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"description":"Represents an sso config as an update request body.","type":"object","required":["sso_config"],"properties":{"sso_config":{"oneOf":[{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"login_link":{"type":"string"},"icon":{"type":"string"},"is_tile_visible":{"type":"boolean"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"redirect_uris":{"default":null,"type":"array","items":{"type":"string"}},"inbound_scim":{"default":null,"type":"object"},"discover_endpoint":{"description":"Describes the type of discovery endpoint for the entra_id_external_auth_methods sso config.\n","type":"string","enum":["global_azure","azure_us_government","microsoft_azure_vianet"],"default":null}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"redirect_uris":{"default":null,"type":"array","items":{"type":"string"}},"scopes":{"default":null,"type":"array","items":{"type":"string"}},"trusted_origins":{"default":null,"type":"array","items":{"type":"string"}},"login_link":{"type":"string"},"icon":{"type":"string"},"is_tile_visible":{"type":"boolean"},"confidentiality":{"default":null,"allOf":[{"description":"The confidentiality of the client, as prescribed by OAuth 2.0 and\nOIDC. Confidentiality is based on a client's ability to authenticate\nsecurely with the authorization server (i.e., ability to\nmaintain the confidentiality of their client credentials). Allowable\nvalues are:\n- `confidential`: Clients capable of maintaining the confidentiality\n  of their credentials (e.g., client implemented on a secure server with\n  restricted access to the client credentials), or capable of secure\n  client authentication using other means.\n- `public`: Clients incapable of maintaining the confidentiality of their\n  credentials (e.g., clients executing on the device used by the\n  resource owner, such as an installed native application or a web\n  browser-based application), and incapable of secure client\n  authentication via any other means.\n","type":"string","enum":["confidential","public"],"example":"confidential"}]},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"client_id":{"description":"The client ID for the idp application.","type":"string"},"client_secret":{"description":"The client secret to authenticate as the idp application.","type":"string","nullable":true},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"id_token_scopes":{"default":null,"type":"array","items":{"type":"string"}},"identifying_claim_name":{"type":"string"},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"authorization_endpoint":{"type":"string","nullable":true},"token_endpoint":{"type":"string"},"jwks_endpoint":{"type":"string"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"acs_url":{"description":"Location where the SAML Response is sent via HTTP-POST. Often referred\nto as the SAML Assertion Consumer Service (ACS) URL.\n","type":"string"},"override_recipient_and_destination":{"description":"When this is true, the `recipient_url` and the `destination_url` are\nused for SAML Response.\n\nWhen this is false, both the `recipient_url` and the `destination_url`\nare omitted and the acs_url is used instead.\n","type":"boolean"},"recipient_url":{"description":"If `override_recipient_and_destination` is set to true, this field is\nutilized for the SAML Response. If it is false, this field is unused.\n\nThe location where the application can present the SAML assertion. This\nis usually the Single Sign-On (SSO) URL.\n","type":"string"},"destination_url":{"description":"If `override_recipient_and_destination` is set to true, this field is\nutilized for the SAML Response. If it is false, this field is unused.\n\nThe location to send the SAML Response, as defined in the SAML\nassertion.\n","type":"string"},"audience_url":{"description":"The intended audience of the SAML assertion. Often referred to as the\nservice provider Entity ID.\n","type":"string"},"default_relay_state":{"description":"Identifies a specific application resource in an IDP initiated Single\nSign-On scenario. In most instances this is blank.\n","type":"string"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"subject_user_name_attribute":{"description":"Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"sign_envelope":{"description":"Determines whether the SAML authentication response message is digitally\nsigned by the IdP or not. A digital signature is required to ensure that\nonly your IdP generated the response message.\n","type":"boolean"},"sign_assertions":{"description":"All of the assertions are signed by the IdP.","type":"boolean"},"signature_algorithm":{"description":"The algorithm used for signing the SAML assertions.\n","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"digest_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.\n","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"encrypt_assertions":{"description":"This is the flag that determines if the SAML assertion is encrypted.\nIf this flag is set to `true`, there MUST be a SAML encryption certificate\nuploaded.\n\nDetermines whether the SAML assertion is encrypted or not. Encryption\nensures that nobody but the sender and receiver can understand the\nassertion.\n","type":"boolean"},"assertion_validity_duration_seconds":{"description":"The amount of time assertions are valid for in seconds.\n","type":"integer","format":"int32"},"assertion_encryption_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.","type":"string","enum":["aes256_cbc","aes256_gcm","aes128_cbc","aes128_gcm"],"example":"aes256_cbc"},"assertion_key_transport_algorithm":{"description":"The algorithm used for key transport in SAML assertions.","type":"string","enum":["rsa_oaep","rsa1_5"],"example":"rsa_oaep"},"assertion_encryption_public_key":{"description":"The public key used to encrypt the SAML assertion. This is required\nif `encrypt_assertions` is true.\n","type":"string"},"sp_signature_certificates":{"description":"The PEM encoded X509 key certificate of the Service Provider\nused to verify SAML AuthnRequests.\n","type":"array","items":{"description":"The PEM encoded X509 key certificate of the Service Provider used to verify SAML AuthnRequests.\n","type":"array","items":{"type":"object","required":["sp_public_signing_key"],"properties":{"sp_public_signing_key":{"type":"string"}}},"example":["-----BEGIN CERTIFICATE-----\n\nMIIDdzCCAl+gAwIBAgIEbF2LTTANBgkqhkiG9w0BAQsFADBoMQswCQYDVQQGEwJV\nUzELMAkGA1UECBMCQ0ExFTATBgNVBAcTDFNhbiBGcmFuY2lzY28xEjAQBgNVBAoT\nCU9rdGEsIEluYy4xHzAdBgNVBAMTFm9rdGEuZXhhbXBsZS5jb20gQ0EgUm9vdDAe\nFw0yMDA2MTkwMDAwMDBaFw0yMTA2MTkyMzU5NTlaMG0xCzAJBgNVBAYTAlVTMQsw\nCQYDVQQIEwJDQTEVMBMGA1UEBxMMU2FuIEZyYW5jaXNjbzESMBAGA1UEChMJb2t0\nPbg6vGfJnxYYibTwLlXhgxl0tT+NMQFZ5GQslLh2sB3AWBzjZtFzFS7lDi0n4Fz5\ny9x6U1hUS54fScJmSVSTT9v/qAD0ccjvlPj3M6PENq2X7TwrOqSTgx5TPOpA5Myl\nMtwPbU3wn/pA5Cp9kWvlYbBfTS4Hx14FQyg3GAAkMrzrhKhpIfhz6iH0H8kDxFId\n6KjXy4TvoUM/tH7c6v2HS6D4TD7TfYOv/8A7E1Lj6WKwjtghTAh3Rb5tbyxRBcw\ngg==\n-----END CERTIFICATE-----\n"]}},"enable_single_log_out":{"description":"Enable single logout.","type":"boolean"},"single_log_out_url":{"description":"The location where the logout response will be sent.\nOnly enabled if `enable_single_log_out` is true.\n","type":"string"},"single_log_out_issuer_url":{"description":"The issuer ID for the service provider. When handling a Single Log Out.\n\nOnly enabled if `enable_single_log_out` is true.\n","type":"string"},"single_log_out_binding":{"description":"The binding used for single logout messages.","type":"string","enum":["post","redirect"],"example":"post"},"single_logout_sign_request_and_response":{"description":"If we should expect the LogoutRequest to be signed and if we\nshould sign the LogoutResponse.\n","type":"boolean"},"validate_signed_requests":{"description":"Select this to validate all SAML requests using the Signature\nCertificate. The payload from the SAML request is validated, and Okta\ndynamically reads any single sign-on (SSO) URLs from the request. This\ncheckbox appears after you upload a Signature Certificate.\n\nWhen Signed Requests is enabled, the SAML Request must include a\nNameIDPolicy.\n","type":"boolean"},"other_sso_urls":{"description":"For use with SP-initiated sign-in flows. Enter the ACS URLs for any\nother requestable SSO nodes used by your app integration. This option\nenables applications to choose where to send the SAML Response. Specify\na URL and an index that uniquely identifies each ACS URL endpoint.\n\nSome SAML AuthnRequest messages don't specify an index or URL. In these\ncases, the SAML Response is sent to the ACS specified in the Single sign\non URL field.\n\nWhen you enable Signed Requests, Okta deletes any previously defined\nstatic SSO URLs and reads the SSO URLs from the signed SAML request\ninstead. You can't have both static SSO URLs and dynamic SSO URLs.\n\nThis can only be set if validate_signed_requests is set to false.\n","type":"object","required":["index","url"],"properties":{"index":{"description":"The index that this URL may be referenced by.","type":"integer","format":"int16"},"url":{"description":"This is a URL that may be used to replace the ACS URL.\n","type":"string"}}},"additional_user_attributes":{"description":"Any additional attributes to attach to the SAML assertion.","type":"array","items":{"description":"The value of the SAML attribute. It will correspond to a directory attribute of the user.\n","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"}},"icon":{"description":"The URL or data URI of the icon representing the SSO configuration.","type":"string"},"is_tile_visible":{"description":"Indicates if the SSO configuration tile is visible to the user.","type":"boolean"},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"client_id":{"description":"The client ID for the idp application.","type":"string"},"client_secret":{"description":"The client secret to authenticate as the idp application.","type":"string","nullable":true},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"id_token_scopes":{"default":null,"type":"array","items":{"type":"string"}},"identifying_claim_name":{"type":"string"},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"okta_domain":{"type":"string"},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"pkce":{"default":null,"allOf":[{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"}]},"okta_registration":{"description":"Represents a list of Resource Servers as a response body.","type":"object","properties":{"domain":{"description":"The domain Url inside of Okta.","type":"string"},"okta_token":{"description":"An okta token used for accessing the okta API.","type":"string"},"attribute_name":{"description":"The name of the attribute within okta that we are going to set to\ntrue.","type":"string"},"is_enabled":{"description":"If the integration is enabled.","type":"boolean"}}},"inbound_scim":{"default":null,"type":"object"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"company_identifier":{"default":null,"type":"string"}}},{"type":"object","required":["type"],"properties":{"type":{"description":"Describes the type of sso config.\n","type":"string","enum":["bookmark","entra_id_external_auth_methods","generic_oidc","generic_oidc_idp","generic_saml","okta_idp","okta_sso_bi_idp","scim","ws_fed"]},"acs_url":{"description":"This is where to redirect too. This is also known as the SP SSO url.\n","type":"string"},"audience_url":{"description":"The Recipient/Audience of the RSTR.","type":"string"},"expiration_time_seconds":{"description":"The amount of time in seconds that the RSTR should be valid for.","type":"integer","format":"int32"},"digest_algorithm":{"description":"The algorithm used to encrypt the SAML assertion.\n","type":"string","enum":["sha256","sha1","sha384","sha512"],"example":"sha256"},"signature_algorithm":{"description":"The algorithm used for signing the SAML assertions.\n","type":"string","enum":["rsa_sha256","rsa_sha1","rsa_sha384","rsa_sha512"],"example":"rsa_sha256"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"subject_user_name_attribute":{"description":"Determines the default value for a user's application username. The application username will be used for the assertion's subject statement.\n","type":"string","enum":["user_name","email","email_prefix","external_id","display_name","custom","none"],"example":"user_name"},"authentication_context":{"description":"The SAML Authentication Context Class for the assertion's authentication statement. Default value is \"X509\".\n","type":"string","enum":["x509","integrated_windows_federation","kerberos","password","password_protected_transport","tls_client","unspecified","refeds_mfa"],"example":"x509"},"additional_user_attributes":{"description":"Any additional attributes to attach to the assertion.","type":"array","items":{"description":"This structure describes additional attributes that can be\nattached to SAML assertion inside of WS-Fed token.\n","type":"object","required":["name","name_format","value"],"properties":{"name":{"description":"The SAML attribute name.","type":"string"},"name_format":{"description":"Name format of the assertion's subject statement. Processing rules and constraints can be applied based on selection. Default value is \"unspecified\" unless SP explicitly requires differently.\n","type":"string","enum":["unspecified","email_address","x509_subject_name","persistent","transient","entity","kerberos","windows_domain_qualified_name"],"example":"unspecified"},"value":{"description":"The value to attach to the SAML value.","type":"string","enum":["email","user_name","external_id","display_name","custom_static_string"],"example":"email"},"namespace":{"type":"string","description":"This is an XML namespace that is applied the attribute and all of\nits children.\n"}}}},"icon":{"description":"The URL or data URI of the icon representing the SSO configuration.","type":"string"},"is_tile_visible":{"description":"Indicates if the SSO configuration tile is visible to the user.","type":"boolean"},"inbound_scim":{"default":null,"type":"object"}}}]}}}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id","requestBody"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:update"]}]
  }],
  ["AddIdentitiesToSsoConfig", {
    name: "AddIdentitiesToSsoConfig",
    description: `To associate identities to an sso config. The request must contain at least one and no more than 1000 identity IDs.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"title":"Associate Identities with SSO Config","description":"Request for AddIdentitiesToSsoConfig.","type":"object","properties":{"identity_ids":{"description":"IDs of the identities to be added to the sso config.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["identity_ids"]}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:addIdentities",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:update"]}]
  }],
  ["DeleteIdentitiesFromSsoConfig", {
    name: "DeleteIdentitiesFromSsoConfig",
    description: `To delete identities from an sso config. The request must contain at least one and no more than 1000 identities IDs.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"title":"Delete Identities from SSO Config","description":"Request for DeleteIdentitiesFromSsoConfig.","type":"object","properties":{"identity_ids":{"description":"IDs of the identities to be removed from the sso config.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["identity_ids"]}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:deleteIdentities",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:update"]}]
  }],
  ["ListIdentitiesForSsoConfig", {
    name: "ListIdentitiesForSsoConfig",
    description: `To list identities belonging to an sso config.
Note that there may be duplicate identities or an empty array in the response, but as long as there is a \`page_token\` then pagination should continue.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:listIdentityAssociations",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read","identities:read","groups:read"]}]
  }],
  ["IdentityToSSOConfigCheck", {
    name: "IdentityToSSOConfigCheck",
    description: `To check if an identity is assigned to the SSO config id, send a GET request to \`/v1/tenants/$TENANT_ID/realms/$REALM_ID/identities/$IDENTITY_ID/sso-configs/$SSO_CONFIG_ID/is-identity-assigned\`.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/sso-configs/{sso_config_id}/is-identity-assigned",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["ListSsoConfigsForIdentity", {
    name: "ListSsoConfigsForIdentity",
    description: `To list sso configs associated with an identity.

This will return all SSO configs that have an association with the specified identity ID.
Note that there may be duplicate SSO configs or an empty array in the response, but as long as there is a \`page_token\` pagination should continue.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"identity_id":{"type":"string","description":"A unique identifier for an identity."}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id","identity_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identities/{identity_id}/sso-configs",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"identity_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["AddGroupsToSsoConfig", {
    name: "AddGroupsToSsoConfig",
    description: `To associate groups to an sso config. The request must contain at least one and no more than 1000 group IDs.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"title":"Associate Groups with SSO Config","description":"Request for AddGroupsToSsoConfig.","type":"object","properties":{"group_ids":{"description":"IDs of the groups to be added to the sso config.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["group_ids"]}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:addGroups",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:update"]}]
  }],
  ["DeleteGroupsFromSsoConfig", {
    name: "DeleteGroupsFromSsoConfig",
    description: `To delete groups from an sso config. The request must contain at least one and no more than 1000 group IDs.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"title":"Delete Groups from SSO Config","description":"Request for DeleteGroupsToSsoConfig.","type":"object","properties":{"group_ids":{"description":"IDs of the groups to be removed from the sso config.","type":"array","items":{"type":"string"},"minItems":1,"maxItems":1000}},"required":["group_ids"]}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:deleteGroups",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:update"]}]
  }],
  ["ListGroupsForSSOConfig", {
    name: "ListGroupsForSSOConfig",
    description: `To list groups associated with an SSO config, send a GET request to
\`/v1/tenants/$TENANT_ID/realms/$REALM_ID/sso-configs/$SSO_CONFIG_ID/groups\`.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}:listGroupAssociations",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read","groups:read"]}]
  }],
  ["ListSsoConfigsForGroup", {
    name: "ListSsoConfigsForGroup",
    description: `To list sso configs associated with a group.

This will return all SSO configs that have an association with the specified group ID.
`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"},"group_id":{"type":"string","description":"A unique identifier for a group."}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id","group_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/groups/{group_id}/sso-configs",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"},{"name":"group_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["SSOIsGroupAssigned", {
    name: "SSOIsGroupAssigned",
    description: `Check if any of the groups provided are associated with the SSO Config ID.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"requestBody":{"type":"object","description":"A collection of group ids.\n","properties":{"group_ids":{"type":"array","items":{"type":"string"},"description":"A group id."}}}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id","requestBody"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}/is-group-assigned",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["ApplicationIdToSSOConfigId", {
    name: "ApplicationIdToSSOConfigId",
    description: `Returns the ID of the SSO Config associated with the application.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"application_id":{"type":"string","description":"A unique identifier for an application."}},"required":["x-correlation_id","tenant_id","realm_id","application_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/applications/{application_id}/sso-configs-id",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"application_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["TestSsoConfig", {
    name: "TestSsoConfig",
    description: `Tests an SSO Config.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/sso-configs/{sso_config_id}/test",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":["sso-configs:read"]}]
  }],
  ["listIdentityProviders", {
    name: "listIdentityProviders",
    description: `Lists Identity Providers by Realm.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"sso_config_id":{"type":"string","description":"A unique identifier of the sso configuration"},"page_size":{"type":"number","format":"uint32","minimum":0,"description":"Number of items returned per page. The response will include at most this many results but may include fewer. If this value is omitted, the response will return the default number of results allowed by the method.\n"},"page_token":{"type":"string","description":"Token to retrieve the subsequent page of the previous request. All other parameters to the list endpoint should match the original request that provided this token unless otherwise specified.\n"}},"required":["x-correlation_id","tenant_id","realm_id","sso_config_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"sso_config_id","in":"path"},{"name":"page_size","in":"query"},{"name":"page_token","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["createIdentityProvider", {
    name: "createIdentityProvider",
    description: `Creates a new identity provider.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"requestBody":{"description":"Represents an identity provider.","type":"object","required":["protocol_config","display_name"],"properties":{"id":{"description":"A unique identifier identifying an identity provider within a realm. This is\nautomatically set on creation. This field is immutable and read-only.\n","type":"string"},"tenant_id":{"type":"string","description":"A unique identifier for the identity's tenant. This is automatically\nset on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the identity's realm. This is automatically\nset on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"The human-readable name associated with the identity provider.\n"},"protocol_config":{"description":"The kind of protocol we should use to communicate with the identity\nprovider.\n","allOf":[{"description":"Represents the protocol configuration that is used by the identity\nprovider.\n","oneOf":[{"description":"OIDC protocol configuration for connecting to an identity provider, and\nvalidating the token we received.\n","type":"object","required":["client_id","client_secret","token_scopes","identity_attribute","pkce","jwks_url","token_url","authorize_url","identifying_claim_name","type"],"properties":{"type":{"type":"string","enum":["oidc_idp"]},"client_id":{"description":"The OIDC client id. This value is from the identity provider.\n","type":"string"},"client_secret":{"description":"The OIDC client secret. This value is from the identity provider.\n","type":"string"},"token_scopes":{"description":"The scopes which to assign to the generated Access token. Scopes will be checked against the identity before validating.\n","type":"array","items":{"type":"string"}},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"jwks_url":{"description":"The URL that points to the \".well-known/jwks.json\" of the identity\nprovider. Must be a URL.\n","type":"string"},"token_url":{"description":"The URL that points to the \"/token\" endpoint of the identity\nprovider. Must be a URL.\n","type":"string"},"authorize_url":{"description":"The \"/authorize\" URL to authenticate against inside of the identity\nprovider. Must be a URL.\n","type":"string"},"identifying_claim_name":{"description":"The name of the claim that specifies the user's identity inside of a\ntoken.\n","type":"string"}}}]}]}}}},"required":["x-correlation_id","tenant_id","realm_id"]},
    method: "post",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["getIdentityProvider", {
    name: "getIdentityProvider",
    description: `Retrieves data about an identity provider.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_provider_id":{"type":"string","description":"A unique identifier for an identity provider."}},"required":["x-correlation_id","tenant_id","realm_id","identity_provider_id"]},
    method: "get",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_provider_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["deleteIdentityProvider", {
    name: "deleteIdentityProvider",
    description: `Deletes an identity provider.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_provider_id":{"type":"string","description":"A unique identifier for an identity provider."}},"required":["x-correlation_id","tenant_id","realm_id","identity_provider_id"]},
    method: "delete",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_provider_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"BearerAuth":[]}]
  }],
  ["updateIdentityProvider", {
    name: "updateIdentityProvider",
    description: `Updates an identity provider.`,
    inputSchema: {"type":"object","properties":{"x-correlation_id":{"type":"string","description":"Correlation ID. If supplied with the request, the response must contain the same value. If not supplied with the request, it is generated by the server and returned in the response."},"tenant_id":{"type":"string","description":"A unique identifier for a tenant."},"realm_id":{"type":"string","description":"A unique identifier for a realm."},"identity_provider_id":{"type":"string","description":"A unique identifier for an identity provider."},"requestBody":{"description":"Represents an identity provider.","type":"object","properties":{"id":{"description":"A unique identifier identifying an identity provider. This is automatically\nset on creation. This field is immutable and read-only.\n","type":"string"},"tenant_id":{"type":"string","description":"A unique identifier for the identity provider's tenant. This is automatically\nset on creation. This field is immutable and read-only.\n"},"realm_id":{"type":"string","description":"A unique identifier for the identity provider's realm. This is automatically\nset on creation. This field is immutable and read-only.\n"},"display_name":{"type":"string","description":"The human-readable name associated with the identity provider.\n"},"protocol_config":{"description":"The kind of protocol we should use to communicate with the identity\nprovider.\n","allOf":[{"description":"Represents the protocol configuration that is used by the identity\nprovider.\n","oneOf":[{"description":"OIDC protocol configuration for connecting to an identity provider, and\nvalidating the token we received.\n","type":"object","required":["type"],"properties":{"type":{"type":"string","enum":["oidc_idp"]},"client_id":{"description":"The OIDC client id. This value is from the identity provider.\n","type":"string"},"client_secret":{"description":"The OIDC client secret. This value is from the identity provider.\n","type":"string"},"token_scopes":{"description":"The scopes which to assign to the generated Access token. Scopes will be checked against the identity before validating.\n","type":"array","items":{"type":"string"}},"identity_attribute":{"description":"Defines which field should be used to populate the subject field of an id token.\n- `id` - The user ID is used.\n- `email` - The user email is used.\n- `username` - The username is used.\n","type":"string","enum":["id","email","username","external_id"]},"pkce":{"type":"string","enum":["disabled","plain","s256"],"description":"PKCE code challenge methods supported for applications, as defined by\n[RFC-7636](https://datatracker.ietf.org/doc/html/rfc7636). Allowable values are:\n  - `disabled` : PKCE is disabled for this application. This is the default state if\n    the `pkce` field is left blank. Please note that public OIDC and OAuth2 configured\n    applications MUST enable PKCE support. Confidential clients can leave PKCE disabled\n    if they choose.\n  - `plain` : PKCE is enabled for this application. The server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to be identical. This is the lower security option for PKCE support and should only be used\n    by legacy clients, or clients that don't support `s256`.\n  - `s256` : PKCE is enabled for this application, and the server will correlate the `code_challenge` and\n    `code_verifier` between the `authorize` and `token` requests. In this configuration, those fields are\n    required to equate as follows: `code_challenge` = `base64url(sha256(ascii(code_verifier)))`. This is\n    the higher security option and should always be preferred if it is supported by the client.\n","example":"s256"},"jwks_url":{"description":"The URL that points to the \".well-known/jwks.json\" of the identity\nprovider. Must be a URL.\n","type":"string"},"token_url":{"description":"The URL that points to the \"/token\" endpoint of the identity\nprovider. Must be a URL.\n","type":"string"},"authorize_url":{"description":"The \"/authorize\" URL to authenticate against inside of the identity\nprovider. Must be a URL.\n","type":"string"},"identifying_claim_name":{"description":"The name of the claim that specifies the user's identity inside of a\ntoken.\n","type":"string"}}}],"discriminator":{"propertyName":"type"}}]}}}},"required":["x-correlation_id","tenant_id","realm_id","identity_provider_id"]},
    method: "patch",
    pathTemplate: "/v1/tenants/{tenant_id}/realms/{realm_id}/identity-providers/{identity_provider_id}",
    executionParameters: [{"name":"x-correlation_id","in":"header"},{"name":"tenant_id","in":"path"},{"name":"realm_id","in":"path"},{"name":"identity_provider_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"BearerAuth":[]}]
  }],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes =   {
    "BearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT",
      "description": "See the [Authentication](#section/Authentication) section for details.\n"
    }
  };


server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(def => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema
  }));
  return { tools: toolsForClient };
});


server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name: toolName, arguments: toolArgs } = request.params;
  const toolDefinition = toolDefinitionMap.get(toolName);
  if (!toolDefinition) {
    console.error(`Error: Unknown tool requested: ${toolName}`);
    return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
  }
  return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});



/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
    var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 * 
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(schemeName: string, scheme: any): Promise<string | null | undefined> {
    try {
        // Check if we have the necessary credentials
        const clientId = process.env[`OAUTH_CLIENT_ID_SCHEMENAME`];
        const clientSecret = process.env[`OAUTH_CLIENT_SECRET_SCHEMENAME`];
        const scopes = process.env[`OAUTH_SCOPES_SCHEMENAME`];
        
        if (!clientId || !clientSecret) {
            console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
            return null;
        }
        
        // Initialize token cache if needed
        if (typeof global.__oauthTokenCache === 'undefined') {
            global.__oauthTokenCache = {};
        }
        
        // Check if we have a cached token
        const cacheKey = `${schemeName}_${clientId}`;
        const cachedToken = global.__oauthTokenCache[cacheKey];
        const now = Date.now();
        
        if (cachedToken && cachedToken.expiresAt > now) {
            console.error(`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`);
            return cachedToken.token;
        }
        
        // Determine token URL based on flow type
        let tokenUrl = '';
        if (scheme.flows?.clientCredentials?.tokenUrl) {
            tokenUrl = scheme.flows.clientCredentials.tokenUrl;
            console.error(`Using client credentials flow for '${schemeName}'`);
        } else if (scheme.flows?.password?.tokenUrl) {
            tokenUrl = scheme.flows.password.tokenUrl;
            console.error(`Using password flow for '${schemeName}'`);
        } else {
            console.error(`No supported OAuth2 flow found for '${schemeName}'`);
            return null;
        }
        
        // Prepare the token request
        let formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        
        // Add scopes if specified
        if (scopes) {
            formData.append('scope', scopes);
        }
        
        console.error(`Requesting OAuth2 token from ${tokenUrl}`);
        
        // Make the token request
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            data: formData.toString()
        });
        
        // Process the response
        if (response.data?.access_token) {
            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
            
            // Cache the token
            global.__oauthTokenCache[cacheKey] = {
                token,
                expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
            };
            
            console.error(`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`);
            return token;
        } else {
            console.error(`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`);
            return null;
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
        return null;
    }
}


/**
 * Executes an API tool with the provided arguments
 * 
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
    toolName: string,
    definition: McpToolDefinition,
    toolArgs: JsonObject,
    allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
        const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
        const argsToParse = (typeof toolArgs === 'object' && toolArgs !== null) ? toolArgs : {};
        validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map(e => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
            return { content: [{ type: 'text', text: validationErrorMessage }] };
        } else {
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { content: [{ type: 'text', text: `Internal error during validation setup: ${errorMessage}` }] };
        }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
        const value = validatedArgs[param.name];
        if (typeof value !== 'undefined' && value !== null) {
            if (param.in === 'path') {
                urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
            }
            else if (param.in === 'query') {
                queryParams[param.name] = value;
            }
            else if (param.in === 'header') {
                headers[param.name.toLowerCase()] = String(value);
            }
        }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
        throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }
    
    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }


    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find(req => {
        // Try each security requirement (combined with OR)
        return Object.entries(req).every(([schemeName, scopesArray]) => {
            const scheme = allSecuritySchemes[schemeName];
            if (!scheme) return false;
            
            // API Key security (header, query, cookie)
            if (scheme.type === 'apiKey') {
                return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            // HTTP security (basic, bearer)
            if (scheme.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    return !!process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    return !!process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] && 
                           !!process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
            }
            
            // OAuth2 security
            if (scheme.type === 'oauth2') {
                // Check for pre-existing token
                if (process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    return true;
                }
                
                // Check for client credentials for auto-acquisition
                if (process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] &&
                    process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    // Verify we have a supported flow
                    if (scheme.flows?.clientCredentials || scheme.flows?.password) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // OpenID Connect
            if (scheme.type === 'openIdConnect') {
                return !!process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            return false;
        });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
        // Apply each security scheme from this requirement (combined with AND)
        for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
            const scheme = allSecuritySchemes[schemeName];
            
            // API Key security
            if (scheme?.type === 'apiKey') {
                const apiKey = process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (apiKey) {
                    if (scheme.in === 'header') {
                        headers[scheme.name.toLowerCase()] = apiKey;
                        console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
                    }
                    else if (scheme.in === 'query') {
                        queryParams[scheme.name] = apiKey;
                        console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
                    }
                    else if (scheme.in === 'cookie') {
                        // Add the cookie, preserving other cookies if they exist
                        headers['cookie'] = `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
                        console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
                    }
                }
            } 
            // HTTP security (Bearer or Basic)
            else if (scheme?.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    const token = process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (token) {
                        headers['authorization'] = `Bearer ${token}`;
                        console.error(`Applied Bearer token for '${schemeName}'`);
                    }
                } 
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    const username = process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    const password = process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (username && password) {
                        headers['authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
                        console.error(`Applied Basic authentication for '${schemeName}'`);
                    }
                }
            }
            // OAuth2 security
            else if (scheme?.type === 'oauth2') {
                // First try to use a pre-provided token
                let token = process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                
                // If no token but we have client credentials, try to acquire a token
                if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
                    console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
                    token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
                }
                
                // Apply token if available
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OAuth2 token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
            // OpenID Connect
            else if (scheme?.type === 'openIdConnect') {
                const token = process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OpenID Connect token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
        }
    } 
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
        // First generate a more readable representation of the security requirements
        const securityRequirementsString = definition.securityRequirements
            .map(req => {
                const parts = Object.entries(req)
                    .map(([name, scopesArray]) => {
                        const scopes = scopesArray as string[];
                        if (scopes.length === 0) return name;
                        return `${name} (scopes: ${scopes.join(', ')})`;
                    })
                    .join(' AND ');
                return `[${parts}]`;
            })
            .join(' OR ');
            
        console.warn(`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`);
    }
    

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(), 
      url: requestUrl, 
      params: queryParams, 
      headers: headers,
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);
    
    // Execute the request
    const response = await axios(config);

    // Process and format the response
    let responseText = '';
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    
    // Handle JSON responses
    if (contentType.includes('application/json') && typeof response.data === 'object' && response.data !== null) {
         try { 
             responseText = JSON.stringify(response.data, null, 2); 
         } catch (e) { 
             responseText = "[Stringify Error]"; 
         }
    } 
    // Handle string responses
    else if (typeof response.data === 'string') { 
         responseText = response.data; 
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) { 
         responseText = String(response.data); 
    }
    // Handle empty responses
    else { 
         responseText = `(Status: ${response.status} - No body content)`; 
    }
    
    // Return formatted response
    return { 
        content: [ 
            { 
                type: "text", 
                text: `API Response (Status: ${response.status}):\n${responseText}` 
            } 
        ], 
    };

  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;
    
    // Format Axios errors specially
    if (axios.isAxiosError(error)) { 
        errorMessage = formatApiError(error); 
    }
    // Handle standard errors
    else if (error instanceof Error) { 
        errorMessage = error.message; 
    }
    // Handle unexpected error types
    else { 
        errorMessage = 'Unexpected error: ' + String(error); 
    }
    
    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);
    
    // Return error message to client
    return { content: [{ type: "text", text: errorMessage }] };
  }
}


/**
 * Starts the server in HTTP/SSE mode
 */
async function startHttpServer() {
  const app = express();
  // Support both MCP_PORT (ToolHive) and PORT (manual deployment)
  const PORT = parseInt(process.env.MCP_PORT || process.env.PORT || '3000', 10);
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // Enable CORS for allowed origins
  app.use(cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : '*',
    credentials: true
  }));

  app.use(express.json());

  // Store active SSE connections by session ID
  const sseTransports = new Map<string, SSEServerTransport>();

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      server: SERVER_NAME,
      version: SERVER_VERSION,
      timestamp: new Date().toISOString()
    });
  });

  // SSE endpoint - establishes the event stream
  app.get('/sse', async (req: Request, res: Response) => {
    console.error('New SSE connection request');

    const transport = new SSEServerTransport('/message', res, {
      allowedOrigins: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : undefined
    });

    // Store transport by session ID
    sseTransports.set(transport.sessionId, transport);

    // Set up cleanup when connection closes
    transport.onclose = () => {
      console.error(`SSE connection closed: ${transport.sessionId}`);
      sseTransports.delete(transport.sessionId);
    };

    transport.onerror = (error: Error) => {
      console.error(`SSE transport error: ${error.message}`);
      sseTransports.delete(transport.sessionId);
    };

    try {
      // Note: server.connect() automatically calls transport.start()
      await server.connect(transport);
      console.error(`SSE connection established: ${transport.sessionId}`);
    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      sseTransports.delete(transport.sessionId);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to establish SSE connection' });
      }
    }
  });

  // Message endpoint - receives messages from the client
  app.post('/message', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId query parameter' });
    }

    const transport = sseTransports.get(sessionId);
    if (!transport) {
      return res.status(404).json({ error: 'Session not found' });
    }

    try {
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Error handling POST message:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process message' });
      }
    }
  });

  // Start HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on HTTP`);
    console.error(`SSE endpoint: http://0.0.0.0:${PORT}/sse`);
    console.error(`Health check: http://0.0.0.0:${PORT}/health`);
    console.error(`API base URL: ${API_BASE_URL}`);
  });
}

/**
 * Starts the server in stdio mode
 */
async function startStdioServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio${API_BASE_URL ? `, proxying API at ${API_BASE_URL}` : ''}`);
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

/**
 * Main function to start the server
 */
async function main() {
  const transportMode = process.env.MCP_TRANSPORT?.toLowerCase() || 'stdio';

  console.error(`Starting MCP server in ${transportMode} mode...`);

  if (transportMode === 'http' || transportMode === 'sse') {
    await startHttpServer();
  } else if (transportMode === 'stdio') {
    await startStdioServer();
  } else {
    console.error(`Unknown transport mode: ${transportMode}. Use 'stdio' or 'http'.`);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
    console.error("Shutting down MCP server...");
    process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error("Fatal error in main execution:", error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 * 
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
    let message = 'API request failed.';
    if (error.response) {
        message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
        const responseData = error.response.data;
        const MAX_LEN = 200;
        if (typeof responseData === 'string') { 
            message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`; 
        }
        else if (responseData) { 
            try { 
                const jsonString = JSON.stringify(responseData); 
                message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`; 
            } catch { 
                message += 'Response: [Could not serialize data]'; 
            } 
        }
        else { 
            message += 'No response body received.'; 
        }
    } else if (error.request) {
        message = 'API Network Error: No response received from server.';
        if (error.code) message += ` (Code: ${error.code})`;
    } else { 
        message += `API Request Setup Error: ${error.message}`; 
    }
    return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 * 
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) { 
        return z.object({}).passthrough(); 
    }
    try {
        const zodSchemaString = jsonSchemaToZod(jsonSchema);
        const zodSchema = eval(zodSchemaString);
        if (typeof zodSchema?.parse !== 'function') { 
            throw new Error('Eval did not produce a valid Zod schema.'); 
        }
        return zodSchema as z.ZodTypeAny;
    } catch (err: any) {
        console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
        return z.object({}).passthrough();
    }
}
