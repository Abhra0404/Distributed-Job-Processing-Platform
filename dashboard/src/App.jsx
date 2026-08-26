import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import SubmitJob from "./pages/SubmitJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route
            path="/jobs/:id"
            element={<JobDetails />}
          />
          <Route
            path="/submit"
            element={<SubmitJob />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;