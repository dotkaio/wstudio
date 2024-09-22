import { useStore } from "@nanostores/react";
import type { Assets } from "@webstudio-is/sdk";
import { Image as WebstudioImage } from "@webstudio-is/image";
import { styled, theme } from "@webstudio-is/design-system";
import {
  StyleValue,
  toValue,
  type StyleProperty,
} from "@webstudio-is/css-engine";
import { $assets, $imageLoader } from "~/shared/nano-states";
import brokenImage from "~/shared/images/broken-image-placeholder.svg";
import { toPascalCase } from "../../shared/keyword-utils";
import { useComputedStyles } from "../../shared/model";
import { getRepeatedStyleItem } from "../../shared/repeated-style";

export const repeatedProperties = [
  "backgroundImage",
  "backgroundAttachment",
  "backgroundClip",
  "backgroundOrigin",
  "backgroundPositionX",
  "backgroundPositionY",
  "backgroundRepeat",
  "backgroundSize",
  "backgroundBlendMode",
] satisfies [StyleProperty, ...StyleProperty[]];

const Thumbnail = styled("div", {
  borderRadius: 2,
  borderWidth: 0,
  width: theme.spacing[10],
  height: theme.spacing[10],
});

const NoneThumbnail = styled(Thumbnail, {
  background:
    "repeating-conic-gradient(rgba(0,0,0,0.22) 0% 25%, transparent 0% 50%) 0% 33.33% / 40% 40%",
});

const StyledWebstudioImage = styled(WebstudioImage, {
  position: "relative",
  width: theme.spacing[10],
  height: theme.spacing[10],
  objectFit: "contain",

  // This is shown only if an image was not loaded and broken
  // From the spec:
  // - The pseudo-elements generated by ::before and ::after are contained by the element's formatting box,
  //   and thus don't apply to "replaced" elements such as <img>, or to <br> elements
  // Not in spec but supported by all browsers:
  // - broken image is not a "replaced" element so this style is applied
  "&::after": {
    content: "' '",
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${brokenImage})`,
  },
});

const gradientNames = [
  "conic-gradient",
  "linear-gradient",
  "radial-gradient",
  "repeating-conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
];

export const getBackgroundLabel = (
  backgroundImageStyle: StyleValue,
  assets: Assets
) => {
  if (
    backgroundImageStyle?.type === "image" &&
    backgroundImageStyle.value.type === "asset"
  ) {
    const asset = assets.get(backgroundImageStyle.value.value);
    if (asset) {
      return asset.name;
    }
  }

  if (
    backgroundImageStyle?.type === "image" &&
    backgroundImageStyle.value.type === "url"
  ) {
    return backgroundImageStyle.value.url;
  }

  if (backgroundImageStyle?.type === "unparsed") {
    const gradientName = gradientNames.find((name) =>
      backgroundImageStyle.value.includes(name)
    );

    return gradientName ? toPascalCase(gradientName) : "Gradient";
  }

  return "None";
};

type RepeatedProperty = (typeof repeatedProperties)[number];

export const BackgroundThumbnail = ({ index }: { index: number }) => {
  const assets = useStore($assets);
  const imageLoader = useStore($imageLoader);
  const styles = useComputedStyles(repeatedProperties);
  const [backgroundImage] = styles;
  const backgroundImageValue = getRepeatedStyleItem(
    backgroundImage.cascadedValue,
    index
  );

  if (
    backgroundImageValue?.type === "image" &&
    backgroundImageValue.value.type === "asset"
  ) {
    const asset = assets.get(backgroundImageValue.value.value);
    if (asset === undefined) {
      return null;
    }
    return (
      <StyledWebstudioImage
        key={asset.id}
        loader={imageLoader}
        src={asset.name}
        width={theme.spacing[10]}
        optimize={true}
      />
    );
  }

  if (
    backgroundImageValue?.type === "image" &&
    backgroundImageValue.value.type === "url"
  ) {
    return (
      <StyledWebstudioImage
        key={backgroundImageValue.value.url}
        loader={imageLoader}
        src={backgroundImageValue.value.url}
        width={theme.spacing[10]}
        optimize={true}
      />
    );
  }

  if (backgroundImageValue?.type === "unparsed") {
    const cssStyle: { [property in RepeatedProperty]?: string } = {};
    for (const { property, cascadedValue } of styles) {
      const value = getRepeatedStyleItem(cascadedValue, index);
      cssStyle[property as RepeatedProperty] = toValue(value);
    }
    return <Thumbnail css={cssStyle} />;
  }

  return <NoneThumbnail />;
};