# Cadence Value Converter

This module provides a utility function to convert Cadence JSON values to JavaScript dictionaries/objects.

## Overview

The `cadenceValueToDict` function converts Cadence JSON format (as specified at https://cadence-lang.org/docs/json-cadence-spec) to JavaScript objects for easier manipulation and display.

## Usage

```typescript
import { cadenceValueToDict } from '@utils/cadenceValueConverter';

// Convert a Cadence JSON value
const result = cadenceValueToDict(cadenceJson, false);

// Use brief mode to simplify type IDs
const briefResult = cadenceValueToDict(cadenceJson, true);
```

## Supported Types

The function supports all types defined in the Cadence JSON specification:

### Simple Types
- **Void**: Returns `null`
- **String**: Returns the string value
- **Bool**: Returns boolean `true` or `false`
- **Character**: Returns the character value
- **Address**: Returns the address string

### Numeric Types
- **Integer types**: Int, Int8, Int16, Int32, Int64, Int128, Int256, UInt, UInt8, UInt16, UInt32, UInt64, UInt128, UInt256
  - Smaller integers are parsed to JavaScript numbers
  - Large integers (UInt64, Int128, Int256, UInt128, UInt256) are kept as strings to prevent precision loss
- **Word types**: Word8, Word16, Word32, Word64, Word128, Word256
  - Similar to integer types
- **Fixed-point types**: Fix64, UFix64
  - Parsed to JavaScript floating-point numbers

### Complex Types
- **Array**: Converts to JavaScript array
- **Dictionary**: Converts to JavaScript object
- **Optional**: Unwraps the optional value (or returns null if empty)
- **Type**: Extracts the static type
- **Path**: Formats as "domain/identifier" string
- **Reference**: Formats as "&typeID" string
- **Capability**: Returns structured capability information

### Composite Types
- **Struct**: Extracts fields into an object
- **Resource**: Extracts fields into an object
- **Event**: Extracts fields into an object
- **Contract**: Extracts fields into an object
- **Enum**: Extracts fields into an object
- **InclusiveRange**: Returns range information with start, end, and step

**Note**: Composite types are identified by having both an `id` field and a `fields` array. The `id` can be:
- A fully qualified identifier with contract address (e.g., `A.0x1234.MyContract.MyType`)
- A simple identifier (e.g., `AccountKey`, `PublicKey`)
- A standard library type (e.g., `s.MyStruct`)

## Brief Mode

When `brief` mode is enabled:
- Type IDs with "A." prefix (e.g., `A.0x1234.MyContract.MyType`) are simplified to `MyContract.MyType`
- Type IDs with "s." prefix (e.g., `s.MyStruct`) are simplified to `MyStruct`
- Other type IDs remain unchanged

## Examples

### Simple Value
```typescript
const input = { type: 'String', value: 'Hello, World!' };
cadenceValueToDict(input, false); // Returns: "Hello, World!"
```

### Array
```typescript
const input = {
  type: 'Array',
  value: [
    { type: 'Int', value: '1' },
    { type: 'Int', value: '2' },
    { type: 'Int', value: '3' }
  ]
};
cadenceValueToDict(input, false); // Returns: [1, 2, 3]
```

### Dictionary
```typescript
const input = {
  type: 'Dictionary',
  value: [
    {
      key: { type: 'String', value: 'name' },
      value: { type: 'String', value: 'John' }
    },
    {
      key: { type: 'String', value: 'age' },
      value: { type: 'Int', value: '30' }
    }
  ]
};
cadenceValueToDict(input, false); 
// Returns: { name: 'John', age: 30 }
```

### Struct (with brief mode)
```typescript
const input = {
  type: 'Struct',
  value: {
    id: 'A.0x1234.MyContract.MyStruct',
    fields: [
      {
        name: 'field1',
        value: { type: 'String', value: 'value1' }
      }
    ]
  }
};

cadenceValueToDict(input, false);
// Returns: { 'A.0x1234.MyContract.MyStruct': { field1: 'value1' } }

cadenceValueToDict(input, true);
// Returns: { 'MyContract.MyStruct': { field1: 'value1' } }
```

## Testing

The module includes comprehensive unit tests covering all supported types and edge cases. Run tests with:

```bash
npm test
```

To run only the cadenceValueConverter tests:

```bash
npm test -- cadenceValueConverter.test.ts
```

## Implementation Notes

- Large integer values (UInt64, Int128, Int256, etc.) are kept as strings to prevent JavaScript's Number type from losing precision
- The function handles nested structures recursively
- Type checking is performed before string operations to prevent runtime errors
- The function maintains backward compatibility with the original implementation while adding support for additional types
