import React from 'react'
import s from './App.module.scss'
import Scrollbar from 'components/Scrollbar/Scrollbar'

// change arrayLength to check scrollbar working with different content heights
const MOCK = new Array(1000)
  .fill(`Ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Ac turpis egestas
          maecenas pharetra convallis posuere morbi. Sit amet venenatis urna cursus eget. Enim
          tortor at auctor urna nunc id cursus. In egestas erat imperdiet sed. Tellus at urna
          condimentum mattis. Turpis cursus in hac habitasse platea dictumst. Volutpat lacus laoreet
          non curabitur.`)

const Content = () => (
  <div style={{ padding: '0 18px', backgroundColor: '#eee', border: '10px solid #ccc' }}>
    <span style={{ fontWeight: 900 }}>BEGIN</span>
    {MOCK.map((item) => item)}
    <span style={{ fontWeight: 900 }}>END</span>
  </div>
)

function App() {
  return (
    <div className={s.root}>
      <Scrollbar style={{ width: '500px' }}>
        <Content />
      </Scrollbar>
    </div>
  )
}

export default App
