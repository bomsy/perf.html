/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
import * as colors from 'photon-colors';
import type {
  Thread,
  IndexIntoFrameTable,
  IndexIntoStackTable,
} from '../types/profile';

type CategoryName = string;
type CssParseableColor = string;
type IndexIntoCategory = number;
type CategoriesMap = { [id: CategoryName]: CssParseableColor };
type Category = { name: CategoryName, color: CssParseableColor };
type CategoriesIndexMap = { [id: CategoryName]: number };

export type GetCategory = (Thread, IndexIntoFrameTable) => Category;

export const implementationCategoryMap: CategoriesMap = {
  'JS Baseline': colors.GREY_30,
  JIT: '#86EC71', // A lighter version of GREEN_50
  'JS Interpreter': colors.GREY_40,
  Platform: colors.GREY_20,
};

export const implementationCategories: Category[] = _categoriesMapToList(
  implementationCategoryMap
);

const _implementationCategoriesIndexMap: CategoriesIndexMap = _toIndexMap(
  implementationCategories
);

// TODO - This function is not needed.

export function getImplementationColor(
  thread: Thread,
  frameIndex: IndexIntoFrameTable
): CssParseableColor {
  return getCategoryByImplementation(thread, frameIndex).color;
}

export function getCategoryByImplementation(
  thread: Thread,
  frameIndex: IndexIntoFrameTable
): Category {
  return implementationCategories[
    getImplementationCategoryIndex(thread, frameIndex)
  ];
}

// TODO - This function is not needed.

export function getImplementationCategoryIndex(
  thread: Thread,
  frameIndex: IndexIntoFrameTable
): IndexIntoCategory {
  const funcIndex = thread.frameTable.func[frameIndex];
  const implementationIndex = thread.frameTable.implementation[frameIndex];
  const implementation = implementationIndex
    ? thread.stringTable.getString(implementationIndex)
    : null;
  let categoryName;
  if (implementation) {
    categoryName = implementation === 'baseline' ? 'JS Baseline' : 'JIT';
  } else {
    categoryName = thread.funcTable.isJS[funcIndex]
      ? 'JS Interpreter'
      : 'Platform';
  }
  return _implementationCategoriesIndexMap[categoryName];
}

function _toIndexMap(categories) {
  const indexMap = {};
  for (let i = 0; i < categories.length; i++) {
    indexMap[categories[i].name] = i;
  }
  return indexMap;
}

function _categoriesMapToList(object) {
  const list = [];
  for (const name in object) {
    if (object.hasOwnProperty(name)) {
      list.push({ name, color: object[name] });
    }
  }
  return list;
}

export function getFunctionName(
  thread: Thread,
  stackIndex: IndexIntoStackTable
) {
  const frameIndex = thread.stackTable.frame[stackIndex];
  const funcIndex = thread.frameTable.func[frameIndex];
  return thread.stringTable.getString(thread.funcTable.name[funcIndex]);
}
