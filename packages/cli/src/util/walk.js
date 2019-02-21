/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import fs from 'fs';
import path from 'path';

function walk(current) {
  if (!fs.lstatSync(current).isDirectory()) {
    return [current];
  }

  if (current.includes('node_modules')) {
    return [];
  }

  const files = fs
    .readdirSync(current)
    .map(child => walk(path.join(current, child)));
  return [].concat.apply([current], files);
}

export default walk;
