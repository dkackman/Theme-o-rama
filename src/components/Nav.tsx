import {
  AppWindow,
  Component,
  CurlyBraces,
  Info,
  SwatchBook,
  Table,
  Wallpaper,
} from 'lucide-react';
import { NavLink } from './NavLink';
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
        url={'/json-editor'}
        isCollapsed={isCollapsed}
        message='JSON Editor'
      >
        <CurlyBraces className={className} />
      </NavLink>
      <NavLink
        url={'/background-editor'}
        isCollapsed={isCollapsed}
        message='Background'
      >
        <Wallpaper className={className} />
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
      <NavLink url={'/about'} isCollapsed={isCollapsed} message='About'>
        <Info className={className} />
      </NavLink>
    </nav>
  );
}
