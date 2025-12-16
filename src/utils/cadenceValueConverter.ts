/**
 * Checks if a value is an array of UInt8 values
 */
function isUInt8Array(value: any): boolean {
    if (!Array.isArray(value) || value.length === 0) {
        return false;
    }
    // Check if all elements are UInt8
    return value.every((item: any) => 
        item && item["type"] === "UInt8" && item["value"] !== undefined
    );
}

/**
 * Converts an array of UInt8 values to a hexadecimal string
 */
function uint8ArrayToHex(value: any[]): string {
    return value.map((item: any) => {
        const num = parseInt(item["value"]);
        return num.toString(16).padStart(2, '0');
    }).join('');
}

/**
 * Converts Cadence JSON values to JavaScript dictionaries/objects
 * Based on the Cadence JSON specification: https://cadence-lang.org/docs/json-cadence-spec
 * 
 * @param payload - The Cadence JSON value to convert
 * @param brief - If true, simplifies type IDs by removing the contract address prefix
 * @returns The converted JavaScript value
 */
export function cadenceValueToDict(payload: any, brief: boolean = false): any {
    if (!payload) return null;

    // Handle array type
    if (payload["type"] === "Array") {
        const arrayValue = payload["value"];
        // Special handling for UInt8 arrays - convert to hex string
        if (isUInt8Array(arrayValue)) {
            return uint8ArrayToHex(arrayValue);
        }
        return cadenceValueToDict(arrayValue, brief);
    }

    // Handle JavaScript arrays (when value is already an array)
    if (Array.isArray(payload)) {
        const resArray: any[] = [];
        for (const item of payload) {
            resArray.push(cadenceValueToDict(item, brief));
        }
        return resArray;
    }

    // Handle Dictionary type
    if (payload["type"] === "Dictionary") {
        const resDict: Record<string, any> = {};
        payload["value"].forEach((element: any) => {
            let skey = cadenceValueToDict(element["key"], brief);
            
            if (brief && skey) {
                if (skey.toString().indexOf("A.") === 0) {
                    skey = skey.toString().split(".").slice(2).join(".");
                }
            }
            resDict[skey] = cadenceValueToDict(element["value"], brief);
        });
        return resDict;
    }

    // Handle Optional type
    if (payload["type"] === "Optional") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle Type type
    if (payload["type"] === "Type") {
        return cadenceValueToDict(payload["value"]["staticType"], brief);
    }

    // Handle Void type
    if (payload["type"] === "Void") {
        return null;
    }

    // Handle String type
    if (payload["type"] === "String") {
        return payload["value"];
    }

    // Handle Bool type
    if (payload["type"] === "Bool") {
        return payload["value"] === "true" || payload["value"] === true;
    }

    // Handle Character type
    if (payload["type"] === "Character") {
        return payload["value"];
    }

    // Handle Address type
    if (payload["type"] === "Address") {
        return payload["value"];
    }

    // Handle Path type
    if (payload["type"] === "Path") {
        return payload["value"]["domain"] + "/" + payload["value"]["identifier"];
    }

    // Handle all integer types (Int, Int8, Int16, Int32, Int64, Int128, Int256, UInt, UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Word8, Word16, Word32, Word64, Word128, Word256)
    if (payload["type"] && typeof payload["type"] === "string" && (
        payload["type"].indexOf("Int") > -1 || 
        payload["type"].indexOf("Word") > -1
    )) {
        // For UInt64 and larger values, keep as string to avoid precision loss
        if (payload["type"] === "UInt64" || 
            payload["type"] === "Int128" || 
            payload["type"] === "Int256" || 
            payload["type"] === "UInt128" || 
            payload["type"] === "UInt256" ||
            payload["type"] === "Word128" ||
            payload["type"] === "Word256") {
            return payload["value"];
        }
        return parseInt(payload["value"]);
    }

    // Handle fixed-point number types (Fix64, UFix64)
    if (payload["type"] && typeof payload["type"] === "string" && (
        payload["type"].indexOf("Fix") > -1
    )) {
        return parseFloat(payload["value"]);
    }

    // Handle Reference kind
    if (payload["kind"] === "Reference") {
        return "&" + payload["type"]["typeID"];
    }

    // Handle Capability kind (legacy)
    if (payload["kind"] && payload["kind"] === "Capability") {
        return payload["type"]["type"]["typeID"];
    }

    // Handle Capability type (new format)
    if (payload["type"] === "Capability") {
        const res: Record<string, any> = {};
        res["address"] = payload["value"]["address"];
        res["path"] = cadenceValueToDict(payload["value"]["path"], brief);
        res["borrowType"] = cadenceValueToDict(payload["value"]["borrowType"], brief);
        return {"<Capability>": res};
    }

    // Handle Struct type
    if (payload["type"] === "Struct") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle Resource type
    if (payload["type"] === "Resource") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle Event type
    if (payload["type"] === "Event") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle Contract type
    if (payload["type"] === "Contract") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle Enum type
    if (payload["type"] === "Enum") {
        return cadenceValueToDict(payload["value"], brief);
    }

    // Handle InclusiveRange type
    if (payload["type"] === "InclusiveRange") {
        const start = cadenceValueToDict(payload["value"]["start"], brief);
        const end = cadenceValueToDict(payload["value"]["end"], brief);
        const step = cadenceValueToDict(payload["value"]["step"], brief);
        return {
            "<InclusiveRange>": {
                start,
                end,
                step
            }
        };
    }

    // Handle composite types (structs, resources, events, contracts, enums with fields)
    // These have an 'id' field and a 'fields' array
    if (payload["id"] != null && payload["fields"] != null) {
        const res: Record<string, any> = {};
        for (const f in payload["fields"]) {
            const field = payload["fields"][f];
            const fieldName = field["name"];
            const fieldValue = field["value"];
            
            // Check if this field is a UInt8 array to add notation to the name
            let displayName = fieldName;
            if (fieldValue && fieldValue["type"] === "Array" && isUInt8Array(fieldValue["value"])) {
                displayName = `${fieldName} [UInt8]`;
            }
            
            res[displayName] = cadenceValueToDict(fieldValue, brief);
        }
        
        const res2: Record<string, any> = {};
        if (brief) {
            // Handle A. prefix (e.g., A.0x1234.MyContract.MyType -> MyContract.MyType)
            if (typeof payload["id"] === "string" && payload["id"].indexOf("A.") === 0) {
                res2[payload["id"].split(".").slice(2).join(".")] = res;
            }
            // Handle s. prefix (e.g., s.MyStruct -> MyStruct)
            else if (typeof payload["id"] === "string" && payload["id"].indexOf("s.") === 0) {
                res2[payload["id"].substring(2)] = res;
            } else {
                res2[payload["id"]] = res;
            }
        } else {
            res2[payload["id"]] = res;
        }
        return res2;
    }

    // Default: return the value field if it exists, otherwise null
    return payload["value"] !== undefined ? payload["value"] : null;
}
