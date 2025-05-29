type SuccessMessageProps = {
  children: string;
};

export default function SuccessMessage({ children }: SuccessMessageProps) {
  return <p style={{ color: "darkgreen" }}>{children}</p>;
}
