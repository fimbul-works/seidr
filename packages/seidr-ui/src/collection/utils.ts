/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright 2024 jer3m01 jer3m01@jer3m01.com
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-collection/utils.ts
 */
import { isNullish, isNum, isStr } from "@fimbul-works/seidr";
import type { CreateCollectionParams } from "./create-collection.js";
import type { CollectionNode } from "./types.js";

interface BuildNodesParams<T = any> extends Omit<CreateCollectionParams<T>, "dataSource"> {
  dataSource: T[];
  startIndex?: number;
  startLevel?: number;
}

/**
 * Generate a flatted array of `CollectionNode` from a custom data source.
 */
export function buildNodes<T = any>(params: BuildNodesParams): CollectionNode<T>[] {
  const {
    getKey: keyProp = "key",
    getTextValue: textProp = "textValue",
    getDisabled: disabledProp = "disabled",
    getSectionChildren: getSectionChildrenProp,
  } = params;

  const nodes: CollectionNode<T>[] = [];
  const level = params.startLevel ?? 0;
  let index = params.startIndex ?? 0;

  const getKey = (data: any): string => {
    if (isNullish(data)) return "";
    const dataKey = isStr(keyProp) ? data[keyProp] : keyProp(data);
    return !isNullish(dataKey) ? String(dataKey) : "";
  };

  const getTextValue = (data: any): string => {
    if (isNullish(data)) return "";
    const text = isStr(textProp) ? data[textProp] : textProp(data);
    return !isNullish(text) ? String(text) : "";
  };

  const getDisabled = (data: any): boolean => {
    if (isNullish(data)) return false;
    return !!(isStr(disabledProp) ? data[disabledProp] : disabledProp(data));
  };

  const getSectionChildren = (data: any): any[] | undefined => {
    if (isNullish(data)) return undefined;
    return isStr(getSectionChildrenProp) ? data[getSectionChildrenProp] : getSectionChildrenProp?.(data);
  };

  for (const data of params.dataSource) {
    // If it's not an object assume it's an item
    if (isStr(data) || isNum(data)) {
      nodes.push({
        type: "item",
        rawValue: data as T,
        key: String(data),
        textValue: String(data),
        disabled: getDisabled(data),
        level,
        index,
      });
      index++;
      continue;
    }

    // Assume it's a section if it has children
    const sectionChildren = getSectionChildren(data);
    if (!isNullish(sectionChildren)) {
      nodes.push({
        type: "section",
        rawValue: data,
        key: "",
        textValue: "",
        disabled: false,
        level,
        index,
      });
      index++;

      // Section children are recursively processed, increasing the level
      if (sectionChildren.length > 0) {
        const childNodes = buildNodes({
          ...params,
          dataSource: sectionChildren,
          startIndex: index,
          startLevel: level + 1,
        });
        nodes.push(...childNodes);
        index += childNodes.length;
      }
    } else {
      nodes.push({
        type: "item",
        rawValue: data,
        key: getKey(data),
        textValue: getTextValue(data),
        disabled: getDisabled(data),
        level,
        index,
      });
      index++;
    }
  }

  return nodes;
}
