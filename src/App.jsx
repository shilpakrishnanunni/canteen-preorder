import { CartProvider } from "./contexts/CartContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => (
  <CartProvider>
    <AppRoutes />
  </CartProvider>
);

export default App;
