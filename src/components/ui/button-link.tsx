import { Button } from './button';

type BaseButtonProps = Parameters<typeof Button>[0];
type ButtonProps = Omit<BaseButtonProps, 'asChild'>; // it wouldn't make sense to pass asChild to Link

interface ButtonLinkProps extends ButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function ButtonLink({
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Button asChild {...props}>
      <a href={href}>{children}</a>
    </Button>
  );
}
