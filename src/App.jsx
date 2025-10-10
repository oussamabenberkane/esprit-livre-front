import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllBooks from './pages/AllBooks';
import HomePage from './pages/homePage';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen min-w-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/allbooks" element={<AllBooks />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;