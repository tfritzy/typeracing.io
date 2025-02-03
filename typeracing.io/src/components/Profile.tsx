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
      className="pl-2 bg-base-700 rounded border border-base-500 outline-none focus:border-accent"
      value={name}
      onChange={updateName}
    />
  );
};
