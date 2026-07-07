import { Heart, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '../components/shared';
import { productPath, ROUTES } from '../app/config/routes';
import { useWishlist } from '../features/customer';
import { useCartStore } from '../stores';
import { productService } from '../services/product';
import { formatCurrency } from '../utils/formatting';
import { IMAGE_PLACEHOLDER } from '../app/constants';

export function WishlistPage() {
  const navigate = useNavigate();
  const { items, isLoading, removeItem } = useWishlist();
  const { addItem } = useCartStore();
  const [movingProductId, setMovingProductId] = useState('');

  const sortedItems = useMemo(() => [...items].sort((left, right) => new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime()), [items]);

  const handleMoveToCart = async (productId: string, slug: string) => {
    setMovingProductId(productId);
    try {
      const detail = await productService.getProductDetail(slug);
      if (!detail) {
        navigate(productPath(slug));
        return;
      }

      const availableVariant = detail.variants?.find((variant) => (variant.available ?? variant.stock > 0) && variant.stock > 0)
        || detail.variants?.[0];

      addItem({
        productId: detail.id,
        variantId: availableVariant?.id,
        quantity: 1,
      });
      removeItem(productId);
      navigate(ROUTES.CART);
    } catch {
      navigate(productPath(slug));
    } finally {
      setMovingProductId('');
    }
  };

  if (isLoading) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm text-sm text-neutral-500">Loading wishlist...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400">Wishlist</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Saved Favorites</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Keep products here until you are ready to move them into cart.</p>
      </div>

      {sortedItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <EmptyState
            icon={<Heart size={36} />}
            title="Your wishlist is empty."
            description="Save products you love so they are easier to revisit later."
            action={<Button type="button" onClick={() => navigate(ROUTES.HOME)}>Start Shopping</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedItems.map((item) => (
            <article key={item.productId} className="rounded-3xl bg-white p-5 shadow-sm">
              <button type="button" onClick={() => navigate(productPath(item.slug))} className="w-full text-left">
                <div className="mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-50">
                  <img src={item.imageUrl || IMAGE_PLACEHOLDER} alt={item.name} className="h-full w-full object-contain object-bottom" />
                </div>
                {item.categoryName ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{item.categoryName}</p> : null}
                <h3 className="mt-2 text-base font-semibold text-neutral-950">{item.name}</h3>
                <p className="mt-2 text-sm font-medium text-neutral-700">{formatCurrency(item.price)}</p>
              </button>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" className="flex-1 gap-2" onClick={() => void handleMoveToCart(item.productId, item.slug)} disabled={movingProductId === item.productId}>
                  <ShoppingCart size={16} />
                  {movingProductId === item.productId ? 'Moving...' : 'Move to Cart'}
                </Button>
                <Button type="button" variant="secondary" className="gap-2" onClick={() => removeItem(item.productId)}>
                  <Heart size={16} />
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
