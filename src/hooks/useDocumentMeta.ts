import { useEffect } from "react";

const defaultDescription =
  "Solimouv’ est la PWA du collectif Up Sport! pour découvrir et suivre les événements inclusifs toute l'année.";

export function useDocumentMeta(title: string, description = defaultDescription) {
  useEffect(() => {
    document.title = `${title} | Solimouv’`;

    const descriptionTag = document.querySelector('meta[name="description"]');

    if (descriptionTag) {
      descriptionTag.setAttribute("content", description);
      return;
    }

    const meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", description);
    document.head.appendChild(meta);
  }, [description, title]);
}
