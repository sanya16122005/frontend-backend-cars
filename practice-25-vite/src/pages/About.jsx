export default function About() {
  return (
    <section>
      <h2>О приложении</h2>
      <ul>
        <li>Сборщик: <strong>Vite 5</strong> (esbuild для зависимостей, Rollup для production)</li>
        <li>Code splitting: <code>React.lazy</code> + <code>Suspense</code> для <code>Catalog</code> и <code>About</code></li>
        <li>Ручные чанки: <code>react-vendor</code>, <code>router</code></li>
        <li>Анализатор: <code>rollup-plugin-visualizer</code> → <code>dist/bundle-report.html</code></li>
        <li>Tree-shaking включён по умолчанию в production-сборке</li>
      </ul>
    </section>
  );
}
