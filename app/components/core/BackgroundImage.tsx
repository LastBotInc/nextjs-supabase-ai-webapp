export type BackgroundImageProps = {
  src: string;
};

export function BackgroundImage({ src }: BackgroundImageProps) {
  const bgStyles = {
    backgroundImage: `url("${src}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return <div className="absolute inset-0 z-1" aria-hidden="true" style={bgStyles}></div>;
}
