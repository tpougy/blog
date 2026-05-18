import type { RehypePlugin } from "@astrojs/markdown-remark";
import { visit, SKIP } from "unist-util-visit";
import type { Element, Root } from "hast";

// Matches: image.light.png, diagram.dark.svg, photo.light.webp, etc.
const LIGHT_PATTERN = /^(.+)\.light(\.[^.]+)$/;
const DARK_PATTERN = /^(.+)\.dark(\.[^.]+)$/;

const rehypeThemeImages: RehypePlugin = () => {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || index === null || parent === null) {
        return;
      }

      const src = node.properties?.src as string | undefined;
      if (!src) return;

      const lightMatch = src.match(LIGHT_PATTERN);
      const darkMatch = src.match(DARK_PATTERN);

      let lightSrc: string;
      let darkSrc: string;

      if (lightMatch) {
        lightSrc = src;
        darkSrc = `${lightMatch[1]}.dark${lightMatch[2]}`;
      } else if (darkMatch) {
        darkSrc = src;
        lightSrc = `${darkMatch[1]}.light${darkMatch[2]}`;
      } else {
        // Not a themed image — pass through unchanged
        return;
      }

      const alt = node.properties?.alt as string | undefined;

      const lightImg: Element = {
        type: "element",
        tagName: "img",
        properties: {
          src: lightSrc,
          alt: alt ?? "",
          class: "theme-img-light",
        },
        children: [],
      };

      const darkImg: Element = {
        type: "element",
        tagName: "img",
        properties: {
          src: darkSrc,
          alt: alt ?? "",
          class: "theme-img-dark",
        },
        children: [],
      };

      // Replace the original img with two siblings.
      // CRITICAL: return [SKIP, index + 2] to avoid re-visiting newly inserted nodes.
      parent.children.splice(index, 1, lightImg, darkImg);
      return [SKIP, index + 2];
    });
  };
};

export default rehypeThemeImages;
