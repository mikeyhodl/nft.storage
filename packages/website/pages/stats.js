import { useEffect, useState } from 'react'
import { NftUpCta } from '../components/nftUpCta'
import fs from 'fs'
import { calculateStats, calculateMarketStats } from '../lib/statsUtils'
import Img from '../components/cloudflareImage'
import { API } from '../lib/api'
import Loading from '../components/loading'
import bytes from 'bytes'
import NetlifyPartial from '../components/netlifyPartial'
import { TrustedBy } from 'components/trustedByLogos'
import { NFT_PORT_ENDPOINT, NFT_PORT_API_KEY } from '../lib/constants'

/**
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */

export function getStaticProps() {
  const logos = fs.readdirSync('public/images/marketplace-logos/home')
  // make opensea be the first logo
  const logosWithDir = logos
    .sort((a, b) =>
      a.includes('opensea') ? -1 : b.includes('opensea') ? 1 : 0
    )
    .map((logo) => {
      const cleanedFileName = logo.replace(/\.[^/.]+$/, '')
      return {
        src: `home/${logo}`,
        alt: cleanedFileName + ' logo',
      }
    })
  return {
    props: {
      title: 'Stats - NFT Storage',
      description: 'NFT.Storage usage stats',
      navBgColor: 'bg-nsgreen',
      needsUser: false,
      logos: logosWithDir,
    },
  }
}

/**
 * Stats Page
 * @param {Object} props
 * @param {string[]} props.logos
 *
 */
export default function Stats({ logos }) {
  /** @type [any, any] */
  const [stats, setStats] = useState({})
  /** @type [any, any] */
  const [marketStats, setMarketStats] = useState({})
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setStatsLoading(true)
    try {
      const nftPortStats = await fetch(NFT_PORT_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: NFT_PORT_API_KEY,
        },
        redirect: 'follow',
      })
      const data = await nftPortStats.json()
      setMarketStats(await calculateMarketStats(data.report))
    } catch (e) {
      const fakeData = {
        totalNfts: 91100000,
        totalMarketValueUSD: 26800000000,
        totalMarketValue: 0,
        totalMissing: 1150000,
        missingPercentage: 22.3,
        missingMarketValueUSD: 874700000,
        missingMarketValue: 0,
      }
      setMarketStats(fakeData)
    }
    try {
      const stats = await fetch(`${API}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
      setStats(calculateStats(stats.data))
    } catch (e) {
      const fakeData = {
        ok: true,
        data: {
          deals_size_total: 249523372029443,
          deals_size_total_prev: 249523372020000,
          uploads_past_7_total: 2011366,
          uploads_nft_total: 685866,
          uploads_remote_total: 11077834,
          uploads_car_total: 17711308,
          uploads_multipart_total: 1456388,
          uploads_blob_total: 12420729,
        },
      }
      setStats(calculateStats(fakeData.data))
    }
    setStatsLoading(false)
  }

  const Marquee = () => {
    return (
      <div className="relative w-screen max-w-100 h-[100px] border-y border-black flex items-center justify-center">
        <p className="chicagoflf p-4 m-0 text-[clamp(16px,_2.6rem,_6vw)]">
          NFT.Storage is storing...
        </p>
      </div>
    )
  }

  /**
   * @param {Object} props
   * @param {string} [props.title]
   * @param {any} [props.children]
   */
  const StatCard = ({ title, children }) => {
    return (
      <div className="bg-yellow text-center border border-black h-full box-content flex flex-col justify-between">
        <h2 className="text-2xl sm:text-4xl text-white mb-4 mt-8 flex-initial chicagoflf">
          {title}
        </h2>
        <div className="stat-card-inner relative flex flex-1 z-10 -translate-x-8 translate-y-8">
          {children}
        </div>
      </div>
    )
  }

  /**
   * @param {Object} props
   * @param {string} [props.title]
   * @param {any} [props.children]
   */
  const MarketStatCard = ({ title, children }) => {
    return (
      <div className="market-stats-card bg-white text-center border border-black h-full box-content flex flex-col justify-center p-4">
        <div>{children}</div>
        <div className="text-lg">{title}</div>
      </div>
    )
  }

  const StatCards = () => {
    const figureClass = `chicagoflf text-[clamp(22px,_4.2rem,_6vw)] my-5`
    const statImageClass = `w-full border-b border-black object-cover aspect-[5/2]`
    const statInnerClass = `bg-white border border-black w-full h-full flex flex-col justify-between`
    return (
      <div className="stat-cards-wrapper">
        <div className="max-w-7xl mx-auto py-4 px-6 sm:px-16">
          <div className="stat-cards -mt-24 mb-16 pl-8 grid gap-x-16 gap-y-[8vw] md:grid-cols-2">
            <StatCard title="Upload Count">
              <div className={statInnerClass}>
                <Img
                  src={'/images/stats-upload-count.svg'}
                  alt="Upload Count"
                  width="500px"
                  height="200px"
                  layout="responsive"
                  className={statImageClass}
                />
                <div className="p-4">
                  <p className="chicagoflf">Total uploads to NFT.Storage</p>
                  <figure className={figureClass}>
                    {statsLoading && <Loading />}
                    {new Intl.NumberFormat('en-GB', {
                      notation: 'compact',
                      compactDisplay: 'short',
                      maximumFractionDigits: 1,
                    }).format(stats.totalUploads || 0)}
                  </figure>
                  <p
                    className={`chicagoflf ${
                      stats.growthRate >= 0
                        ? `text-forest ${
                            stats.growthRate > 0 ? "before:content-['+']" : ''
                          }`
                        : `text-red before:content-['-']`
                    }`}
                  >
                    {stats.growthRate || 0}%
                  </p>
                  <p>[Week over week change]</p>
                </div>
              </div>
            </StatCard>

            <StatCard title="Data Stored">
              <div className={statInnerClass}>
                <Img
                  src={'/images/stats-data-stored.svg'}
                  alt="Data Stored"
                  width="500px"
                  height="200px"
                  layout="responsive"
                  className={statImageClass}
                />
                <div className="p-4">
                  <p className="chicagoflf">
                    Total data stored on Filecoin from NFT.Storage
                  </p>
                  <figure className={figureClass}>
                    {statsLoading && <Loading />}
                    {bytes(stats.deals_size_total || 0, { decimalPlaces: 2 })}
                  </figure>
                  <p
                    className={`chicagoflf ${
                      stats.deals_total >= 0
                        ? `text-forest ${
                            stats.deals_total > 0 ? "before:content-['+']" : ''
                          }`
                        : `text-red before:content-['-']`
                    }`}
                  >
                    {stats.dealsSizeGrowthRate || 0}%
                  </p>
                  <p>[Week over week change]</p>
                </div>
              </div>
            </StatCard>
          </div>
        </div>
      </div>
    )
  }

  const MarketStatCards = () => {
    return (
      <div className="max-w-7xl mx-auto py-4 px-6 sm:px-16">
        <div className="mb-16 pl-8 grid gap-x-4 gap-y-[8vw] md:grid-cols-2 xl:grid-cols-4">
          <MarketStatCard title="Total Count of NFTS">
            <figure className="chicagoflf text-[clamp(2rem,2.6rem,3.3rem)] text-navy">
              {statsLoading && <Loading />}
              {new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
              }).format(marketStats.totalNfts || 0)}
            </figure>
          </MarketStatCard>
          <MarketStatCard title="Total market value of NFTs">
            <figure className="chicagoflf text-[clamp(2rem,2.6rem,3.3rem)] text-forest">
              {statsLoading && <Loading />}
              {marketStats.totalMarketValueUSD > 0 ? '$' : 'Ξ'}
              {new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
              }).format(
                marketStats.missingMarketValueUSD > 0
                  ? marketStats.totalMarketValueUSD
                  : marketStats.totalMarketValue || 0
              )}
            </figure>
          </MarketStatCard>
          <MarketStatCard title="Market value of missing NFTs">
            <figure className="chicagoflf text-[clamp(2rem,2.6rem,3.3rem)] text-red">
              {statsLoading && <Loading />}
              {marketStats.missingMarketValueUSD > 0 ? '$' : 'Ξ'}
              {new Intl.NumberFormat('en-GB', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
              }).format(
                marketStats.missingMarketValueUSD > 0
                  ? marketStats.missingMarketValueUSD
                  : marketStats.missingMarketValue || 0
              )}
            </figure>
          </MarketStatCard>
          <MarketStatCard title="Percentage of NFTs deemed missing">
            <figure className="chicagoflf text-[clamp(2rem,2.6rem,3.3rem)] text-yellow">
              {statsLoading && <Loading />}
              {marketStats.missingPercentage ?? 0}%
            </figure>
          </MarketStatCard>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-nsgreen">
      <Marquee />
      <StatCards />
      <div className="bg-nspeach">
        <div className="relative w-screen flex items-center justify-center">
          <div className="text-center">
            <p className="chicagoflf p-4 m-0 mt-5 text-[clamp(14px,_2rem,_6vw)]">
              NFT Market By the Numbers
            </p>
            <p className="chicagoflf p-4 m-0 mt-5 text-[clamp(12px,_1.6rem,_6vw)]">
              The Price of Missing NFTS
            </p>
          </div>
        </div>
        <MarketStatCards />
      </div>
      <div className="bg-nsblue">
        <div className="stats-trusted-wrapper max-w-7xl mx-auto py-4 px-6 sm:px-16">
          <div>
            <NetlifyPartial
              route="trusted-by-stats-page"
              className="netlify-partial-trusted-by-stats-page max-w-4xl mx-auto py-8 px-6 sm:px-16 text-center chicagoflf"
              fallback={<TrustedBy logos={logos} />}
            />
          </div>
        </div>
      </div>
      <div className="bg-nsyellow">
        <div className="stats-trusted-wrapper max-w-7xl mx-auto py-4 px-6 sm:px-16">
          <div>
            <NftUpCta />
          </div>
        </div>
      </div>
    </main>
  )
}
