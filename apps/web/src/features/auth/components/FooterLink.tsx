interface Props {
    text: string;
    action: string;
    href: string;
  }
  
  export default function FooterLink({
    text,
    action,
    href,
  }: Props) {
    return (
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {text}{" "}
        <a
          href={href}
          className="font-semibold text-[var(--color-primary)]"
        >
          {action}
        </a>
      </p>
    );
  }