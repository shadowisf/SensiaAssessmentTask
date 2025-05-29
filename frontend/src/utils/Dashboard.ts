import { generateStrongPassword } from "./generateStrongPassword";

type createUserProps = {
  email: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export async function createUser({
  email,
  setSuccess,
  setEmail,
  setError,
}: createUserProps) {
  try {
    const password = generateStrongPassword();
    const username = email.split("@")[0];

    const response = await fetch("http://localhost:8000/api/createUser/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const data = await response.json();

    setSuccess(data.message);
    setEmail("");
  } catch (err) {
    const msg = (err as Error).message;

    console.error(msg);

    setError(msg);
  }
}

type readUserProps = {
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export async function readUser({
  setUsername,
  setFirstName,
  setLastName,
  setError,
}: readUserProps) {
  try {
    const response = await fetch("http://localhost:8000/api/readUser/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to read user");
    }

    const data = await response.json();

    setUsername(data.username);
    setFirstName(data.first_name);
    setLastName(data.last_name);
  } catch (err) {
    const msg = (err as Error).message;

    console.error(msg);

    setError(msg);
  }
}

type updateUserProps = {
  username: string;
  firstName: string;
  lastName: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export async function updateUser({
  username,
  firstName,
  lastName,
  setSuccess,
  setError,
}: updateUserProps) {
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
  }
}
