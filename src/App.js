import { useEffect, useState, useRef } from 'react'
import './App.css'

import { debounce, findInString, logSkull } from './utils'

const Header = () => <header>
  <pre>
  <span>||█ TOP SECRET █|███</span>
  <em></em>
  </pre>
  </header>
const Footer = () => <footer>
  <div>
  * -----------------------------------------------------------------------------  *
    <div>
      * heroleaks 💀 property of  <span>Thays</span> <span>dos</span> <span>Santos</span> <span>Neves</span>
      , published at <a href="https://github.com/thayssn">github@thayssn</a>
    </div>
  * -----------------------------------------------------------------------------  *
  </div>
  </footer>
const Loading = () => <><span className=" glass">🔎</span><span>searching database</span></>

async function fetchIdentities(){
  const response = await fetch('/identities.json')
  return await response.json()

}

const App = () => {
  const [ identities, setIdentities ] = useState([])
  const [ sugestions, setSugestions ] = useState([])
  const [ knownWords, setKnownWords ] = useState([])
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState('')
  const inputRef = useRef(null);

  async function fetchNames(){
    const response = await fetch('/heroes.json')
    const data = await response.json()
    setKnownWords(data);
  }

  useEffect(() => {
    logSkull()
    fetchNames()
  },[])

  const getSugestions = debounce(async (term) => {
    if(!term) {
      setSugestions([])
      return;
    };

    const possibleWords = knownWords.filter(word => findInString(word,term))
    setSugestions(possibleWords);
  }, 500)

  function handleInputChange (e) {
    getSugestions(e.target.value)
  }

  function selectSugestion(e) {
    setSugestions([])
    inputRef.current.value = e.target.textContent
    inputRef.current.focus()
  }
  async function handleFormSubmit(e) {
    e.preventDefault()
    const term = inputRef.current.value;

    if(!term) return;

    setLoading(true)

    setTimeout(async () => {
      const fetchedIdentities = await fetchIdentities()
      const filteredIdentities = fetchedIdentities.filter(hero => 
        findInString(hero.name, term)
      )
  
      setIdentities(filteredIdentities)
      setLoading(false)
      setSugestions([])
  
      if(!filteredIdentities.length) setError(`No hero named '${inputRef.current.value}'`)
    },500)
  }

  window.addEventListener('keydown', (event) => {
    if(event.code === 'Escape'){
      setSugestions([])
    }
  });
  
  return (
    <>
    <Header />
    <section className="App">
      <h1>Use the box to search for the secret identities</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="inputGroup">
        <input ref={inputRef} type="text" placeholder="Search for identity" onChange={handleInputChange} autoFocus onFocusOut={() => { setSugestions([])}}/>
          <ul className="sugestions">
            {sugestions.map((word, idx) => <button type="button" key={idx} onClick={selectSugestion}>{word}</button>)}
          </ul>
        </div>
        <button type="submit" disabled={loading}>{ loading ? <Loading /> : 'search'}</button>
      </form>
      {identities.length ? <>
        <ul className="identities">
          {identities.map((hero, idx) => <li key={idx}><button title={hero.name}>{hero.name}</button> - <button className="stripe" title={hero.identity}>{hero.identity}</button></li>)}
        </ul>
      </>
      : <p className="error">{error}</p>
      }
    </section>
    <Footer />
    </>
  );
}

export default App;
