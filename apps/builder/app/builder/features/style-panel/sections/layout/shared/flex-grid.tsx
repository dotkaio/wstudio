import type { CSSProperties } from "react";
import { Box, Flex, Grid, IconButton } from "@webstudio-is/design-system";
import { toValue } from "@webstudio-is/css-engine";
import { DotIcon } from "@webstudio-is/icons";
import { theme } from "@webstudio-is/design-system";
import { useComputedStyles } from "../../../shared/model";
import { getPriorityStyleValueSource } from "../../../property-label";
import { createBatchUpdate } from "../../../shared/use-style-data";

// Sometimes we need to hide a dot that ends up at an end
// of a line and visually extends it
const shouldHideDot = ({
  x,
  y,
  justifyContent,
  alignItems,
}: {
  x: number;
  y: number;
  justifyContent: string;
  alignItems: string;
}) => {
  if (justifyContent === "space-between") {
    if (alignItems === "start" || alignItems === "baseline") {
      return x === 2 && y === 0;
    }
    if (alignItems === "end") {
      return x === 2 && y === 2;
    }
  }

  return false;
};

export const FlexGrid = () => {
  const styles = useComputedStyles([
    "flexDirection",
    "justifyContent",
    "alignItems",
  ]);
  const styleValueSourceColor = getPriorityStyleValueSource(styles);
  const [flexDirection, justifyContent, alignItems] = styles;
  const flexDirectionValue = toValue(flexDirection.cascadedValue);
  const justifyContentValue = toValue(justifyContent.cascadedValue);
  const alignItemsValue = toValue(alignItems.cascadedValue);
  const alignment = ["start", "center", "end"];
  const gridSize = alignment.length;
  const isFlexDirectionColumn =
    flexDirectionValue === "column" || flexDirectionValue === "column-reverse";

  let color = theme.colors.foregroundFlexUiMain;
  if (styleValueSourceColor === "local") {
    color = theme.colors.borderLocalFlexUi;
  }
  if (styleValueSourceColor === "overwritten") {
    color = theme.colors.borderOverwrittenFlexUi;
  }
  if (styleValueSourceColor === "remote") {
    color = theme.colors.borderRemoteFlexUi;
  }

  const addjustLinesPadding = (padding: number | undefined) => {
    if (padding === undefined) {
      return {};
    }
    return isFlexDirectionColumn
      ? { paddingTop: padding, paddingBottom: padding }
      : { paddingLeft: padding, paddingRight: padding };
  };

  return (
    <Grid
      tabIndex={0}
      css={{
        width: 72,
        height: 72,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius[4],
        background: theme.colors.backgroundControls,
        alignItems: "center",
        gap: 0,
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        color,
        outlineStyle: "solid",
        outlineWidth: styleValueSourceColor === "default" ? 1 : 2,
        outlineOffset: styleValueSourceColor === "default" ? -1 : -2,
        outlineColor: color,
        "&:focus-within": {
          outlineWidth: 2,
          outlineOffset: -2,
          outlineColor: theme.colors.borderLocalFlexUi,
        },
      }}
    >
      {Array.from(Array(gridSize * gridSize), (_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        // grid edges starts with 1
        let gridColumn = `${x + 1} / ${x + 2}`;
        let gridRow = `${y + 1} / ${y + 2}`;
        if (isFlexDirectionColumn) {
          [gridColumn, gridRow] = [gridRow, gridColumn];
        }
        return (
          <Flex
            key={index}
            justify="center"
            align="center"
            css={{
              width: "100%",
              height: "100%",
              gridColumn,
              gridRow,
            }}
          >
            <IconButton
              tabIndex={-1}
              css={{
                width: "100%",
                height: "100%",
                color: theme.colors.foregroundFlexUiMain,
                "&:hover": {
                  // @todo not clear which token to use here
                  background: theme.colors.slate4,
                },
                "&:focus": {
                  background: "none",
                  boxShadow: "none",
                  outline: "none",
                },
              }}
              onClick={() => {
                const justifyContent = alignment[x];
                const alignItems = alignment[y];
                const batch = createBatchUpdate();
                batch.setProperty("alignItems")({
                  type: "keyword",
                  value: alignItems,
                });
                batch.setProperty("justifyContent")({
                  type: "keyword",
                  value: justifyContent,
                });
                batch.publish();
              }}
            >
              {shouldHideDot({
                x,
                y,
                justifyContent: justifyContentValue,
                alignItems: alignItemsValue,
              }) === false && <DotIcon />}
            </IconButton>
          </Flex>
        );
      })}

      <Flex
        css={{
          width: "100%",
          height: "100%",
          gridArea: "-1 / -1 / 1 / 1", // fill whole grid
          p: 2,
          gap: 2,
          pointerEvents: "none",
        }}
        style={{
          flexDirection: flexDirectionValue as CSSProperties["flexDirection"],
          justifyContent: justifyContentValue,
          alignItems: alignItemsValue,
          ...addjustLinesPadding(
            justifyContentValue === "space-between"
              ? 8
              : justifyContentValue === "space-around"
                ? 14.5
                : undefined
          ),
        }}
      >
        {[11, 16, 9].map((size) => (
          <Box
            key={size}
            css={{
              borderRadius: theme.borderRadius[1],
              backgroundColor: "currentColor",
              ...(isFlexDirectionColumn
                ? { minWidth: size, minHeight: 4 }
                : { minWidth: 4, minHeight: size }),
            }}
          />
        ))}
      </Flex>
    </Grid>
  );
};