type ErrorMessageProps = {
  children: string;
};

export default function ErrorMessage({ children }: ErrorMessageProps) {
  return <div className="error-message">{children}</div>;
}
