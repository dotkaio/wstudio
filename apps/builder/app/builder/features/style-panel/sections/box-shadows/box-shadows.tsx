import { colord, type RgbaColor } from "colord";
import {
  toValue,
  type StyleProperty,
  type StyleValue,
} from "@webstudio-is/css-engine";
import { RepeatedStyleSection } from "../../shared/style-section";
import { ShadowContent } from "../../shared/shadow-content";
import { useComputedStyleDecl } from "../../shared/model";
import {
  addRepeatedStyleItem,
  editRepeatedStyleItem,
  RepeatedStyle,
} from "../../shared/repeated-style";
import { parseCssFragment } from "../../shared/parse-css-fragment";

export const properties = ["boxShadow"] satisfies [
  StyleProperty,
  ...StyleProperty[],
];

const property: StyleProperty = properties[0];
const label = "Box Shadows";
const initialBoxShadow = "0px 2px 5px 0px rgba(0, 0, 0, 0.2)";

const getItemProps = (_index: number, layer: StyleValue) => {
  const values = layer.type === "tuple" ? layer.value : [];
  const labels = [];
  let color: RgbaColor | undefined;
  let isInset = false;

  for (const item of values) {
    if (item.type === "rgb") {
      color = colord(toValue(item)).toRgb();
      continue;
    }
    if (item.type === "keyword") {
      if (item.value === "inset") {
        isInset = true;
        continue;
      }
      if (colord(item.value).isValid()) {
        color = colord(item.value).toRgb();
        continue;
      }
    }
    labels.push(toValue(item));
  }

  if (isInset) {
    labels.unshift("Inner Shadow:");
  } else {
    labels.unshift("Outer Shadow:");
  }

  return { label: labels.join(" "), color };
};

export const Section = () => {
  const styleDecl = useComputedStyleDecl("boxShadow");

  return (
    <RepeatedStyleSection
      label={label}
      description="Adds shadow effects around an element's frame."
      properties={properties}
      onAdd={() => {
        addRepeatedStyleItem(
          [styleDecl],
          parseCssFragment(initialBoxShadow, "boxShadow")
        );
      }}
    >
      <RepeatedStyle
        label={label}
        styles={[styleDecl]}
        getItemProps={getItemProps}
        renderItemContent={(index, value) => (
          <ShadowContent
            index={index}
            layer={value}
            property={property}
            propertyValue={toValue(value)}
            onEditLayer={(index, value, options) => {
              editRepeatedStyleItem(
                [styleDecl],
                index,
                new Map([["boxShadow", value]]),
                options
              );
            }}
          />
        )}
      />
    </RepeatedStyleSection>
  );
};