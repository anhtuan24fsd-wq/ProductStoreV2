import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Productpage from "./pages/Productpage";

function App() {
  return (
    <div>
      {/* Định tuyến cho các trang trong ứng dụng */}
      <Routes>
        {/* Trang chủ - đường dẫn gốc */}
        <Route path="/" element={<Homepage />} />
        {/* Trang chi tiết sản phẩm - đường dẫn động với tham số id */}
        <Route path="/product/:id" element={<Productpage />} />
      </Routes>
    </div>
  );
}

export default App;
