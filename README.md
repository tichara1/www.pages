# www-pages

Interaktivní UI prototypy a proof-of-concepty hostované na GitHub Pages.

**→ [tichara1.github.io/www-pages](https://tichara1.github.io/www-pages/)**

Bez buildu a bez bundleru — každý prototyp je složka v `docs/` s vlastním `index.html`.
Rozcestník na kořeni se generuje z `docs/prototypes.json`.

Lokálně (statický server je nutný, `file://` nefunguje):

```
npx serve docs
```

Postup pro přidání dalšího prototypu je v [CLAUDE.md](CLAUDE.md).
