import React, { useState } from "react";
import Cookies from "js-cookie";
import { generateRandomName } from "../helpers/generateRandomName";

export const Profile = () => {
  const [name, setName] = useState<string>("");

  React.useEffect(() => {
    let name = Cookies.get("name");
    if (!name) {
      name = generateRandomName();
      setName(name);
      Cookies.set("name", name, {
        sameSite: "strict",
        expires: 3650,
      });
    } else {
      setName(name);
    }
  }, []);

  const updateName = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      Cookies.set("name", e.target.value, {
        sameSite: "strict",
        expires: 3650,
      });
    },
    []
  );

  return (
    <input
      className="pl-2 p-1 bg-base-700 rounded-md border border-base-500 focus:outline outline-accent"
      value={name}
      onChange={updateName}
    />
  );
};
