import { Flowbite, Navbar, Button } from 'flowbite-react'
import { Toaster } from 'react-hot-toast'

import GitHubIcon from '../icons/GitHubIcon'
import MainSvg from '../assets/main.svg'

type LayoutProps = {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flowbite>
      <div className='bg-[#97afb9] dark:bg-gray-800'>
        <Navbar
          fluid
          rounded
          className='mx-auto max-w-3xl bg-[#97afb9] dark:bg-gray-800'
        >
          <Navbar.Brand href='https://ccimg.rwx222.com/'>
            <img src={MainSvg} className='h-9' alt='Crop & Compress Logo' />

            <span className='pl-3 self-center whitespace-nowrap text-xl font-semibold dark:text-white'>{`ccimg`}</span>
          </Navbar.Brand>

          <div className='flex md:order-2'>
            <Button
              size={'sm'}
              as='a'
              href='https://github.com/rwx222/ccimg'
              target='_blanks'
            >
              <GitHubIcon className='xs:mr-1' width='20' height='20' />
              <span className='hidden xs:inline text-base leading-5 font-normal'>{`GitHub`}</span>
            </Button>
          </div>
        </Navbar>
      </div>

      {children}
      <Toaster />
    </Flowbite>
  )
}

export default Layout
