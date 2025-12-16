import { cadenceValueToDict } from './cadenceValueConverter';

describe('cadenceValueToDict', () => {
  describe('Null and undefined', () => {
    test('should return null for null input', () => {
      expect(cadenceValueToDict(null, false)).toBeNull();
    });

    test('should return null for undefined input', () => {
      expect(cadenceValueToDict(undefined, false)).toBeNull();
    });
  });

  describe('Void type', () => {
    test('should handle Void type', () => {
      const input = { type: 'Void' };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });
  });

  describe('String type', () => {
    test('should handle String type', () => {
      const input = { type: 'String', value: 'Hello, World!' };
      expect(cadenceValueToDict(input, false)).toBe('Hello, World!');
    });

    test('should handle empty String', () => {
      const input = { type: 'String', value: '' };
      expect(cadenceValueToDict(input, false)).toBe('');
    });
  });

  describe('Bool type', () => {
    test('should handle Bool type with string "true"', () => {
      const input = { type: 'Bool', value: 'true' };
      expect(cadenceValueToDict(input, false)).toBe(true);
    });

    test('should handle Bool type with string "false"', () => {
      const input = { type: 'Bool', value: 'false' };
      expect(cadenceValueToDict(input, false)).toBe(false);
    });

    test('should handle Bool type with boolean true', () => {
      const input = { type: 'Bool', value: true };
      expect(cadenceValueToDict(input, false)).toBe(true);
    });

    test('should handle Bool type with boolean false', () => {
      const input = { type: 'Bool', value: false };
      expect(cadenceValueToDict(input, false)).toBe(false);
    });
  });

  describe('Character type', () => {
    test('should handle Character type', () => {
      const input = { type: 'Character', value: 'x' };
      expect(cadenceValueToDict(input, false)).toBe('x');
    });
  });

  describe('Address type', () => {
    test('should handle Address type', () => {
      const input = { type: 'Address', value: '0x1234567890abcdef' };
      expect(cadenceValueToDict(input, false)).toBe('0x1234567890abcdef');
    });
  });

  describe('Integer types', () => {
    test('should handle Int type', () => {
      const input = { type: 'Int', value: '42' };
      expect(cadenceValueToDict(input, false)).toBe(42);
    });

    test('should handle Int8 type', () => {
      const input = { type: 'Int8', value: '-128' };
      expect(cadenceValueToDict(input, false)).toBe(-128);
    });

    test('should handle Int16 type', () => {
      const input = { type: 'Int16', value: '32767' };
      expect(cadenceValueToDict(input, false)).toBe(32767);
    });

    test('should handle Int32 type', () => {
      const input = { type: 'Int32', value: '-2147483648' };
      expect(cadenceValueToDict(input, false)).toBe(-2147483648);
    });

    test('should handle Int64 type', () => {
      const input = { type: 'Int64', value: '9223372036854775807' };
      expect(cadenceValueToDict(input, false)).toBe(9223372036854775807);
    });

    test('should handle UInt type', () => {
      const input = { type: 'UInt', value: '100' };
      expect(cadenceValueToDict(input, false)).toBe(100);
    });

    test('should handle UInt8 type', () => {
      const input = { type: 'UInt8', value: '255' };
      expect(cadenceValueToDict(input, false)).toBe(255);
    });

    test('should handle UInt16 type', () => {
      const input = { type: 'UInt16', value: '65535' };
      expect(cadenceValueToDict(input, false)).toBe(65535);
    });

    test('should handle UInt32 type', () => {
      const input = { type: 'UInt32', value: '4294967295' };
      expect(cadenceValueToDict(input, false)).toBe(4294967295);
    });

    test('should handle UInt64 type (kept as string)', () => {
      const input = { type: 'UInt64', value: '18446744073709551615' };
      expect(cadenceValueToDict(input, false)).toBe('18446744073709551615');
    });

    test('should handle Int128 type (kept as string)', () => {
      const input = { type: 'Int128', value: '170141183460469231731687303715884105727' };
      expect(cadenceValueToDict(input, false)).toBe('170141183460469231731687303715884105727');
    });

    test('should handle UInt128 type (kept as string)', () => {
      const input = { type: 'UInt128', value: '340282366920938463463374607431768211455' };
      expect(cadenceValueToDict(input, false)).toBe('340282366920938463463374607431768211455');
    });

    test('should handle Int256 type (kept as string)', () => {
      const input = { type: 'Int256', value: '57896044618658097711785492504343953926634992332820282019728792003956564819967' };
      expect(cadenceValueToDict(input, false)).toBe('57896044618658097711785492504343953926634992332820282019728792003956564819967');
    });

    test('should handle UInt256 type (kept as string)', () => {
      const input = { type: 'UInt256', value: '115792089237316195423570985008687907853269984665640564039457584007913129639935' };
      expect(cadenceValueToDict(input, false)).toBe('115792089237316195423570985008687907853269984665640564039457584007913129639935');
    });

    test('should handle Word8 type', () => {
      const input = { type: 'Word8', value: '255' };
      expect(cadenceValueToDict(input, false)).toBe(255);
    });

    test('should handle Word16 type', () => {
      const input = { type: 'Word16', value: '65535' };
      expect(cadenceValueToDict(input, false)).toBe(65535);
    });

    test('should handle Word32 type', () => {
      const input = { type: 'Word32', value: '4294967295' };
      expect(cadenceValueToDict(input, false)).toBe(4294967295);
    });

    test('should handle Word64 type', () => {
      const input = { type: 'Word64', value: '18446744073709551615' };
      expect(cadenceValueToDict(input, false)).toBe(18446744073709551615);
    });

    test('should handle Word128 type (kept as string)', () => {
      const input = { type: 'Word128', value: '340282366920938463463374607431768211455' };
      expect(cadenceValueToDict(input, false)).toBe('340282366920938463463374607431768211455');
    });

    test('should handle Word256 type (kept as string)', () => {
      const input = { type: 'Word256', value: '115792089237316195423570985008687907853269984665640564039457584007913129639935' };
      expect(cadenceValueToDict(input, false)).toBe('115792089237316195423570985008687907853269984665640564039457584007913129639935');
    });
  });

  describe('Fixed-point types', () => {
    test('should handle Fix64 type', () => {
      const input = { type: 'Fix64', value: '123.456' };
      expect(cadenceValueToDict(input, false)).toBe(123.456);
    });

    test('should handle UFix64 type', () => {
      const input = { type: 'UFix64', value: '0.00000001' };
      expect(cadenceValueToDict(input, false)).toBe(0.00000001);
    });
  });

  describe('Array type', () => {
    test('should handle Array type with simple values', () => {
      const input = {
        type: 'Array',
        value: [
          { type: 'Int', value: '1' },
          { type: 'Int', value: '2' },
          { type: 'Int', value: '3' }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual([1, 2, 3]);
    });

    test('should handle empty Array', () => {
      const input = { type: 'Array', value: [] };
      expect(cadenceValueToDict(input, false)).toEqual([]);
    });

    test('should handle nested Arrays', () => {
      const input = {
        type: 'Array',
        value: [
          {
            type: 'Array',
            value: [
              { type: 'Int', value: '1' },
              { type: 'Int', value: '2' }
            ]
          },
          {
            type: 'Array',
            value: [
              { type: 'Int', value: '3' },
              { type: 'Int', value: '4' }
            ]
          }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('Dictionary type', () => {
    test('should handle Dictionary type', () => {
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
      expect(cadenceValueToDict(input, false)).toEqual({
        name: 'John',
        age: 30
      });
    });

    test('should handle empty Dictionary', () => {
      const input = { type: 'Dictionary', value: [] };
      expect(cadenceValueToDict(input, false)).toEqual({});
    });

    test('should handle Dictionary with brief mode', () => {
      const input = {
        type: 'Dictionary',
        value: [
          {
            key: { type: 'String', value: 'A.0x1234.TokenName.Vault' },
            value: { type: 'Int', value: '100' }
          }
        ]
      };
      expect(cadenceValueToDict(input, true)).toEqual({
        'TokenName.Vault': 100
      });
    });
  });

  describe('Optional type', () => {
    test('should handle Optional with value', () => {
      const input = {
        type: 'Optional',
        value: { type: 'Int', value: '42' }
      };
      expect(cadenceValueToDict(input, false)).toBe(42);
    });

    test('should handle Optional without value (null)', () => {
      const input = {
        type: 'Optional',
        value: null
      };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });
  });

  describe('Type type', () => {
    test('should handle Type type', () => {
      const input = {
        type: 'Type',
        value: {
          staticType: { type: 'String', value: 'String' }
        }
      };
      expect(cadenceValueToDict(input, false)).toBe('String');
    });
  });

  describe('Path type', () => {
    test('should handle Path type', () => {
      const input = {
        type: 'Path',
        value: {
          domain: 'storage',
          identifier: 'flowToken'
        }
      };
      expect(cadenceValueToDict(input, false)).toBe('storage/flowToken');
    });

    test('should handle public Path', () => {
      const input = {
        type: 'Path',
        value: {
          domain: 'public',
          identifier: 'receiver'
        }
      };
      expect(cadenceValueToDict(input, false)).toBe('public/receiver');
    });
  });

  describe('Reference type', () => {
    test('should handle Reference kind', () => {
      const input = {
        kind: 'Reference',
        type: {
          typeID: 'A.0x1234.MyContract.MyResource'
        }
      };
      expect(cadenceValueToDict(input, false)).toBe('&A.0x1234.MyContract.MyResource');
    });
  });

  describe('Capability type', () => {
    test('should handle Capability kind (legacy)', () => {
      const input = {
        kind: 'Capability',
        type: {
          type: {
            typeID: 'A.0x1234.MyContract.MyResource'
          }
        }
      };
      expect(cadenceValueToDict(input, false)).toBe('A.0x1234.MyContract.MyResource');
    });

    test('should handle Capability type (new format)', () => {
      const input = {
        type: 'Capability',
        value: {
          address: '0x1234567890abcdef',
          path: {
            type: 'Path',
            value: {
              domain: 'public',
              identifier: 'receiver'
            }
          },
          borrowType: { type: 'String', value: 'MyResource' }
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        '<Capability>': {
          address: '0x1234567890abcdef',
          path: 'public/receiver',
          borrowType: 'MyResource'
        }
      });
    });
  });

  describe('Struct type', () => {
    test('should handle Struct type', () => {
      const input = {
        type: 'Struct',
        value: {
          id: 'A.0x1234.MyContract.MyStruct',
          fields: [
            {
              name: 'field1',
              value: { type: 'String', value: 'value1' }
            },
            {
              name: 'field2',
              value: { type: 'Int', value: '42' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.MyStruct': {
          field1: 'value1',
          field2: 42
        }
      });
    });

    test('should handle Struct type with brief mode', () => {
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
      expect(cadenceValueToDict(input, true)).toEqual({
        'MyContract.MyStruct': {
          field1: 'value1'
        }
      });
    });
  });

  describe('Resource type', () => {
    test('should handle Resource type', () => {
      const input = {
        type: 'Resource',
        value: {
          id: 'A.0x1234.MyContract.MyResource',
          fields: [
            {
              name: 'uuid',
              value: { type: 'UInt64', value: '123' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.MyResource': {
          uuid: '123'
        }
      });
    });
  });

  describe('Event type', () => {
    test('should handle Event type', () => {
      const input = {
        type: 'Event',
        value: {
          id: 'A.0x1234.MyContract.MyEvent',
          fields: [
            {
              name: 'amount',
              value: { type: 'UFix64', value: '10.5' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.MyEvent': {
          amount: 10.5
        }
      });
    });
  });

  describe('Contract type', () => {
    test('should handle Contract type', () => {
      const input = {
        type: 'Contract',
        value: {
          id: 'A.0x1234.MyContract',
          fields: [
            {
              name: 'totalSupply',
              value: { type: 'UFix64', value: '1000000.0' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract': {
          totalSupply: 1000000.0
        }
      });
    });
  });

  describe('Enum type', () => {
    test('should handle Enum type', () => {
      const input = {
        type: 'Enum',
        value: {
          id: 'A.0x1234.MyContract.Color',
          fields: [
            {
              name: 'rawValue',
              value: { type: 'Int', value: '0' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.Color': {
          rawValue: 0
        }
      });
    });
  });

  describe('InclusiveRange type', () => {
    test('should handle InclusiveRange type', () => {
      const input = {
        type: 'InclusiveRange',
        value: {
          start: { type: 'Int', value: '1' },
          end: { type: 'Int', value: '10' },
          step: { type: 'Int', value: '1' }
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        '<InclusiveRange>': {
          start: 1,
          end: 10,
          step: 1
        }
      });
    });

    test('should handle InclusiveRange with custom step', () => {
      const input = {
        type: 'InclusiveRange',
        value: {
          start: { type: 'Int', value: '0' },
          end: { type: 'Int', value: '100' },
          step: { type: 'Int', value: '10' }
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        '<InclusiveRange>': {
          start: 0,
          end: 100,
          step: 10
        }
      });
    });
  });

  describe('Composite types with id field', () => {
    test('should handle composite type with A. prefix', () => {
      const input = {
        id: 'A.0x1234.MyContract.MyComposite',
        fields: [
          {
            name: 'name',
            value: { type: 'String', value: 'Test' }
          }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.MyComposite': {
          name: 'Test'
        }
      });
    });

    test('should handle composite type with A. prefix in brief mode', () => {
      const input = {
        id: 'A.0x1234.MyContract.MyComposite',
        fields: [
          {
            name: 'name',
            value: { type: 'String', value: 'Test' }
          }
        ]
      };
      expect(cadenceValueToDict(input, true)).toEqual({
        'MyContract.MyComposite': {
          name: 'Test'
        }
      });
    });

    test('should handle composite type with s. prefix', () => {
      const input = {
        id: 's.MyStruct',
        fields: [
          {
            name: 'value',
            value: { type: 'Int', value: '123' }
          }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        's.MyStruct': {
          value: 123
        }
      });
    });

    test('should handle composite type with s. prefix in brief mode', () => {
      const input = {
        id: 's.MyStruct',
        fields: [
          {
            name: 'value',
            value: { type: 'Int', value: '123' }
          }
        ]
      };
      expect(cadenceValueToDict(input, true)).toEqual({
        'MyStruct': {
          value: 123
        }
      });
    });
  });

  describe('Complex nested structures', () => {
    test('should handle nested composite types', () => {
      const input = {
        type: 'Struct',
        value: {
          id: 'A.0x1234.MyContract.Outer',
          fields: [
            {
              name: 'inner',
              value: {
                type: 'Struct',
                value: {
                  id: 'A.0x1234.MyContract.Inner',
                  fields: [
                    {
                      name: 'value',
                      value: { type: 'Int', value: '42' }
                    }
                  ]
                }
              }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.Outer': {
          inner: {
            'A.0x1234.MyContract.Inner': {
              value: 42
            }
          }
        }
      });
    });

    test('should handle array of composite types', () => {
      const input = {
        type: 'Array',
        value: [
          {
            id: 'A.0x1234.MyContract.MyStruct',
            fields: [
              {
                name: 'id',
                value: { type: 'Int', value: '1' }
              }
            ]
          },
          {
            id: 'A.0x1234.MyContract.MyStruct',
            fields: [
              {
                name: 'id',
                value: { type: 'Int', value: '2' }
              }
            ]
          }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual([
        { 'A.0x1234.MyContract.MyStruct': { id: 1 } },
        { 'A.0x1234.MyContract.MyStruct': { id: 2 } }
      ]);
    });

    test('should handle dictionary with composite values', () => {
      const input = {
        type: 'Dictionary',
        value: [
          {
            key: { type: 'String', value: 'item1' },
            value: {
              id: 'A.0x1234.MyContract.Item',
              fields: [
                {
                  name: 'quantity',
                  value: { type: 'Int', value: '5' }
                }
              ]
            }
          }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        item1: {
          'A.0x1234.MyContract.Item': {
            quantity: 5
          }
        }
      });
    });

    test('should handle optional composite type', () => {
      const input = {
        type: 'Optional',
        value: {
          id: 'A.0x1234.MyContract.MyStruct',
          fields: [
            {
              name: 'value',
              value: { type: 'String', value: 'present' }
            }
          ]
        }
      };
      expect(cadenceValueToDict(input, false)).toEqual({
        'A.0x1234.MyContract.MyStruct': {
          value: 'present'
        }
      });
    });
  });

  describe('Edge cases', () => {
    test('should handle value field directly when no specific type matches', () => {
      const input = { value: 'some-value' };
      expect(cadenceValueToDict(input, false)).toBe('some-value');
    });

    test('should handle mixed type arrays', () => {
      const input = {
        type: 'Array',
        value: [
          { type: 'String', value: 'hello' },
          { type: 'Int', value: '42' },
          { type: 'Bool', value: 'true' }
        ]
      };
      expect(cadenceValueToDict(input, false)).toEqual(['hello', 42, true]);
    });
  });

  describe('Edge cases for undefined values', () => {
    test('should return null when value field is undefined', () => {
      const input = { type: 'UnknownType', value: undefined };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });

    test('should return null when value field does not exist', () => {
      const input = { type: 'UnknownType' };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });

    test('should return null when object has no recognized type', () => {
      const input = { id: 'SomeID' };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });

    test('should return null for empty object', () => {
      const input = {};
      expect(cadenceValueToDict(input, false)).toBeNull();
    });

    test('should handle null value in String type', () => {
      const input = { type: 'String', value: null };
      expect(cadenceValueToDict(input, false)).toBeNull();
    });
  });
});
