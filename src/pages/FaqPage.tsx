import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { usePageMetadata } from '../features/legal';
import { ROUTES } from '../app/config/routes';
import { getPublishedFaqs, type FaqItem } from '../services/api/faqService';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function FaqAccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-neutral-50 sm:px-6"
        aria-expanded={isOpen}
      >
        <span className="min-w-0 flex-1 break-words text-base font-semibold leading-7 text-neutral-950 sm:text-lg">
          {item.question}
        </span>
        <ChevronDown className={`mt-1 h-5 w-5 flex-shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen ? (
        <div className="border-t border-neutral-100 px-5 py-5 sm:px-6">
          <p className="m-0 whitespace-pre-line break-words text-sm leading-7 text-neutral-600 sm:text-base">
            {item.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  usePageMetadata({
    title: 'Frequently Asked Questions',
    description: 'Find answers to frequently asked questions about OneMission products, orders, payments, shipping, and returns.',
    path: ROUTES.FAQ,
  });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorMessage('');

    void getPublishedFaqs()
      .then((response) => {
        if (!mounted) return;
        setItems(response.data);
        setCategories(response.categories);
      })
      .catch((error) => {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'FAQ could not be loaded.');
        setItems([]);
        setCategories([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = normalizeText(search);
    return items.filter((item) => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      if (!categoryMatch) return false;
      if (!keyword) return true;
      return normalizeText(`${item.question} ${item.answer}`).includes(keyword);
    });
  }, [items, search, selectedCategory]);

  const categoryOptions = useMemo(() => ['all', ...categories], [categories]);

  const toggleItem = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBackNavigation label="Back to Home" fallbackTo={ROUTES.HOME} />

      <main className="px-5 pb-20 pt-24 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-10 border-b border-neutral-200 pb-8 sm:mb-12">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Support
            </p>
            <h1 className="mt-4 text-[clamp(38px,6vw,72px)] font-normal leading-[0.96] tracking-[-0.04em] text-neutral-950">
              Frequently Asked Questions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Find answers to frequently asked questions about OneMission products, orders, payments, shipping, and returns.
            </p>
          </header>

          <section className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400" htmlFor="faq-search">
                Search FAQ
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="faq-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search frequently asked questions..."
                  className="w-full rounded-2xl border border-neutral-200 px-11 py-3 text-sm outline-none transition-colors focus:border-neutral-900"
                />
              </div>
            </div>

            {categoryOptions.length > 1 ? (
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1 md:justify-end">
                {categoryOptions.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'}`}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>

          {isLoading ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
              Loading FAQ...
            </div>
          ) : errorMessage ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h2 className="m-0 text-xl font-semibold text-neutral-950">We’re still preparing our FAQ.</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">Please contact our support team if you need assistance.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h2 className="m-0 text-xl font-semibold text-neutral-950">No FAQ found.</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">Try another keyword or category.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <FaqAccordionItem key={item.id} item={item} isOpen={openIds.has(item.id)} onToggle={() => toggleItem(item.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <HomepageFooter />
    </div>
  );
}
