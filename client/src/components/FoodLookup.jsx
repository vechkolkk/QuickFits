import React, { useEffect, useRef, useState } from 'react';
import { Barcode, Camera, Search, X } from 'lucide-react';
import { api, getErrorMessage } from '../api/client.js';
import { scaleFoodNutrition } from '../utils/nutrition.js';

export function FoodLookup({ onUseFood }) {
  const [query, setQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [grams, setGrams] = useState(100);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);

  function stopCamera() {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null; setScanning(false);
  }
  useEffect(() => stopCamera, []);

  function chooseFood(food) { setSelected(food); setGrams(food.servingGrams || 100); }

  async function searchFoods(event) {
    event.preventDefault(); setError(''); setLoading('search'); setSelected(null);
    try { const { data } = await api.get('/foods/search', { params: { q: query } }); setFoods(data.foods); }
    catch (err) { setError(getErrorMessage(err)); setFoods([]); }
    finally { setLoading(''); }
  }

  async function lookupBarcode(code = barcode) {
    setError(''); setLoading('barcode'); setSelected(null);
    try { const { data } = await api.get(`/foods/barcode/${code}`); setFoods([data.food]); chooseFood(data.food); setBarcode(code); }
    catch (err) { setError(getErrorMessage(err)); setFoods([]); }
    finally { setLoading(''); }
  }

  async function startCamera() {
    setError('');
    if (!window.BarcodeDetector || !window.navigator.mediaDevices?.getUserMedia) { setError('Camera barcode scanning is not supported in this browser. Enter the barcode instead.'); return; }
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream; setScanning(true);
      window.setTimeout(async () => {
        try {
          if (!videoRef.current) throw new Error('Camera preview was unavailable');
          videoRef.current.srcObject = stream; await videoRef.current.play();
          const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
          async function detect() {
            if (!streamRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes[0]?.rawValue) { const code = codes[0].rawValue; stopCamera(); await lookupBarcode(code); return; }
              frameRef.current = window.requestAnimationFrame(detect);
            } catch { stopCamera(); setError('The barcode could not be read. Try again or enter it manually.'); }
          }
          detect();
        } catch {
          stopCamera(); setError('The camera preview could not start. Enter the barcode manually.');
        }
      }, 0);
    } catch { stopCamera(); setError('Camera access was unavailable. Check browser permissions or enter the barcode manually.'); }
  }

  function useSelected() {
    onUseFood({ ...selected, ...scaleFoodNutrition(selected, grams), servingGrams: Number(grams), source: 'open-food-facts' });
    setSelected(null);
  }

  return <section className="panel food-lookup">
    <div className="section-title-row"><div><h2>Find a food</h2><p>Search the food database or scan a packaged-food barcode.</p></div><a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">Data: Open Food Facts</a></div>
    <div className="food-lookup-tools">
      <form onSubmit={searchFoods}><label>Food search<div><input value={query} minLength="2" onChange={(event) => setQuery(event.target.value)} placeholder="Greek yogurt, oats..." required /><button disabled={Boolean(loading)} aria-label="Search foods"><Search size={18} /></button></div></label></form>
      <form onSubmit={(event) => { event.preventDefault(); lookupBarcode(); }}><label>Barcode<div><input inputMode="numeric" pattern="[0-9]{8,14}" value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ''))} placeholder="8–14 digits" required /><button disabled={Boolean(loading)} aria-label="Find barcode"><Barcode size={18} /></button><button type="button" className="secondary-button" onClick={scanning ? stopCamera : startCamera}><Camera size={18} /> {scanning ? 'Stop' : 'Scan'}</button></div></label></form>
    </div>
    {scanning && <div className="barcode-camera"><video ref={videoRef} muted playsInline /><button className="icon-button" onClick={stopCamera} aria-label="Close camera"><X size={18} /></button><span>Point the camera at the barcode</span></div>}
    {error && <p className="error" role="alert">{error}</p>}
    {loading && <p className="empty">Looking up foods...</p>}
    {!loading && foods.length > 0 && <div className="food-results">{foods.map((food) => <button type="button" className={selected?.barcode === food.barcode ? 'selected' : ''} key={food.barcode} onClick={() => chooseFood(food)}>{food.imageUrl ? <img src={food.imageUrl} alt="" /> : <span className="food-image-placeholder"><Barcode /></span>}<span><strong>{food.name}</strong><small>{food.brand || 'Unknown brand'} · {food.calories} cal per 100 g</small></span></button>)}</div>}
    {!loading && !error && query && foods.length === 0 && <p className="empty">No matching foods found. You can still enter it manually below.</p>}
    {selected && <div className="food-portion"><div><strong>{selected.name}</strong><span>{scaleFoodNutrition(selected, grams).calories} cal · {scaleFoodNutrition(selected, grams).protein}g protein</span></div><label>Portion (g)<input type="number" min="1" step="1" value={grams} onChange={(event) => setGrams(event.target.value)} /></label><button onClick={useSelected}>Use this food</button></div>}
  </section>;
}
