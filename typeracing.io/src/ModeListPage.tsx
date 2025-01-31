import { Helmet } from "react-helmet-async";
import { modes, ModeType } from "./modes";
import { useMemo } from "react";

export function ModeListPage({
  modeTypes,
  title,
  description,
  ogDescription,
}: {
  modeTypes: ModeType[];
  title: string;
  description: string;
  ogDescription: string;
}) {
  const modesElements = useMemo(() => {
    const modeEls: JSX.Element[] = [];
    for (const modeType of modeTypes) {
      const modeProps = modes[modeType];

      modeEls.push(
        <div className="flex flex-row space-x-1 items-center border border-base-700 rounded-sm">
          <img className="h-8" src={modeProps.icon} />
          <div>
            <h3 className="text-4xl text-base-400">{modeProps.name}</h3>
          </div>
        </div>
      );
    }

    return modeEls;
  }, [modeTypes]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={ogDescription} />
      </Helmet>
      <div className="grid grid-cols-2 gap-4">{modesElements}</div>
    </>
  );
}
