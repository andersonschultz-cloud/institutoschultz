# Instituto Schultz — Site Institucional

Site estático premium em **HTML5 + CSS3 + JavaScript puro** — sem frameworks, sem build, pronto para o GitHub Pages.

## Estrutura

```
/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   ├── images/logo.png
│   └── icons/
├── sitemap.xml
└── robots.txt
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `institutoschultz`).
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Em **Settings → Pages**, selecione a branch `main` e a pasta `/ (root)`.
4. O site ficará disponível em `https://seuusuario.github.io/institutoschultz/`.
5. Para usar o domínio próprio (`www.institutoschultz.com`), configure o **Custom domain** nas mesmas configurações e aponte o DNS (CNAME) para o GitHub Pages.

## Personalizações recomendadas

- **Foto da Fernanda**: salve como `assets/images/fernanda.jpg` e substitua o placeholder dentro de `<figure class="founder__photo">` no `index.html` por:
  `<img src="assets/images/fernanda.jpg" alt="Fernanda Schultz" />`
- **Depoimentos**: troque os textos ilustrativos por relatos reais autorizados (seção `#depoimentos`) e remova o aviso `.testimonials__disclaimer`.
- **Formulário**: hoje ele abre o cliente de e-mail do visitante (funciona sem servidor). Para envio automático, conecte um serviço como Formspree: troque a lógica de `mailto:` no `js/script.js` por um `fetch` para o endpoint do serviço.
- **E-mail de contato**: ajuste `contato@institutoschultz.com` no `index.html` e no `js/script.js` se o endereço for outro.
- **Redes sociais**: adicione as URLs no campo `sameAs` do JSON-LD e no rodapé.

## Acessibilidade e performance

- Navegação por teclado com foco visível, `skip link` e ARIA nos componentes interativos.
- `prefers-reduced-motion` respeitado (animações e canvas desativados).
- Animação do hero pausa automaticamente quando sai da tela.
- Mobile first, sem dependências externas além das fontes do Google Fonts.
