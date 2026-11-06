export const getData = async (
  url: string,
  email: string,
  password: string,
): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("User Sign In Failed");
    }

    return await response.json();
  } catch (error) {
    throw new Error("User Sign In Failed");
  }
};
