import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-minimal">
        <div className="footer-mark">
          <ShoppingBag size={16} />
          <span>ShopEasy</span>
        </div>

        <nav className="footer-links-inline" aria-label="Footer navigation">
          <Link to="/products">Products</Link>
          <Link to="/cart">Bag</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/orders">Orders</Link>
        </nav>

        <div className="footer-credit">
          <span>Harsh Yadav · 10756</span>
          <span>© {new Date().getFullYear()} ShopEasy</span>
        </div>
      </div>
    </footer>
  );
}
