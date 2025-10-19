import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import iconDark from '@/icon-dark.png';
import iconLight from '@/icon-light.png';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'theme-o-rama';
import { useLocalStorage } from 'usehooks-ts';
import { TopNav } from './Nav';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'theme-o-rama-sidebar-collapsed';

type LayoutProps = PropsWithChildren<object> & {
  transparentBackground?: boolean;
};

export function FullLayout(props: LayoutProps) {
  const { currentTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    SIDEBAR_COLLAPSED_STORAGE_KEY,
    false,
  );

  const walletIcon = (
    <Link to='/' className={`flex items-center gap-2 font-semibold font-heading`}>
      <img
        src={currentTheme?.mostLike === 'light' ? iconDark : iconLight}
        className='h-6 w-6'
        alt='Theme icon'
      />

      <span
        className={`text-lg transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
        }`}
      >
        Theme-o-rama
      </span>
    </Link>
  );

  const walletIconWithTooltip = isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to='/' className={`flex items-center gap-2 font-semibold font-heading`}>
          <img
            src={currentTheme?.mostLike === 'light' ? iconDark : iconLight}
            className='h-6 w-6'
            alt='Theme icon'
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent side='right'>Theme-o-rama</TooltipContent>
    </Tooltip>
  ) : (
    walletIcon
  );

  return (
    <TooltipProvider>
      <div className='grid h-screen w-screen md:grid-cols-[auto_1fr]'>
        <div
          className={`hidden md:flex flex-col transition-all duration-300 ${
            isCollapsed ? 'w-[60px]' : 'w-[250px]'
          } ${currentTheme?.sidebar ? '' : 'border-r bg-muted/40'}`}
          style={
            currentTheme?.sidebar
              ? {
                  borderRight: '1px solid var(--sidebar-border)',
                  background: 'var(--sidebar-background)',
                  backdropFilter: 'var(--sidebar-backdrop-filter)',
                  WebkitBackdropFilter: 'var(--sidebar-backdrop-filter-webkit)',
                }
              : {}
          }
          role='complementary'
          aria-label='Sidebar navigation'
        >
          <div className='bg-background flex h-full max-h-screen flex-col gap-2'>
            <div className='flex h-14 items-center pt-2 px-5 justify-between'>
              <>
                {!isCollapsed && walletIconWithTooltip}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className='text-muted-foreground hover:text-primary transition-colors'
                      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? (
                        <PanelLeft className='h-5 w-5' aria-hidden='true' />
                      ) : (
                        <PanelLeftClose className='h-5 w-5' aria-hidden='true' />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side='right' role='tooltip'>
                    {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  </TooltipContent>
                </Tooltip>
              </>
            </div>

            <div className='flex-1 flex flex-col justify-between pb-4'>
              <div
                className={`grid items-start px-3 text-sm font-medium font-body ${
                  isCollapsed ? 'justify-center' : 'px-3'
                }`}
              >
                <TopNav isCollapsed={isCollapsed} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col h-screen overflow-hidden ${
            props.transparentBackground ? 'bg-transparent' : 'bg-background'
          }`}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div
            className='bg-background'
            style={{
              height: 'env(safe-area-inset-top)',
            }}
          />
          {props.children}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function Layout(props: LayoutProps) {
  return <FullLayout {...props} />;
}
