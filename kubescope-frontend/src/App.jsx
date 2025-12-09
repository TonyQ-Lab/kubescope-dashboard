import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import PodsPage from "./pages/PodsPage";
import Layout from "./Layout";
import DeploysPage from "./pages/DeploysPage";
import ReplicasPage from "./pages/ReplicasPage";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workload/pods" element={<PodsPage />} />
          <Route path="/workload/deployments" element={<DeploysPage />} />
          <Route path="/workload/replicasets" element={<ReplicasPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
