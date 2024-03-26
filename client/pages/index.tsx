import React, { useEffect, useState } from "react";

function index() {
  const [message, setMessage] = useState("Loading");

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data && data.message) {
          setMessage(data.message);
        } else {
          throw new Error("Invalid data structure");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("Error occurred while fetching data");
      });
  }, []);

  return <div>{message}</div>;
}

export default index;
