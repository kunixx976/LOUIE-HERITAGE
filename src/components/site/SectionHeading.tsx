import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal>
      <div
        className={
          align === "center"
            ? "mx-auto max-w-2xl text-center"
            : "flex flex-wrap items-end justify-between gap-6"
        }
      >
        <div className={align === "center" ? "" : "max-w-xl"}>
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h2 className="text-3xl leading-[1.15] md:text-[2.6rem]">{title}</h2>
          {description ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    </Reveal>
  );
}
