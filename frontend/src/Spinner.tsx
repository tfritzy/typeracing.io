import React from "react";

const generateRandomString = (length: number) => {
 let result = "";
 for (let i = 0; i < length; i++) {
  const randomChar = String.fromCharCode(
   Math.floor(Math.random() * 26) + 97
  );
  result += randomChar;
 }
 return result;
};

const generateStartingString = () => {
 const length1 = Math.floor(Math.random() * 6) + 4; // random length between 1 and 10
 const length2 = Math.floor(Math.random() * 6) + 4; // random length between 1 and 10
 return (
  generateRandomString(length1) +
  " " +
  generateRandomString(length2)
 );
};

export const Spinner = () => {
 const [str, setStr] = React.useState<string>(
  generateStartingString()
 );

 React.useEffect(() => {
  const scramble = (str: string) => {
   let index = Math.floor(Math.random() * str.length);
   const spaceIndex = str.indexOf(" ");
   if (index === spaceIndex) index += 1;
   const newChar = String.fromCharCode(
    Math.floor(Math.random() * 26) + 97
   );

   return (
    str.substr(0, index) + newChar + str.substr(index + 1)
   );
  };

  const scrambleNLetters = (n: number, str: string) => {
   let finalString = str;
   for (let i = 0; i < n; i++) {
    finalString = scramble(finalString);
   }

   return finalString;
  };

  const intervalId = setInterval(() => {
   setStr((prevString) => scrambleNLetters(2, prevString));
  }, 5);

  return () => clearInterval(intervalId);
 }, []);

 return <span className="">{str}</span>;
};
