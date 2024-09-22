import { Box } from "../../box";
import { css, theme } from "../../../stitches.config";
import {
  type ChildrenOrientation,
  type Placement,
  getPlacementBetween,
  getPlacementInside,
  getPlacementNextTo,
  type Rect,
} from "./geometry-utils";
import { defaultGetValidChildren, type DropTarget } from "./use-drop";

const placementStyle = css({
  boxSizing: "content-box",
  position: "absolute",
  background: theme.colors.blue10,
  pointerEvents: "none",
});

const getRect = (placement: Placement) => {
  if (placement.direction === "horizontal") {
    return {
      top: placement.y - 1,
      left: placement.x,
      width: placement.length,
      height: 2,
    };
  }
  return {
    top: placement.y,
    left: placement.x - 1,
    width: 2,
    height: placement.length,
  };
};

const applyScale = (rect: Rect, scale: number) => {
  // Calculate in the "scale" that is applied to the canvas
  const scaleFactor = scale / 100;
  return {
    top: rect.top * scaleFactor,
    left: rect.left * scaleFactor,
    width: rect.width * scaleFactor,
    height: rect.height,
  };
};

export const PlacementIndicator = ({
  placement,
  scale = 100,
}: {
  placement: Placement;
  scale?: number;
}) => {
  return (
    <Box
      data-placement-indicator
      style={applyScale(getRect(placement), scale)}
      className={placementStyle()}
    />
  );
};

type PlacementIndicatorOptions = {
  placement: DropTarget<unknown>["placement"];
  element: Element;

  // Allows you to customize children
  // that will be used to determine placement and indexWithinChildren
  getValidChildren?: (parent: Element) => Element[] | HTMLCollection;

  // Distance from an edge when placement is put next to an element edge
  placementPadding?: number;

  // If not provided, will be guessed automatically based
  // on the actual orientation of the children
  childrenOrientation?: ChildrenOrientation;
};

export const computeIndicatorPlacement = (
  options: PlacementIndicatorOptions
) => {
  const {
    placement,
    element,
    getValidChildren = defaultGetValidChildren,
  } = options;
  const parentRect = element.getBoundingClientRect();
  const children = getValidChildren(element);
  const { closestChildIndex, indexAdjustment, childrenOrientation } = placement;

  const closestChildRect: undefined | DOMRect =
    children[closestChildIndex]?.getBoundingClientRect();

  const neighbourChildIndex =
    indexAdjustment === 0 ? closestChildIndex - 1 : closestChildIndex + 1;
  const neighbourChildRect: undefined | DOMRect =
    children[neighbourChildIndex]?.getBoundingClientRect();

  let placementIndicator = getPlacementBetween(
    parentRect,
    closestChildRect,
    neighbourChildRect
  );

  // If childrenOrientation is set explicitly, we want to honor it:
  // discard placement generated by getPlacementBetween if it has wrong direction
  if (
    options.childrenOrientation !== undefined &&
    placementIndicator !== undefined &&
    placementIndicator.direction === options.childrenOrientation.type
  ) {
    placementIndicator = undefined;
  }

  if (placementIndicator === undefined) {
    placementIndicator = getPlacementNextTo(
      parentRect,
      closestChildRect,
      childrenOrientation,
      indexAdjustment > 0 ? "forward" : "backward",
      options.placementPadding
    );
  }

  if (placementIndicator === undefined) {
    placementIndicator = getPlacementInside(
      parentRect,
      childrenOrientation,
      options.placementPadding
    );
  }

  return placementIndicator;
};