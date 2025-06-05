/**
 * BackgroundImage is a component that is used to display a background image.
 *
 * It accepts only its own props:
 *
 * - src - The source of the background image.
 * - backgroundPosition - The position of the background image.
 * - backgroundSize - The size of the background image.
 *
 * backgroundPosition and size can be a string or a SizeDefinition object.
 * Example:
 *  backgroundPosition: "top"
 *  backgroundPosition: {default: "top", md: "center", lg: "bottom", xl: "center"}
 *
 * @param src - The source of the background image.
 * @param backgroundPosition - The position of the background image.
 * @param backgroundSize - The size of the background image.
 * @returns React.ReactNode
 */
type SizeDefinition = {
  default: string;
  md?: string;
  lg?: string;
  xl?: string;
};

export type BackgroundImageProps = {
  src: string;
  backgroundPosition?: string | SizeDefinition;
  backgroundSize?: string | SizeDefinition;
};

const sizeDefinitionToStyle = (prefix: string, sizeDefinition: SizeDefinition | string): React.CSSProperties => {
  if (typeof sizeDefinition === "string") {
    return {
      [`--${prefix}`]: sizeDefinition,
    };
  }
  return Object.entries(sizeDefinition).reduce((acc, [key, value]) => {
    if (value && key) {
      const cssKey = `--${prefix}-${key}` as keyof React.CSSProperties;
      acc[cssKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
};

export function BackgroundImage({ src, backgroundPosition, backgroundSize }: BackgroundImageProps) {
  let style = {
    "--image": `url("${src}")`,
  } as React.CSSProperties;

  if (backgroundPosition) {
    style = {
      ...style,
      ...sizeDefinitionToStyle("position", backgroundPosition),
    };
  }
  if (backgroundSize) {
    style = {
      ...style,
      ...sizeDefinitionToStyle("size", backgroundSize),
    };
  }
  return (
    <div
      className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat responsive-background-image"
      aria-hidden="true"
      style={style}
    ></div>
  );
}
