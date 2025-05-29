export function generateStrongPassword(length = 12): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";

  while (true) {
    password = Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");
    if (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return password;
    }
  }
}

type createUserProps = {
  email: string;
  setSuccess: (v: string) => void;
  setEmail: (v: string) => void;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
};

export async function createUser({
  email,
  setSuccess,
  setEmail,
  setError,
  setLoading,
}: createUserProps) {
  setError("");
  setSuccess("");

  setLoading(true);

  try {
    const password = generateStrongPassword();
    const full_name = email.split("@")[0];
    const role = "user";

    const response = await fetch("http://localhost:8000/api/createUser/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify({ email, full_name, password, role }),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    console.log(password);
    const data = await response.json();

    setSuccess(data.message);
    setEmail("");
  } catch (err) {
    const msg = (err as Error).message;

    console.error(msg);

    setError(msg);
  } finally {
    setLoading(false);
  }
}

export async function readSelfUser() {
  try {
    const response = await fetch("http://localhost:8000/api/readSelfUser/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to read user");
    }

    const data = await response.json();

    return { data, error: null };
  } catch (err) {
    const msg = (err as Error).message;

    console.error(msg);

    return { data: null, error: msg };
  }
}

type updateUserProps = {
  username: string;
  firstName: string;
  lastName: string;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
};

export async function updateUser({
  username,
  firstName,
  lastName,
  setSuccess,
  setError,
  setLoading,
}: updateUserProps) {
  setError("");
  setSuccess("");

  setLoading(true);

  try {
    const response = await fetch("http://localhost:8000/api/updateUser/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const data = await response.json();

    setSuccess(data.message);
  } catch (err) {
    const msg = (err as Error).message;

    console.error(msg);

    setError(msg);
  } finally {
    setLoading(false);
  }
}
