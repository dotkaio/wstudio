import { Flex, Grid } from "@webstudio-is/design-system";
import type { StyleProperty, StyleValue } from "@webstudio-is/css-engine";
import { XAxisIcon, YAxisIcon, ZAxisIcon } from "@webstudio-is/icons";
import { propertySyntaxes } from "@webstudio-is/css-data";
import { CssValueInputContainer } from "../../shared/css-value-input";
import {
  setProperty,
  type StyleUpdateOptions,
} from "../../shared/use-style-data";
import { PropertyInlineLabel } from "../../property-label";
import { useComputedStyleDecl } from "../../shared/model";

const property: StyleProperty = "translate";

export const TranslatePanelContent = () => {
  const styleDecl = useComputedStyleDecl(property);
  const tuple =
    styleDecl.cascadedValue.type === "tuple"
      ? styleDecl.cascadedValue
      : undefined;
  const [translateX, translateY, translateZ] = tuple?.value ?? [];

  const setAxis = (
    axis: number,
    newValue: StyleValue,
    options?: StyleUpdateOptions
  ) => {
    if (tuple === undefined) {
      return;
    }

    // For individual translate properties, we are passing the property as translate.
    // This is sending back either tuple or a unit value when manually edited and when  scrub is used respectively.
    if (newValue.type === "tuple") {
      [newValue] = newValue.value;
    }
    if (newValue.type !== "unit") {
      newValue = { type: "unit", value: 0, unit: "px" };
    }

    const newTuple = structuredClone(tuple);
    newTuple.value[axis] = newValue;
    setProperty(property)(newTuple, options);
  };

  return (
    <Flex direction="column" gap={2}>
      <Grid
        gap={1}
        css={{ alignItems: "center", gridTemplateColumns: "auto 2fr 2fr" }}
      >
        <XAxisIcon />
        <PropertyInlineLabel
          label="Translate X"
          description={propertySyntaxes.translateX}
        />

        <CssValueInputContainer
          styleSource="local"
          property={property}
          value={translateX}
          keywords={[]}
          setValue={(newValue, options) => setAxis(0, newValue, options)}
          deleteProperty={() => {}}
        />
      </Grid>
      <Grid
        gap={1}
        css={{ alignItems: "center", gridTemplateColumns: "auto 2fr 2fr" }}
      >
        <YAxisIcon />
        <PropertyInlineLabel
          label="Translate Y"
          description={propertySyntaxes.translateY}
        />
        <CssValueInputContainer
          styleSource="local"
          property={property}
          value={translateY}
          keywords={[]}
          setValue={(newValue, options) => setAxis(1, newValue, options)}
          deleteProperty={() => {}}
        />
      </Grid>
      <Grid
        gap={1}
        css={{ alignItems: "center", gridTemplateColumns: "auto 1fr 1fr" }}
      >
        <ZAxisIcon />
        <PropertyInlineLabel
          label="Translate Z"
          description={propertySyntaxes.translateZ}
        />
        <CssValueInputContainer
          styleSource="local"
          property={property}
          value={translateZ}
          keywords={[]}
          setValue={(newValue, options) => setAxis(2, newValue, options)}
          deleteProperty={() => {}}
        />
      </Grid>
    </Flex>
  );
};