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
import StatefulPage from "./pages/StatefulPage";
import DaemonsPage from "./pages/DaemonsPage";
import EventsPage from "./pages/EventsPage";
import ServicesPage from "./pages/ServicesPage";
import NodesPage from "./pages/NodesPage";
import PVPage from "./pages/PVPage";
import PVCPage from "./pages/PVCPage";
import StorageClassesPage from "./pages/StorageClassesPage";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Workload */}
          <Route path="/workload/pods" element={<PodsPage />} />
          <Route path="/workload/deployments" element={<DeploysPage />} />
          <Route path="/workload/replicasets" element={<ReplicasPage />} />
          <Route path="/workload/statefulsets" element={<StatefulPage />} />
          <Route path="/workload/daemonsets" element={<DaemonsPage />} />

          {/* Events */}
          <Route path="/events" element={<EventsPage />} />

          {/* Network */}
          <Route path="/network/services" element={<ServicesPage />} />

          {/* Nodes */}
          <Route path="/nodes" element={<NodesPage />} />

          {/* Storage */}
          <Route path="/storage/persistentvolumes" element={<PVPage />} />
          <Route path="/storage/persistentvolumeclaims" element={<PVCPage />} />
          <Route path="/storage/storageclasses" element={<StorageClassesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
