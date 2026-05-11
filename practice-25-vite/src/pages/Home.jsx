export default function Home() {
  return (
    <section>
      <h2>Главная</h2>
      <p>
        Демо-приложение для практики 25: <strong>Vite</strong> в качестве инструмента сборки,
        ленивая загрузка страниц через <code>React.lazy</code>, ручное разделение чанков
        и анализатор бандла <code>rollup-plugin-visualizer</code>.
      </p>
      <p>
        Перейдите в каталог или «О нас» — браузер запросит соответствующий чанк только в этот момент.
      </p>
    </section>
  );
}
