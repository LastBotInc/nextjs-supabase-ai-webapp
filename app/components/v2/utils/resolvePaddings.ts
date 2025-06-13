import { LayoutBlocksProps, Padding, PaddingType } from "../core/types";
import { hasVisualPalette } from "../styling/resolveStyles";

/**
 * Resolve paddings for main and content blocks.
 *
 * Parent of main block (PageWrapper) has gaps, so vertical spacing comes from gaps.
 * If main block has bg image or color, it has full padding.
 * Otherwise, it needs no padding.
 * If content block has bg image or color, it has full padding.
 * Otherwise, it has inline (x-axis) padding - unless main block already has it.
 *
 * If props already have padding, they are used as is.
 *
 * @param blockProps - The block properties.
 * @returns The resolved paddings.
 */
export function resolvePaddings(
  blockProps: LayoutBlocksProps,
): { main?: PaddingType; content?: PaddingType } {
  const hasMainBg = !!blockProps.mainImage ||
    hasVisualPalette(blockProps.palette);
  const hasContentBg = !!blockProps.contentImage ||
    hasVisualPalette(blockProps.contentPalette);

  const result = {
    main: blockProps.padding,
    content: blockProps.contentPadding,
  };

  if (result.main && result.content) {
    return result;
  }

  if (hasMainBg && !hasContentBg) {
    return {
      main: result.main || Padding.Full,
      content: result.content || Padding.None,
    };
  }
  if (!hasMainBg && hasContentBg) {
    return {
      main: result.main || Padding.Block,
      content: result.content || Padding.Full,
    };
  }
  if (!hasMainBg && !hasContentBg) {
    return {
      main: result.main || Padding.Block,
      content: result.content || Padding.Full,
    };
  }
  return {
    main: result.main || Padding.None,
    content: result.content || Padding.Inline,
  };
}
