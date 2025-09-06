import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import {
  Component,
  Table,
  Image,
  SwatchBook,
} from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from './ui/separator';

interface NavProps {
  isCollapsed?: boolean;
}

export function TopNav({ isCollapsed }: NavProps) {
  const className = isCollapsed ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <nav
      className={`grid font-medium font-body ${isCollapsed ? 'gap-2' : ''}`}
      role='navigation'
      aria-label={t`Main navigation`}
    >
      <Separator className='mb-3' role='presentation' />

      <NavLink
        url={'/'}
        isCollapsed={isCollapsed}
        message={<Trans>Themes</Trans>}
        ariaCurrent='page'
      >
        <SwatchBook className={className} aria-hidden='true' />
      </NavLink>


      <NavLink
        url={'/components'}
        isCollapsed={isCollapsed}
        message={<Trans>Components</Trans>}
      >
        <Component className={className} />
      </NavLink>

      <NavLink
        url={'/tables'}
        isCollapsed={isCollapsed}
        message={<Trans>Tables</Trans>}
      >
        <Table className={className} />
      </NavLink>

        <NavLink
          url={'/background-options'}
          isCollapsed={isCollapsed}
          message={<Trans>Backgrounds</Trans>}
        >
          <Image className={className} />
        </NavLink>
    </nav>
  );
}

interface NavLinkProps extends PropsWithChildren {
  url: string | (() => void);
  isCollapsed?: boolean;
  message: React.ReactNode;
  customTooltip?: React.ReactNode;
  ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
}

function NavLink({
  url,
  children,
  isCollapsed,
  message,
  customTooltip,
  ariaCurrent,
}: NavLinkProps) {
  const location = useLocation();
  const isActive =
    typeof url === 'string' &&
    (location.pathname === url ||
      (url !== '/' && location.pathname.startsWith(url)));

  const baseClassName = `flex items-center gap-3 rounded-lg py-1.5 transition-all ${
    isCollapsed ? 'justify-center' : 'px-2'
  } text-lg md:text-base`;

  const className = isActive
    ? `${baseClassName} text-primary border-primary`
    : `${baseClassName} text-muted-foreground hover:text-primary`;

  const activeStyle = isActive
    ? { backgroundColor: 'var(--nav-active-bg)' }
    : {};

  const link =
    typeof url === 'string' ? (
      <Link
        to={url}
        className={className}
        style={activeStyle}
        aria-current={isActive ? 'page' : ariaCurrent}
        aria-label={isCollapsed ? message?.toString() : undefined}
      >
        {children}
        {!isCollapsed && message}
      </Link>
    ) : (
      <button
        type='button'
        onClick={url}
        className={className}
        style={activeStyle}
        aria-label={isCollapsed ? message?.toString() : undefined}
      >
        {children}
        {!isCollapsed && message}
      </button>
    );

  if (isCollapsed || customTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side='right' role='tooltip' aria-live='polite'>
          {customTooltip || message}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
