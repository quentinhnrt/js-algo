export type JSONPrimitive = string | number | boolean | null
export type JSONArray = JSON[]
export type JSONObject = { [key: string]: JSON }
export type JSON = JSONPrimitive | JSONArray | JSONObject