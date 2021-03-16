import Head from 'next/head'
import useSWR from 'swr'
import Navbar from '../components/navbar.js'
import Footer from '../components/footer.js'
import Button from '../components/button.js'
import { getEdgeState } from '../lib/state.js'

export default function ManageKeys () {
  const { data } = useSWR('edge_state', getEdgeState)
  const { user, loginUrl = '#', tokens = [] } = data ?? {}
  return (
    <div className='sans-serif'>
      <Head>
        <title>Manage API keys</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar user={user} loginUrl={loginUrl} />
      <main className='mw9 center bg-nspeach pv3 ph5 min-vh-100'>
        <div>
          <div className='flex mb3 items-center'>
            <h1 className='chicagoflf mv4 flex-auto'>Manage API Keys</h1>
            <Button href='/new-key.html' className='flex-none'>+ New Key</Button>
          </div>
          {tokens.length ? (
            <table className='bg-white ba b--black w-100 collapse mb4'>
              <tr className='bb b--black'>
                <th className='pa2 tl bg-nsgray br b--black w-50'>Name</th>
                <th className='pa2 tl bg-nsgray br b--black w-50'>Key</th>
                <th className='pa2 tc bg-nsgray' />
              </tr>
              {tokens.map(t => (
                <tr className='bb b--black'>
                  <td className='pa2 br b--black'>
                    {t.name}
                  </td>
                  <td className='pa2 br b--black mw7'>
                    <code style={{ wordWrap: 'break-word' }}>{t.token}</code>
                  </td>
                  <td className='pa2'>
                    <form action='/delete' method='DELETE'>
                      <input type='hidden' name='id' value='1' />
                      <Button className='bg-nsorange white' type='submit'>Delete</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </table>
          ) : <p className='tc mv5'><span className='f1 dib mb3'>😢</span><br/>No API keys</p>}
        </div>
      </main>
      <Footer />
    </div>
  )
}