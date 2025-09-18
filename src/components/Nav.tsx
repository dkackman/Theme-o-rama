import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AppWindow,
  Component,
  Info,
  Pencil,
  SwatchBook,
  Table,
} from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from './ui/separator';

interface NavProps {
  isCollapsed?: boolean;
}

export function TopNav({ isCollapsed }: NavProps) {
  const className = isCollapsed ? 'h-5 w-5' : 'h-4 w-4';

  // Enhanced Tauri detection - same as Design page
  const isTauriEnvironment =
    typeof window !== 'undefined' &&
    (!!(window as any).__TAURI__ ||
      !!(window as any).__TAURI_INTERNALS__ ||
      typeof (window as any).__TAURI_PLUGIN_INTERNALS__ !== 'undefined' ||
      typeof (window as any).__TAURI_METADATA__ !== 'undefined');

  return (
    <nav
      className={`grid font-medium font-body ${isCollapsed ? 'gap-2' : ''}`}
      role='navigation'
      aria-label='Main navigation'
    >
      <Separator className='mb-3' role='presentation' />
      <NavLink
        url={'/'}
        isCollapsed={isCollapsed}
        message='Themes'
        ariaCurrent='page'
      >
        <SwatchBook className={className} aria-hidden='true' />
      </NavLink>
      <NavLink
        url={'/components'}
        isCollapsed={isCollapsed}
        message='Components'
      >
        <Component className={className} />
      </NavLink>
      <NavLink url={'/tables'} isCollapsed={isCollapsed} message='Tables'>
        <Table className={className} />
      </NavLink>
      <NavLink url={'/dialogs'} isCollapsed={isCollapsed} message='Dialogs'>
        <AppWindow className={className} />
      </NavLink>
      {/* Only show Design link in Tauri environment */}
      {isTauriEnvironment && (
        <NavLink url={'/design'} isCollapsed={isCollapsed} message='Design'>
          <Pencil className={className} />
        </NavLink>
      )}
      <NavLink url={'/about'} isCollapsed={isCollapsed} message='About'>
        <Info className={className} />
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
