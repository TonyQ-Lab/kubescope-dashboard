import React from "react";

export default function Home() {
  return (
    <main>
      <h1>Hello world</h1>
      <p>Back-end runs at {process.env.REACT_APP_API}</p>
    </main>
  );
}
