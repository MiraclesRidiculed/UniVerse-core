/**
 *
 * Long Run: (In case we need to Scale):
 * https://www.npmjs.com/package/memory-cache
 *
 * Use built-in Maps or Hashmaps to deal with Cached data
 *
 */

import ShortUniqueId from 'short-unique-id';


const uid = new ShortUniqueId({ length: 10 });
process.env.ADMIN = uid.rnd();
