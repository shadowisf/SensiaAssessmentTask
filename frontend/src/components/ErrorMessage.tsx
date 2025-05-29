import { useEffect, useState } from "react";

type ErrorMessageProps = {
  children: string;
};

export default function ErrorMessage({ children }: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return <p style={{ color: "red" }}>{children}</p>;
}
