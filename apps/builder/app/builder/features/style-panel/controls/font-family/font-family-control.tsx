import {
  Combobox,
  EnhancedTooltip,
  Flex,
  NestedInputButton,
} from "@webstudio-is/design-system";
import { FontsManager } from "~/builder/shared/fonts-manager";
import { FloatingPanel } from "~/builder/shared/floating-panel";
import { forwardRef, useMemo, useState, type ComponentProps } from "react";
import { toValue } from "@webstudio-is/css-engine";
import { matchSorter } from "match-sorter";
import { useAssets } from "~/builder/shared/assets";
import { toItems } from "~/builder/shared/fonts-manager";
import { UploadIcon } from "@webstudio-is/icons";
import { styleConfigByName } from "../../shared/configs";
import { parseCssValue } from "@webstudio-is/css-data";
import { useComputedStyleDecl } from "../../shared/model";
import { setProperty } from "../../shared/use-style-data";

type Item = { value: string; label?: string };

const matchOrSuggestToCreate = (
  search: string,
  items: Array<Item>,
  itemToString: (item: Item) => string
): Array<Item> => {
  const matched = matchSorter(items, search, {
    keys: [itemToString],
  });

  if (
    search.trim() !== "" &&
    itemToString(matched[0]).toLocaleLowerCase() !==
      search.toLocaleLowerCase().trim()
  ) {
    matched.unshift({
      value: search.trim(),
      label: `Custom Font: "${search.trim()}"`,
    });
  }
  return matched;
};

export const FontFamilyControl = () => {
  const fontFamily = useComputedStyleDecl("fontFamily");
  const value = fontFamily.cascadedValue;
  const setValue = setProperty("fontFamily");
  const [intermediateValue, setIntermediateValue] = useState<
    string | undefined
  >();
  const { assetContainers } = useAssets("font");
  const items = useMemo(() => {
    const fallbacks = styleConfigByName("fontFamily").items;
    return [...toItems(assetContainers), ...fallbacks].map(({ label }) => ({
      value: label,
    }));
  }, [assetContainers]);

  const itemValue = useMemo(() => {
    // Replacing the quotes just to make it look cleaner in the UI
    return toValue(value, (value) => value).replace(/"/g, "");
  }, [value]);

  if (value.type !== "fontFamily") {
    return;
  }

  return (
    <Flex>
      <Combobox<Item>
        suffix={
          <FloatingPanel
            title="Fonts"
            content={
              <FontsManager
                value={value}
                onChange={(newValue = itemValue) => {
                  setValue({ type: "fontFamily", value: [newValue] });
                }}
              />
            }
          >
            <FontsManagerButton />
          </FloatingPanel>
        }
        defaultHighlightedIndex={0}
        items={items}
        itemToString={(item) => item?.label ?? item?.value ?? ""}
        onItemHighlight={(item) => {
          const value = item === null ? itemValue : item.value;
          setValue(
            { type: "fontFamily", value: [value] },
            { isEphemeral: true }
          );
        }}
        onItemSelect={(item) => {
          setValue(parseCssValue("fontFamily", item.value));
          setIntermediateValue(undefined);
        }}
        value={{ value: intermediateValue ?? itemValue }}
        onChange={(value) => {
          setIntermediateValue(value);
        }}
        onBlur={() => {
          setValue({
            type: "fontFamily",
            value: [itemValue],
          });
        }}
        match={matchOrSuggestToCreate}
      />
    </Flex>
  );
};

const FontsManagerButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof NestedInputButton>
>((props, ref) => {
  return (
    <Flex>
      <EnhancedTooltip content="Open Font Manager">
        <NestedInputButton {...props} ref={ref} tabIndex={-1}>
          <UploadIcon />
        </NestedInputButton>
      </EnhancedTooltip>
    </Flex>
  );
});
FontsManagerButton.displayName = "FontsManagerButton";