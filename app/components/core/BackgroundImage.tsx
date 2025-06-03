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
      className="absolute inset-0 z-1 bg-cover bg-center bg-no-repeat responsive-background-image"
      aria-hidden="true"
      style={style}
    ></div>
  );
}
