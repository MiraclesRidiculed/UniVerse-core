/**
 *
 * Long Run: (In case we need to Scale):
 * https://www.npmjs.com/package/memory-cache
 *
 * Till then, use built-in Maps or @discordjs/collection to deal with Cached data
 *
 */

import ShortUniqueId from 'short-unique-id';
import { Collection } from '@discordjs/collection';

const uid = new ShortUniqueId({ length: 10 });
export const ADMIN = uid.rnd();

export const cookies = new Collection<string, string>();
