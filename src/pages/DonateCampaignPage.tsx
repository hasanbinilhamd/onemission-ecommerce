import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HomepageFooter } from '../features/footer';
import { TopBackNavigation } from '../features/navigation';
import { ROUTES } from '../app/config/routes';
import { SkeletonBlock, CmsStatePanel } from '../components/shared';
import { donationService, type CampaignDetailPayload } from '../services/api/donationService';
import { formatRupiah } from './DonatePage';

/**
 * DonateCampaignPage — public historical campaign detail.
 *
 * CLOSED campaigns remain viewable as documentation (story, updates,
 * disbursements, partners, donations). No Donate Now CTA — historical
 * campaigns are not donation choices. CMS content only, no static fallback.
 */
export function DonateCampaignPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [payload, setPayload] = useState<CampaignDetailPayload | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    setPayload(null);
    setNotFound(false);
    setLoadFailed(false);
    try {
      const result = await donationService.getCampaign(slug);
      setPayload(result);
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'DONATION_CAMPAIGN_NOT_FOUND') {
        setNotFound(true);
      } else {
        setLoadFailed(true);
      }
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-['SF-Pro-Display',_sans-serif]">
        <TopBackNavigation label="Back to Donate" fallbackTo={ROUTES.DONATE} />
        <h1 className="text-3xl font-bold uppercase tracking-tight text-neutral-900">
          Campaign not found
        </h1>
        <p className="mb-8 mt-2 max-w-sm text-sm text-neutral-500">
          This campaign does not exist or is not available yet.
        </p>
        <Link
          to={ROUTES.DONATE}
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition-colors hover:bg-neutral-700"
        >
          Back to Donate
        </Link>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen bg-white">
        <TopBackNavigation label="Back to Donate" fallbackTo={ROUTES.DONATE} />
        <div className="pt-16">
          <CmsStatePanel
            eyebrow="Donate"
            title="Unable to load this campaign."
            description="Please check your connection and try again."
            actionLabel="Try Again"
            onAction={() => void load()}
          />
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif]">
        <TopBackNavigation label="Back to Donate" fallbackTo={ROUTES.DONATE} />
        <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="mt-4 h-10 w-3/4 max-w-xl" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-md" />
          <SkeletonBlock className="mt-8 aspect-[16/9] w-full rounded-2xl" />
          <SkeletonBlock className="mt-8 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-2/3" />
        </div>
        <div className="mt-16 bg-white pb-[100px] lg:pb-0">
          <HomepageFooter />
        </div>
      </div>
    );
  }

  const { campaign, story, updates, disbursements, partners } = payload;
  const storyParagraphs = String(story.content || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white font-['SF-Pro-Display',_sans-serif] text-neutral-900">
      <TopBackNavigation label="Back to Donate" fallbackTo={ROUTES.DONATE} />

      <article className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28">
        <span className="rounded-full bg-neutral-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
          Closed
        </span>
        <h1 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          {campaign.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-base">
          {campaign.shortDescription}
        </p>
        <p className="mt-3 text-sm font-bold text-neutral-900">
          {formatRupiah(campaign.raised)} raised of {formatRupiah(campaign.targetAmount)} ·{' '}
          {campaign.donorCount.toLocaleString('id-ID')} donors
        </p>

        {campaign.coverImage && (
          <div className="mt-8 overflow-hidden rounded-2xl">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {story.title && (
          <h2 className="mt-10 text-2xl font-bold uppercase tracking-tight">{story.title}</h2>
        )}
        <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-neutral-700">
          {storyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {updates.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Latest Updates
            </p>
            <div className="mt-5 space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex items-start gap-4">
                  {update.image && (
                    <img
                      src={update.image}
                      alt={update.imageAlt || ''}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      {new Date(update.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">{update.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {disbursements.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Fund Disbursement
            </p>
            <div className="mt-5 space-y-3">
              {disbursements.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-neutral-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{item.partnerName}</p>
                  </div>
                  <p className="text-sm font-bold text-neutral-900">{formatRupiah(item.amount)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {partners.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Our Partners
            </p>
            <div className="mt-5 space-y-3">
              {partners.map((partner) => (
                <div key={partner.id}>
                  <p className="text-base font-bold uppercase tracking-tight">
                    {partner.name}
                    {partner.tagline ? (
                      <span className="ml-2 text-sm font-medium normal-case tracking-normal text-neutral-500">
                        {partner.tagline}
                      </span>
                    ) : null}
                  </p>
                  {partner.statement && (
                    <p className="mt-1 text-sm text-neutral-500">{partner.statement}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      <div className="mt-16 bg-white pb-[100px] lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
