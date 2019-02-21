/**
 * @flow
 */

import path from 'path';

import findPlugins from './findPlugins';

import type { CommandT, ProjectCommandT, LocalCommandT } from './types.flow';

import server from '../server/server';
import runIOS from '../runIOS/runIOS';
import runAndroid from '../runAndroid/runAndroid';
import library from '../library/library';
import bundle from '../bundle/bundle';
import ramBundle from '../bundle/ramBundle';
import eject from '../eject/eject';
import link from '../link/link';
import unlink from '../link/unlink';
import install from '../install/install';
import uninstall from '../install/uninstall';
import upgrade from '../upgrade/upgrade';
import logAndroid from '../logAndroid/logAndroid';
import logIOS from '../logIOS/logIOS';
import dependencies from '../dependencies/dependencies';
import info from '../info/info';
import init from '../init';

/**
 * List of built-in commands
 */

const loadLocalCommands: Array<LocalCommandT> = [
  server,
  runIOS,
  runAndroid,
  library,
  bundle,
  ramBundle,
  eject,
  link,
  unlink,
  install,
  uninstall,
  upgrade,
  logAndroid,
  logIOS,
  dependencies,
  info,
  init,
];

/**
 * Returns an array of commands that are defined in the project.
 *
 * This checks all CLI plugins for presence of 3rd party packages that define commands
 * and loads them
 */
const loadProjectCommands = (root: string): Array<ProjectCommandT> => {
  const plugins = findPlugins(root);

  return plugins.commands.reduce((acc: Array<CommandT>, pathToCommands) => {
    /**
     * `pathToCommand` is a path to a file where commands are defined, relative to `node_modules`
     * folder.
     *
     * Following code gets the name of the package name out of the path, taking scope
     * into consideration.
     */
    const name =
      pathToCommands[0] === '@'
        ? pathToCommands
            .split(path.sep)
            .slice(0, 2)
            .join(path.sep)
        : pathToCommands.split(path.sep)[0];

    // $FlowFixMe: Non-literal require
    const pkg = require(path.join(root, 'node_modules', name, 'package.json'));

    // $FlowFixMe: Non-literal require
    const requiredCommands:
      | ProjectCommandT
      | Array<ProjectCommandT> = require(path.join(
      root,
      'node_modules',
      pathToCommands
    ));

    if (Array.isArray(requiredCommands)) {
      return acc.concat(
        requiredCommands.map(requiredCommand => ({ ...requiredCommand, pkg }))
      );
    }

    return acc.concat({ ...requiredCommands });
  }, []);
};

/**
 * Loads all the commands inside a given `root` folder
 */
export default (root: string): Array<CommandT> => [
  ...loadLocalCommands,
  ...loadProjectCommands(root),
];
