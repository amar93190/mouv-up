type PageHeadingProps = {
  title: string;
  intro: string;
};

function PageHeading({ title, intro }: PageHeadingProps) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="max-w-3xl text-base text-slate-700 sm:text-lg">{intro}</p>
    </header>
  );
}

export default PageHeading;
