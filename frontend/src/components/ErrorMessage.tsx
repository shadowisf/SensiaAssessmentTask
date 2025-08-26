type ErrorMessageProps = {
  children: string;
};

export default function ErrorMessage({ children }: ErrorMessageProps) {
  return <p style={{ color: "red" }}>{children}</p>;
}
