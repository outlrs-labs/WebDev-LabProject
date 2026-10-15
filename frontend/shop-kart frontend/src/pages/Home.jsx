import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { ArrowRight, Check, Heart, Search, ShoppingBag } from 'lucide-react';
import { addToCartState } from '../features/cart/cartSlice';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const categories = ['Electronics', 'Fashion', 'Home', 'Books'];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8082/products')
      .then((res) => setFeaturedProducts((res.data?.products || []).slice(0, 8)))
      .catch((error) => console.error('Unable to load featured products:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/products?search=${encodeURIComponent(trimmedQuery)}` : '/products');
  };

  const handleAddToCart = async (product) => {
    dispatch(addToCartState({ ...product, quantity: 1 }));
    showToast(`Added "${product.name}" to your bag`, 'success');

    if (!user) return;

    try {
      await axios.post(
        `http://localhost:8082/cart/${product._id}`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Unable to sync the cart:', error);
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      showToast('Sign in to save items', 'info');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `http://localhost:8082/wishlist/${product._id}`,
        {},
        { withCredentials: true }
      );
      showToast(`Saved "${product.name}"`, 'success');
    } catch (error) {
      showToast(
        error.response?.status === 409 ? 'This item is already saved' : 'Unable to save this item',
        error.response?.status === 409 ? 'info' : 'error'
      );
    }
  };

  const leadProduct = featuredProducts[0];

  return (
    <div className="home-page-container">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <h1>Everyday goods, edited down.</h1>
            <p>
              A focused catalog of useful electronics, clothing, home objects, and books.
              Search once, compare clearly, and move on with your day.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>

            <nav className="home-category-links" aria-label="Product categories">
              <Link to="/products" className="active">All products</Link>
              {categories.map((category) => (
                <Link key={category} to={`/products?category=${category}`}>
                  {category}
                </Link>
              ))}
            </nav>
          </div>

          <div className="featured-workbench" aria-live="polite">
            {leadProduct ? (
              <>
                <Link to={`/products/${leadProduct._id}`} className="featured-workbench-image">
                  <img src={leadProduct.image} alt={leadProduct.name} />
                </Link>
                <div className="featured-workbench-info">
                  <div>
                    <span className="quiet-label">Featured</span>
                    <Link to={`/products/${leadProduct._id}`}>
                      <h2>{leadProduct.name}</h2>
                    </Link>
                    <p>{leadProduct.description}</p>
                  </div>
                  <div className="featured-workbench-actions">
                    <strong>₹{leadProduct.price.toLocaleString('en-IN')}</strong>
                    <button onClick={() => handleAddToCart(leadProduct)} className="btn btn-primary">
                      Add to bag <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="featured-workbench-empty">
                {loading ? 'Loading the catalog…' : 'The catalog is currently unavailable.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="catalog-preview section-padding">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Featured products</h2>
              <p className="section-subtitle">A quick view of what is currently in the catalog.</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              Browse catalog <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="catalog-state">Loading products…</div>
          ) : featuredProducts.length === 0 ? (
            <div className="catalog-state">No featured products are available.</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <article key={product._id} className="product-card">
                  <div className="product-image-box">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-card-img"
                      />
                    </Link>
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      className="product-wishlist-btn"
                      title="Save item"
                      aria-label={`Save ${product.name}`}
                    >
                      <Heart size={17} />
                    </button>
                    <span className="product-badge-category">{product.category}</span>
                  </div>

                  <div className="product-card-body">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="product-card-title">{product.name}</h3>
                    </Link>
                    <p className="product-card-desc">{product.description}</p>
                    <div className="product-card-pricing">
                      <span className="product-price-current">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="product-stock-tag stock-in">
                      <Check size={14} /> {product.stock} in stock
                    </div>
                    <div className="product-card-footer">
                      <button onClick={() => handleAddToCart(product)} className="btn-card-cart">
                        <ShoppingBag size={15} /> Add to bag
                      </button>
                      <Link to={`/products/${product._id}`} className="btn-card-view" title="View details">
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="store-utility-strip" aria-label="Store features">
        <div className="container">
          <div><span>01</span><strong>Stock visibility</strong><p>Availability is shown before checkout.</p></div>
          <div><span>02</span><strong>Saved items</strong><p>Keep a private shortlist in your wishlist.</p></div>
          <div><span>03</span><strong>Order history</strong><p>Review completed orders from your account.</p></div>
        </div>
      </section>
    </div>
  );
}
