export type JSONPrimitives = number | string | boolean | null
export type JSONArray = JSON[]
export type JSONObject = { [key: string]: JSON }
export type JSON = JSONPrimitives | JSONArray | JSONObject
