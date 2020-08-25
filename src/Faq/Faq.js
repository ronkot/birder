import React from 'react'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

export function ChangeLog() {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Birderin muutoshistoria</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <b>alpha 0.13.2</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty Avosetti ja Etelänsatakieli</li>
            <li>Lisätty puuttuvia kuvia. Kiitos Terho Kaikkonen 🙏</li>
          </ul>
          <b>alpha 0.13.1</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty Mustapääsirkku ja Isolokki</li>
          </ul>
          <b>alpha 0.13.0</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty Mustahaikara, Sepeltasku ja Viiriäinen</li>
            <li>
              Havaintoja voi nyt syöttää myös menneille vuosille (2019 ->)
            </li>
          </ul>
          <b>alpha 0.12.1</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty Mustaleppälintu</li>
            <li>Korjaus iOS Safarin geolokaatioongelmaan</li>
          </ul>
          <b>alpha 0.12.0</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty Arotasku ja Allihaahka</li>
            <li>Viimeisimpiä havaintoja voi nyt lajitella sarakkeittain</li>
            <li>
              Korjauksia lintuhavainnon syöttämisnäkymään. Parantaa
              toivottavasti iOS-käyttökokemusta.
            </li>
          </ul>
          <b>alpha 0.11.1</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Korjattu tilastosivun päivittyminen</li>
          </ul>
          <b>alpha 0.11.0</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty "Varhaisimmat havainnot" -osio Tilastot-sivulle</li>
            <li>Lisätty Kyhmyhaahka</li>
            <li>Korjattu kartta lintunäkymässä</li>
          </ul>
          <b>alpha 0.10.3</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>
              Korjattu iOS layout-ongelmia, erityisesti lintuhavaintonäkymässä
            </li>
            <li>Korjattu iOS app-ikonit</li>
            <li>
              Suurempi karttakoko pinnanäkymässä, pienempi havainnon
              syöttänäkymässä
            </li>
            <li>Korjattu Internet Explorerin ongelmia</li>
          </ul>
          <b>alpha 0.10.2</b>
          <ul style={{paddingLeft: '15px'}}>
            <li>Lisätty tietoja Birderistä sekä muutoshistoria</li>
            <li>Kartan käytettävyysparannuksia</li>
          </ul>
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export function WhatIsBirder() {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Mikä Birder on?</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <p>
            Birdergame on kaikille lintuharrastajille tarkoitettu päiväkirja ja
            peli. Birderiin voit tallenttaa helposti ja hauskasti omat
            vuosipinnasi, eli vuoden aikana tekemät lintuhavaintosi. Voit
            suorittaa erilaisia tehtäviä sekä kilpailla kavereiden kanssa.
            Kaikki tehtävät perustuvat oikeisiin lintuhavantoihin luonnossa.
            Birderin avulla pystyt seuraamaan omaa kehittymistäsi
            lintuharrastajana. Nyt voit siis unohtaa muistivihkot ja
            Excel-taulukot :)
          </p>

          <p>
            Birder on onnistunut tarkoituksessaan, kun se saa sinut tai ystäväsi
            lähtemään linturetkelle luontoon, lähelle tai kauas.
          </p>

          <p>
            Birderiin kirjaudutaan Google-tilin avulla. Jos sinulla on siis
            Gmail sähköposti, niin kirjautuminen onnistuu heti. Mikäli sinulla
            ei ole Gmail sähköpostia, niin{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://accounts.google.com/signup"
            >
              voit luoda oman Google-tilin
            </a>{' '}
            ja saat käyttöösi Gmail sähköpostin. Myöhemmässä vaiheessa
            kirjautumisvaihtoehtoja tulee lisää.
          </p>

          <p>
            Birderiä kehittävät Arvi Tyni (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/arvityni/"
            >
              @arvityni
            </a>
            ) sekä Jaakko Juvonen (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/sikurisankari/"
            >
              @sikurisankari
            </a>
            ).
          </p>

          <p>
            Palautteet, kysymykset ja muut yhteydenotot voi toimitttaa
            osoitteeseen{' '}
            <a href="mailto:birdergame@gmail.com">birdergame@gmail.com</a>.
          </p>

          <p>
            <a href="/Tietosuojaseloste.pdf" download>
              Tietosuojaseloste (PDF)
            </a>
          </p>
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export function Functionalities() {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Birderin toiminnallisuudet</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <p>
            Birderissä pääset merkkaamaan kaikki vuoden aikana havaitut linnut.
            Kyseisessä näkymässä lintujen kuvat ovat harmaana ja muuttuvat
            värillisiksi sitä mukaa, kun merkkaat linnut nähdyiksi. Tämä näkymän
            voit valita vuoden mukaan. Pääset siis selaamaan ja tarkastelemaan
            edellisten vuosien havaintoja. Tähän näkymään merkataan siis
            "vuodarit", eli vuosittain nähdyt ja tunnistetut linnut. Kun
            klikkaat yksittäistä lintua, niin tämän jälkeen avautuu kyseistä
            lintua koskeva näkymä. Kaikki linnut on pisteytetty Birder-tähdillä.
            Harvinaisemmasta linnusta saat enemmän tähtiä. Lintunäkymästä pääset
            myös "Lisätietoa" linkin avulla lukemaan lisää tietoa kyseisestä
            linnusta. Linkki ohjaa sinut Birderin ulkopuoliseen palveluun. Voit
            katsoa lintuhavaintojasi myös tekstilistauksena tai katsoa kartalta
            missä kaikkialla olet lintuja nähnyt.
          </p>

          <p>
            Valitsemalla vuosi valikosta ”kaikki” löydät kaikki linnut mitkä
            olet havainnut, tänne siis tallentuvat myös edellisten vuosien
            havainnot. Tämän näkymän avulla pysyt tietoisena, että mitä lintuja
            olet nähnyt ja tunnistanut koko Birderin käyttö aikanasi.
          </p>

          <p>
            "Saavutukset" osiossa on erilaisia tehtäviä, joista voit saada
            palkinnoksi ruusukkeita. Ruusukkeita voit saada ensimmäisen, toisen
            tai kolmannen luokan palkintoina. Klikkaamalla auki haasteen, niin
            näet haasteen kuvauksen ja esimerksiksi mitä lintuja havaitsemalla
            pääset etenemään haasteessa. Ota vaikka kaverisi, lapsesi, kummisi
            tai naapurisi kanssa kilpailu, että kumpi saa ensimmäisenä tietyn
            haasteen suoritettua. Haasteet päivittyvät ajoittain.
          </p>

          <p>
            "Tilastot" näkymässä pääset näkemään oman sijoituksesi Birder
            käyttäjien keskuudessa. Yhdestä havaitusta linnusta saa yhden
            "pinnan", eli pinnat kertovat kuinka monta eri lintulajia olet
            vuosittain havainnut. Tilastosivu tulee kehittymään runsaasti
            lähitulevaisuudessa.
          </p>

          <p>
            "Profiili" näkymän avulla voit halutessasi syöttää nimen tai
            nimimerkin Birderiin. Nimimerkin avulla myös kaverisi pystyvät
            seuraamaan lintuhavaintojesi kehittymistä.
          </p>

          <h4>Lintuhavainnon merkkaaminen</h4>

          <p>
            Birderin ensimmäisestä versiosta löytyvät kaikki Suomessa yleisemmin
            tavattavat linnut. Lintuja haetaan "Pinnat" - näkymässä
            (kiikarisymboli) sijaitsevassa aakkosjärjestyksessä olevasta
            luettelosta tai hakukentän avulla.
          </p>

          <p>
            Kun valitset havaitsemasi linnun luettelosta ja klikkaat "Lisää
            havainto", niin seuraavaksi avautuu havainnon muokkausnäkymä. Tässä
            näkymässä merkataan ensimmäiseksi havaintopäivämäärä, oletuksena on
            "tämä päivä", mutta voi merkata myös menneisyydessä olevan
            havainnon.
          </p>

          <p>
            Seuraavaksi voit lisätä linnun havaintopaikan. Havaintopaikka
            merkataan kartalta. Klikkaamalla kartan vasemmassa yläreunassa
            olevaa "ukkopainiketta", niin kartta kohdistuu puhelimen
            sijaintipaikkaan. Muista pitää puhelimen GPS-sijainti päällä. Voit
            myös merkata paikan vierittämällä ja zoomaamalla karttaa, sekä
            täppäämällä havaintopaikan sormella karttaan. Sijainnin voi myös
            jättää halutessaan laittamatta. Lopuksi havainto tallentetaan
            "tallenna" -painikkeesta. Jokaista lintuhavaintoa voi jälkikäteen
            muokata tai havainnon voi myös poistaa.
          </p>
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export function HowToStart() {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Miten alkuun lintuharrastuksessa?</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <p>
            Lintuharrastus on mukaansatempaava ja kiva harrastus, joka kasvattaa
            suosiotaan kokoajan. Lintuja voit harrastaa missä vain, milloin vain
            ja monella eri tavalla. Birder auttaa sinua seuraamaan, että mitä
            lintuja olet vuosittain havainnut ja missä sekä milloin havainto on
            tapahtunut. Birder tuo myös erilaisten haasteiden kautta lisää
            sisältöä harrastukseen.
          </p>

          <p>
            Koska Birder ei ole lintujentunnistukseen tarkoitettu sovellus, niin
            suosittelemme hyvän lintukirjan ja kiikareiden hankintaa. Myös
            lintujen valokuvaaminen ja kuvista myöhemmin tapahtuva tunnistaminen
            on kätevä tapa oppia ja tunnistaa lintuja.{' '}
          </p>

          <p>
            Seuraa meitä Instagrammissa{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/birdergame4/"
            >
              @birdergame4
            </a>{' '}
            tai Facebookissa{' '}
            <a target="_blank" href="https://www.facebook.com/birdergame">
              @birdergame
            </a>
          </p>

          <p>
            Aloittelevalle lintuharrastajalle löytyy{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.birdlife.fi/lintuharrastus/lintuharrastuksen-perusteet/"
            >
              mainio tietopaketti{' '}
            </a>
            Birdlifen sivuilta.
          </p>

          <p>
            Yleltä löytyy myös{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://yle.fi/aihe/artikkeli/2016/07/06/lintuharrastus-vie-mukanaan-nain-paaset-alkuun"
            >
              mukava artikkeli aloittelevalle lintuharrastajalle
            </a>
          </p>

          <p>
            Ylen artikkeli,{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://yle.fi/aihe/artikkeli/2016/11/30/tunnista-lintu-opas-aloittelijoille"
            >
              tunnista yleisimmät linnut
            </a>
          </p>
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}
