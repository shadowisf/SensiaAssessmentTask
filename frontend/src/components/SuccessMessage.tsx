import { useState, useEffect } from "react";

type SuccessMessageProps = {
  children: string;
};

export default function SuccessMessage({ children }: SuccessMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return <p style={{ color: "darkgreen" }}>{children}</p>;
}
