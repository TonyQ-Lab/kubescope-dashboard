import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import PodsPage from "./pages/PodsPage";
import Layout from "./Layout";


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workload/pods" element={<PodsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
