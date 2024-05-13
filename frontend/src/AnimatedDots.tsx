import React from "react";

export const AnimatedDots = () => {
 const [dots, setDots] = React.useState(".");

 React.useEffect(() => {
  const interval = setInterval(() => {
   setDots((dots) => {
    if (dots.length === 3) {
     return ".";
    } else {
     return dots + "";
    }
   });
  }, 800);

  return () => {
   clearInterval(interval);
  };
 }, []);

 return <span>{dots}</span>;
};
