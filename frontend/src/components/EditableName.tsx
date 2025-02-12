import { useEffect, useState } from "react";
import { Pencil } from "../icons/pencil";
import Cookies from "js-cookie";
import { generateRandomName } from "../helpers/generateRandomName";

const EditableName = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    Cookies.set("name", name, {
      sameSite: "strict",
      expires: 3650,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex items-baseline space-x-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-base-800 text-base-400 px-2 py-2 border border-base-700 rounded outline-none"
          autoFocus
        />
        <button type="submit" className="text-base-400">
          Save
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-row items-baseline space-x-2">
      <h1 className="text-base-400">{name}</h1>
      <button className="stroke-base-400" onClick={() => setIsEditing(true)}>
        <Pencil />
      </button>
    </div>
  );
};

export default EditableName;
