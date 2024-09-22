import { useMemo } from "react";
import type { RgbaColor } from "colord";
import type {
  LayersValue,
  StyleProperty,
  StyleValue,
  TupleValue,
  UnparsedValue,
} from "@webstudio-is/css-engine";
import {
  EyeconClosedIcon,
  EyeconOpenIcon,
  SubtractIcon,
} from "@webstudio-is/icons";
import {
  CssValueListArrowFocus,
  CssValueListItem,
  Flex,
  Label,
  SmallIconButton,
  SmallToggleButton,
  useSortable,
} from "@webstudio-is/design-system";
import { FloatingPanel } from "~/builder/shared/floating-panel";
import { repeatUntil } from "~/shared/array-utils";
import type { ComputedStyleDecl } from "~/shared/style-object-model";
import { createBatchUpdate, type StyleUpdateOptions } from "./use-style-data";
import { ColorThumb } from "./color-thumb";
import { properties } from "@webstudio-is/css-data";

export const getRepeatedStyleItem = (styleValue: StyleValue, index: number) => {
  if (styleValue.type === "layers" || styleValue.type === "tuple") {
    return styleValue.value[index % styleValue.value.length];
  }
};

type ItemType = "layers" | "tuple";

const normalizeStyleValue = (
  styleDecl: ComputedStyleDecl,
  primaryValue: StyleValue,
  itemType: ItemType = primaryValue.type === "tuple" ? "tuple" : "layers"
) => {
  const primaryItemsCount =
    primaryValue.type === itemType ? primaryValue.value.length : 0;
  const value = styleDecl.cascadedValue;
  const items = value.type === itemType ? value.value : [];
  // prefill initial value when no items to repeated
  if (items.length === 0 && primaryItemsCount > 0) {
    const meta = properties[styleDecl.property as keyof typeof properties];
    items.push(meta.initial);
  }
  return {
    type: itemType,
    value: repeatUntil(items, primaryItemsCount),
  } as TupleValue | LayersValue;
};

export const addRepeatedStyleItem = (
  styles: ComputedStyleDecl[],
  newItems: Map<StyleProperty, StyleValue>
) => {
  const batch = createBatchUpdate();
  const currentStyles = new Map(
    styles.map((styleDecl) => [styleDecl.property, styleDecl])
  );
  const primaryValue = styles[0].cascadedValue;
  for (const [property, value] of newItems) {
    if (value.type !== "layers" && value.type !== "tuple") {
      continue;
    }
    // infer type from new items
    // because current values could be css wide keywords
    const itemType: ItemType = value.type;
    const styleDecl = currentStyles.get(property);
    if (styleDecl === undefined) {
      continue;
    }
    const newValue = normalizeStyleValue(styleDecl, primaryValue, itemType);
    if (value.type !== itemType) {
      console.error(
        `Unexpected item type "${value.type}" for ${property} repeated value`
      );
      continue;
    }
    newValue.value.push(...(value.value as UnparsedValue[]));
    batch.setProperty(property)(newValue);
  }
  batch.publish();
};

export const editRepeatedStyleItem = (
  styles: ComputedStyleDecl[],
  index: number,
  newItems: Map<StyleProperty, StyleValue>,
  options?: StyleUpdateOptions
) => {
  const batch = createBatchUpdate();
  const currentStyles = new Map(
    styles.map((styleDecl) => [styleDecl.property, styleDecl])
  );
  const primaryValue = styles[0].cascadedValue;
  for (const [property, value] of newItems) {
    const styleDecl = currentStyles.get(property);
    if (styleDecl === undefined) {
      continue;
    }
    const newValue = normalizeStyleValue(styleDecl, primaryValue);
    if (value.type !== newValue.type) {
      console.error(
        `Unexpected item type "${value.type}" for ${property} repeated value`
      );
      continue;
    }
    newValue.value.splice(index, 1, ...value.value);
    batch.setProperty(property)(newValue);
  }
  batch.publish(options);
};

export const setRepeatedStyleItem = (
  styleDecl: ComputedStyleDecl,
  index: number,
  newItem: StyleValue,
  options?: StyleUpdateOptions
) => {
  const batch = createBatchUpdate();
  const value = styleDecl.cascadedValue;
  const valueType: ItemType = value.type === "tuple" ? "tuple" : "layers";
  const oldItems = value.type === valueType ? value.value : [];
  const newItems: StyleValue[] = repeatUntil(oldItems, index);
  // unpack item when layers or tuple is provided
  newItems[index] = newItem.type === valueType ? newItem.value[0] : newItem;
  batch.setProperty(styleDecl.property as StyleProperty)({
    type: valueType,
    value: newItems as UnparsedValue[],
  });
  batch.publish(options);
};

export const deleteRepeatedStyleItem = (
  styles: ComputedStyleDecl[],
  index: number
) => {
  const batch = createBatchUpdate();
  const primaryValue = styles[0].cascadedValue;
  for (const styleDecl of styles) {
    const newValue = normalizeStyleValue(styleDecl, primaryValue);
    newValue.value.splice(index, 1);
    if (newValue.value.length > 0) {
      batch.setProperty(styleDecl.property as StyleProperty)(newValue);
    } else {
      // delete empty layers or tuple
      batch.deleteProperty(styleDecl.property as StyleProperty);
    }
  }
  batch.publish();
};

export const toggleRepeatedStyleItem = (
  styles: ComputedStyleDecl[],
  index: number
) => {
  const batch = createBatchUpdate();
  const primaryValue = styles[0].cascadedValue;
  for (const styleDecl of styles) {
    const newValue = normalizeStyleValue(styleDecl, primaryValue);
    newValue.value[index] = {
      ...newValue.value[index],
      hidden: false === (newValue.value[index].hidden ?? false),
    };
    batch.setProperty(styleDecl.property as StyleProperty)(newValue);
  }
  batch.publish();
};

export const swapRepeatedStyleItems = (
  styles: ComputedStyleDecl[],
  oldIndex: number,
  newIndex: number
) => {
  const batch = createBatchUpdate();
  const primaryValue = styles[0].cascadedValue;
  for (const styleDecl of styles) {
    const newValue = normalizeStyleValue(styleDecl, primaryValue);
    // You can swap only if there are at least two layers
    // As we are checking across multiple properties, we can't be sure
    // which property don't have two layers so we are checking here.
    if (newValue.value.length >= 2) {
      const oldItem = newValue.value[oldIndex];
      newValue.value.splice(oldIndex, 1);
      newValue.value.splice(newIndex, 0, oldItem);
    }
    batch.setProperty(styleDecl.property as StyleProperty)(newValue);
  }
  batch.publish();
};

export const RepeatedStyle = (props: {
  label: string;
  styles: ComputedStyleDecl[];
  getItemProps: (
    index: number,
    primaryValue: StyleValue
  ) => { label: string; color?: RgbaColor };
  renderThumbnail?: (index: number, primaryValue: StyleValue) => JSX.Element;
  renderItemContent: (index: number, primaryValue: StyleValue) => JSX.Element;
}) => {
  const { label, styles, getItemProps, renderThumbnail, renderItemContent } =
    props;
  // first property should describe the amount of layers or tuple items
  const primaryValue = styles[0].cascadedValue;
  const primaryItems =
    primaryValue.type === "layers" || primaryValue.type === "tuple"
      ? primaryValue.value
      : [];

  const sortableItems = useMemo(
    () =>
      Array.from(Array(primaryItems.length), (_, index) => ({
        id: String(index),
        index,
      })),
    [primaryItems.length]
  );

  const { dragItemId, placementIndicator, sortableRefCallback } = useSortable({
    items: sortableItems,
    onSort: (newIndex, oldIndex) =>
      swapRepeatedStyleItems(styles, oldIndex, newIndex),
  });

  if (primaryItems.length === 0) {
    return;
  }

  return (
    <CssValueListArrowFocus dragItemId={dragItemId}>
      <Flex direction="column" ref={sortableRefCallback}>
        {primaryItems.map((primaryValue, index) => {
          const id = String(index);
          const { label: itemLabel, color: itemColor } = getItemProps(
            index,
            primaryValue
          );
          return (
            <FloatingPanel
              key={index}
              title={label}
              // Background Panel is big, and the size differs when the tabs are changed.
              // This results in the panel moving around when the tabs are changed.
              // And sometimes, the tab moves away from the cursor,
              // when the content change happens on the top.
              // This is a workaround to prevent the panel from moving around
              // too much when the tabs are changed from the popover trigger.
              align="center"
              collisionPadding={{ bottom: 200, top: 200 }}
              content={renderItemContent(index, primaryValue)}
            >
              <CssValueListItem
                id={id}
                draggable={true}
                active={dragItemId === id}
                index={index}
                label={<Label truncate>{itemLabel}</Label>}
                hidden={primaryValue.hidden}
                thumbnail={
                  renderThumbnail?.(index, primaryValue) ??
                  (itemColor && <ColorThumb color={itemColor} />)
                }
                buttons={
                  <>
                    <SmallToggleButton
                      variant="normal"
                      pressed={primaryValue.hidden}
                      disabled={false}
                      tabIndex={-1}
                      onPressedChange={() =>
                        toggleRepeatedStyleItem(styles, index)
                      }
                      icon={
                        primaryValue.hidden ? (
                          <EyeconClosedIcon />
                        ) : (
                          <EyeconOpenIcon />
                        )
                      }
                    />
                    <SmallIconButton
                      variant="destructive"
                      tabIndex={-1}
                      icon={<SubtractIcon />}
                      onClick={() => deleteRepeatedStyleItem(styles, index)}
                    />
                  </>
                }
              />
            </FloatingPanel>
          );
        })}
        {placementIndicator}
      </Flex>
    </CssValueListArrowFocus>
  );
};