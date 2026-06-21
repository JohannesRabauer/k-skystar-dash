# SkyStar Dash – Technische Spezifikation

## 1. Überblick

**Titel:** SkyStar Dash  
**Genre:** Endlos-Runner / Geschicklichkeitsspiel  
**Perspektive:** 2D-Seitenansicht (Side-Scrolling)  
**Plattform:** Web (HTML5 Canvas), gehostet auf GitHub Pages  
**Steuerung:** Ein-Tasten-Steuerung (Klick / Tap / Leertaste)  
**Zielgruppe:** Spieler jeden Alters

## 2. Technologie-Stack

| Komponente | Technologie |
|---|---|
| Rendering | HTML5 Canvas (2D Context) |
| Logik | Vanilla JavaScript (ES6+) |
| Styling | CSS3 (minimal, nur für Layout) |
| Persistenz | localStorage |
| Deployment | GitHub Actions → GitHub Pages |
| Build | Kein Build-Schritt nötig (statische Dateien) |

## 3. Dateistruktur

```
/
├── index.html          # Einstiegspunkt
├── style.css           # Layout & Canvas-Styling
├── game.js             # Gesamte Spiellogik
├── SPEC.md             # Diese Spezifikation
├── README.md           # Projektbeschreibung
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages Deployment
```

## 4. Spielmechanik

### 4.1 Spielfigur

- **Darstellung:** Einfaches Rechteck oder stilisierte Figur (farbiges Rechteck 30×40px)
- **Position:** Feste X-Position (ca. 20% der Canvas-Breite), nur Y-Position variiert
- **Bewegung:** Automatisches Laufen (die Welt scrollt nach links)
- **Sprung:** 
  - Auslöser: Klick, Tap oder Leertaste
  - Physik: Sofortige negative Y-Geschwindigkeit (Impulse-basiert)
  - Gravitation: Konstante Beschleunigung nach unten
  - Kein Doppelsprung (nur möglich wenn auf Dach stehend)

### 4.2 Sprungphysik

| Parameter | Startwert |
|---|---|
| Gravitation | 0.6 px/frame |
| Sprungkraft | -12 px/frame |
| Max. Fallgeschwindigkeit | 15 px/frame |

### 4.3 Gebäude (Plattformen)

- **Generierung:** Prozedural, von rechts nach links scrollend
- **Breite:** Zufällig zwischen 80–200px
- **Höhe:** Zufällig zwischen 40–70% der Canvas-Höhe (gemessen von unten)
- **Lücken zwischen Gebäuden:** 60–150px (skaliert mit Geschwindigkeit)
- **Darstellung:** Rechtecke mit dunklerer Farbe, leichter Rand oben für Dachkante
- **Entfernung:** Gebäude werden entfernt, sobald sie links aus dem Canvas scrollen

### 4.4 Sterne (Collectibles)

- **Platzierung:** Auf oder leicht über den Dächern (zufällige Position auf dem Gebäude)
- **Wahrscheinlichkeit:** Jedes Gebäude hat mit 70% Wahrscheinlichkeit einen Stern
- **Darstellung:** Gelbe Sternform (5-Zacken-Stern, Radius 12px)
- **Einsammeln:** Kollisionserkennung (Bounding-Box) zwischen Spieler und Stern
- **Effekt bei Einsammeln:**
  - Punktestand +1
  - Spielgeschwindigkeit +0.15 px/frame
  - Kurzer visueller Effekt (Stern blinkt/verschwindet)

### 4.5 Geschwindigkeit

| Parameter | Wert |
|---|---|
| Startgeschwindigkeit | 3 px/frame |
| Geschwindigkeitszuwachs pro Stern | +0.15 px/frame |
| Maximale Geschwindigkeit | 12 px/frame |

### 4.6 Kollision & Game Over

- **Bedingung:** Die untere Kante der Spielfigur erreicht die untere Canvas-Grenze (fällt in eine Lücke)
- **Auslöser:** Spieler befindet sich nicht über einem Gebäude und fällt nach unten aus dem sichtbaren Bereich
- **Aktion:** Spiel stoppt sofort, Game-Over-Screen wird angezeigt

## 5. Spielzustände

```
[START] → [RUNNING] → [GAME_OVER]
   ↑                        |
   └────────────────────────┘
```

### 5.1 START (Titelbildschirm)

- Spieltitel "SkyStar Dash" zentriert anzeigen
- Aktuellen Rekord anzeigen (falls vorhanden)
- Hinweis: "Klicke oder drücke Leertaste zum Starten"
- Hintergrund: Statische Skyline-Silhouette

### 5.2 RUNNING (Spielphase)

- Spielfigur auf erstem Gebäude
- Scrollende Gebäude von rechts nach links
- Sterne auf Dächern
- HUD oben links: Aktuelle Sterne (⭐ X)
- HUD oben rechts: Rekord (🏆 X)

### 5.3 GAME_OVER

- Overlay mit halbtransparentem Hintergrund
- "Game Over" Text
- Aktuelle Sterne dieser Runde
- Persönlicher Rekord (ggf. "Neuer Rekord!" Hinweis)
- "Nochmal spielen" – Klick/Tap/Leertaste startet neu

## 6. Visuelles Design

### 6.1 Farbpalette

| Element | Farbe |
|---|---|
| Hintergrund (Himmel) | Dunkles Blau-Violett (#1a1a2e) |
| Gebäude | Dunkelgrau (#2d2d44) |
| Dachkante | Hellgrau (#4a4a6a) |
| Spielfigur | Cyan (#00d4ff) |
| Sterne | Gold (#ffd700) |
| Text | Weiß (#ffffff) |
| Game Over Overlay | Schwarz 70% Transparenz |

### 6.2 Canvas

- **Breite:** 100% des Viewports (max 800px)
- **Höhe:** 100% des Viewports (max 500px)
- **Responsiv:** Canvas skaliert mit dem Fenster
- **Hintergrund:** Gradient von #1a1a2e oben nach #16213e unten

### 6.3 Visuelle Effekte

- Sterne pulsieren leicht (Größe oszilliert)
- Parallax-Hintergrundsterne (kleine weiße Punkte, langsamer Scroll)

## 7. Audio

- Kein Audio (bewusste Entscheidung für minimale Implementierung)

## 8. Rekordsystem

### 8.1 Speicherung

- **Schlüssel:** `skystar-dash-highscore`
- **Speicherort:** `localStorage`
- **Wert:** Integer (Anzahl Sterne)
- **Aktualisierung:** Am Ende jeder Runde, falls aktueller Score > gespeicherter Rekord

### 8.2 Anzeige

- Im Startbildschirm: "Rekord: X ⭐"
- Während des Spiels: Oben rechts im HUD
- Im Game-Over-Screen: Aktueller Score + Rekord + ggf. "Neuer Rekord!"

## 9. Steuerung (Input)

| Eingabe | Aktion |
|---|---|
| Mausklick (Canvas) | Springen / Spiel starten / Neustart |
| Touch (Canvas) | Springen / Spiel starten / Neustart |
| Leertaste | Springen / Spiel starten / Neustart |

- Eingabe wird nur verarbeitet wenn:
  - START-Zustand → Wechsel zu RUNNING
  - RUNNING + Spieler steht auf Dach → Sprung
  - GAME_OVER → Wechsel zu START

## 10. Prozedurale Level-Generierung

### 10.1 Algorithmus

1. Canvas beginnt mit einem breiten Startgebäude (Spieler startet sicher)
2. Wenn das rechteste Gebäude weniger als Canvas-Breite entfernt ist vom rechten Rand:
   - Neue Lücke generieren: `60 + Math.random() * 90` px (+ Geschwindigkeitsfaktor)
   - Neues Gebäude generieren mit zufälliger Breite und Höhe
   - Optional Stern platzieren (70% Chance)
3. Gebäude und Sterne, die links aus dem Canvas sind, werden aus dem Array entfernt

### 10.2 Schwierigkeitsskalierung

- Lückenbreite wächst leicht mit der Geschwindigkeit
- Formel: `basisLücke + (geschwindigkeit - startGeschwindigkeit) * 8`
- Gebäudehöhen-Variation bleibt konstant

## 11. Game Loop

- **Methode:** `requestAnimationFrame`
- **Feste Logik-Rate:** Deltatime-basiert für konsistente Physik
- **Ablauf pro Frame:**
  1. Input verarbeiten
  2. Spielfigur-Physik aktualisieren (Gravitation, Position)
  3. Welt scrollen (Gebäude + Sterne nach links bewegen)
  4. Neue Gebäude generieren falls nötig
  5. Kollisionserkennung (Dach-Landung, Stern-Einsammeln, Absturz)
  6. HUD aktualisieren
  7. Alles rendern

## 12. Responsive Design

- Canvas füllt den verfügbaren Platz (CSS `width: 100%; max-width: 800px`)
- Interne Canvas-Auflösung: fest 800×500px
- CSS skaliert das Canvas-Element proportional
- Touch-Events für mobile Geräte
- `user-select: none` und `touch-action: none` auf Canvas

## 13. Deployment

### 13.1 GitHub Actions Workflow

- **Trigger:** Push auf `main` Branch
- **Aktion:** Statische Dateien direkt deployen (kein Build nötig)
- **Methode:** `actions/upload-pages-artifact` + `actions/deploy-pages`

### 13.2 Voraussetzungen

- GitHub Pages muss im Repository aktiviert sein (Source: GitHub Actions)
- Repository Settings → Pages → Source: "GitHub Actions"

## 14. Performance-Anforderungen

- 60 FPS auf modernen Browsern (Desktop + Mobile)
- Kein Memory Leak (alte Objekte werden aus Arrays entfernt)
- Keine externen Abhängigkeiten (kein Framework, keine Bibliotheken)

## 15. Browser-Kompatibilität

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+
- Mobile Chrome / Safari (iOS + Android)
