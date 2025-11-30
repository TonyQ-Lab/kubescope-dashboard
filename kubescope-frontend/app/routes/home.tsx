import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "KubeScope" },
    { name: "description", content: "A Kubernetes Dashboard" },
  ];
}

export default function Home() {
  return (
    <main>
      <h1>Hello world</h1>
    </main>
  );
}
