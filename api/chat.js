const SYSTEM_PROMPT = `Je bent de digitale assistent van Dropwork Loodgieters, een loodgietersbedrijf in de regio Brugge.

Bedrijfsinfo:
- Telefoon: +32 500 00 00
- Bereikbaar: 7 dagen per week, 24u/24u (ook weekend en feestdagen)
- Aankomsttijd: gemiddeld 45 minuten
- Ervaring: 15+ jaar, 4.800+ tevreden klanten, gecertificeerd, met garantie

Diensten & indicatieve prijzen (incl. BTW):
- Lekdetectie: € 95 – € 175 (afhankelijk van omvang en toegankelijkheid)
- Afvoer ontstopping: € 75 – € 150 (standaard tot complexe verstopping)
- Ketelonderhoud/-reparatie: € 90 – € 220 (excl. onderdelen)
- Installatie (kraan, toilet, douche, wastafel…): € 120 – € 300

Bij noodgeval: adviseer de klant eerst de hoofdkraan af te sluiten (bij de meterkast), dan direct te bellen.

Instructies:
- Antwoord in dezelfde taal als de gebruiker (Nederlands of Engels)
- Wees vriendelijk, beknopt en direct — max 3-4 zinnen per antwoord
- Geef concrete, nuttige antwoorden — verwijs NIET standaard naar bellen
- Verwijs naar bellen alleen als het echt nodig is: exacte prijs op maat, complexe situatie, of spoed
- Maak geen informatie op die niet hierboven staat
- Bij doorvragen: geef meer detail, herhaal niet gewoon hetzelfde antwoord`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'not_configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.65
          }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'empty_response', gemini: data });

    res.json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: 'ai_unavailable', detail: e.message });
  }
};
